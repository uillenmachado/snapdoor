-- =====================================================
-- SISTEMA DE CRÉDITOS PARA API HUNTER.IO
-- Cobra 3x o custo da requisição
-- =====================================================

-- Tabela de créditos do usuário
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 10, -- 10 créditos iniciais gratuitos
  total_purchased INTEGER DEFAULT 0,
  total_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tabela de histórico de consumo
CREATE TABLE IF NOT EXISTS credit_usage_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL, -- 'domain_search', 'email_finder', 'email_verifier', etc.
  credits_used INTEGER NOT NULL,
  domain TEXT,
  email TEXT,
  query_params JSONB,
  result_summary JSONB,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pacotes de créditos
CREATE TABLE IF NOT EXISTS credit_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price_brl DECIMAL(10, 2) NOT NULL,
  discount_percentage INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de transações de compra de créditos
CREATE TABLE IF NOT EXISTS credit_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES credit_packages(id),
  credits_purchased INTEGER NOT NULL,
  amount_paid_brl DECIMAL(10, 2) NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  stripe_payment_id TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Índices para performance
CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX idx_credit_usage_history_user_id ON credit_usage_history(user_id);
CREATE INDEX idx_credit_usage_history_created_at ON credit_usage_history(created_at DESC);
CREATE INDEX idx_credit_purchases_user_id ON credit_purchases(user_id);
CREATE INDEX idx_credit_purchases_status ON credit_purchases(payment_status);

-- RLS (Row Level Security)
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para user_credits
CREATE POLICY "Users can view their own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON user_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas de segurança para credit_usage_history
CREATE POLICY "Users can view their own usage history"
  ON credit_usage_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage history"
  ON credit_usage_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas de segurança para credit_packages
CREATE POLICY "Anyone can view active packages"
  ON credit_packages FOR SELECT
  USING (is_active = true);

-- Políticas de segurança para credit_purchases
CREATE POLICY "Users can view their own purchases"
  ON credit_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases"
  ON credit_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Função para debitar créditos
CREATE OR REPLACE FUNCTION debit_credits(
  p_user_id UUID,
  p_credits INTEGER,
  p_operation_type TEXT,
  p_domain TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_query_params JSONB DEFAULT NULL,
  p_result_summary JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_credits INTEGER;
BEGIN
  -- Verificar créditos disponíveis
  SELECT credits INTO v_current_credits
  FROM user_credits
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- Se não tem registro, criar com créditos iniciais
  IF NOT FOUND THEN
    INSERT INTO user_credits (user_id, credits)
    VALUES (p_user_id, 10);
    v_current_credits := 10;
  END IF;

  -- Verificar se tem créditos suficientes
  IF v_current_credits < p_credits THEN
    RAISE EXCEPTION 'Créditos insuficientes. Disponível: %, Necessário: %', v_current_credits, p_credits;
  END IF;

  -- Debitar créditos
  UPDATE user_credits
  SET 
    credits = credits - p_credits,
    total_used = total_used + p_credits,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Registrar no histórico
  INSERT INTO credit_usage_history (
    user_id,
    operation_type,
    credits_used,
    domain,
    email,
    query_params,
    result_summary,
    success
  ) VALUES (
    p_user_id,
    p_operation_type,
    p_credits,
    p_domain,
    p_email,
    p_query_params,
    p_result_summary,
    true
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para adicionar créditos (compra ou bônus)
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_credits INTEGER,
  p_purchase_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verificar se usuário já tem registro
  IF EXISTS (SELECT 1 FROM user_credits WHERE user_id = p_user_id) THEN
    -- Atualizar créditos existentes
    UPDATE user_credits
    SET 
      credits = credits + p_credits,
      total_purchased = total_purchased + p_credits,
      updated_at = NOW()
    WHERE user_id = p_user_id;
  ELSE
    -- Criar novo registro
    INSERT INTO user_credits (user_id, credits, total_purchased)
    VALUES (p_user_id, p_credits, p_credits);
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inserir pacotes de créditos padrão
INSERT INTO credit_packages (name, credits, price_brl, discount_percentage) VALUES
  ('Starter', 50, 47.00, 0),
  ('Growth', 150, 127.00, 10),
  ('Pro', 500, 397.00, 20),
  ('Enterprise', 2000, 1497.00, 25)
ON CONFLICT DO NOTHING;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_packages_updated_at
  BEFORE UPDATE ON credit_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE user_credits IS 'Saldo de créditos de cada usuário para uso da API';
COMMENT ON TABLE credit_usage_history IS 'Histórico de consumo de créditos por usuário';
COMMENT ON TABLE credit_packages IS 'Pacotes de créditos disponíveis para compra';
COMMENT ON TABLE credit_purchases IS 'Transações de compra de créditos';

COMMENT ON FUNCTION debit_credits IS 'Debita créditos do usuário e registra no histórico';
COMMENT ON FUNCTION add_credits IS 'Adiciona créditos ao saldo do usuário';
