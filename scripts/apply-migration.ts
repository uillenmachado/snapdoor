// Script para aplicar migração do sistema de créditos diretamente no Supabase
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cfydbvrzjtbcrbzimfjm.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeWRidnJ6anRiY3JiemltZmptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA4OTMwOSwiZXhwIjoyMDc1NjY1MzA5fQ.AwCiWyYu8loceV-MPXiwRBySJ5q3f2fBnMwEDyXZ9CI';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const migrationSQL = `
-- =====================================================
-- SISTEMA DE CRÉDITOS PARA API HUNTER.IO
-- Cobra 3x o custo da requisição
-- =====================================================

-- Habilitar extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de créditos do usuário
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 10,
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
  operation_type TEXT NOT NULL,
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
  payment_status TEXT DEFAULT 'pending',
  stripe_payment_id TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_history_user_id ON credit_usage_history(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_history_created_at ON credit_usage_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_user_id ON credit_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_purchases_status ON credit_purchases(payment_status);

-- RLS (Row Level Security)
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_purchases ENABLE ROW LEVEL SECURITY;

-- Drop políticas se existirem
DROP POLICY IF EXISTS "Users can view their own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can update their own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can view their own usage history" ON credit_usage_history;
DROP POLICY IF EXISTS "Users can insert their own usage history" ON credit_usage_history;
DROP POLICY IF EXISTS "Anyone can view active packages" ON credit_packages;
DROP POLICY IF EXISTS "Users can view their own purchases" ON credit_purchases;
DROP POLICY IF EXISTS "Users can insert their own purchases" ON credit_purchases;

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

DROP TRIGGER IF EXISTS update_user_credits_updated_at ON user_credits;
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_credit_packages_updated_at ON credit_packages;
CREATE TRIGGER update_credit_packages_updated_at
  BEFORE UPDATE ON credit_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
`;

async function runMigration() {
  console.log('🚀 Iniciando migração do sistema de créditos...\n');

  try {
    // Executar migração
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      console.error('❌ Erro ao executar migração:', error.message);
      
      // Tentar executar via SQL direto
      console.log('📝 Tentando executar SQL diretamente...\n');
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        },
        body: JSON.stringify({ sql: migrationSQL })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    console.log('✅ Migração executada com sucesso!\n');
    console.log('📊 Tabelas criadas:');
    console.log('  - user_credits');
    console.log('  - credit_usage_history');
    console.log('  - credit_packages');
    console.log('  - credit_purchases\n');
    console.log('🔧 Funções criadas:');
    console.log('  - debit_credits()');
    console.log('  - add_credits()\n');
    console.log('🎁 Pacotes inseridos:');
    console.log('  - Starter: 50 créditos por R$ 47');
    console.log('  - Growth: 150 créditos por R$ 127');
    console.log('  - Pro: 500 créditos por R$ 397');
    console.log('  - Enterprise: 2000 créditos por R$ 1.497\n');
    console.log('🎉 Sistema de créditos pronto para uso!');

  } catch (err) {
    console.error('❌ Erro fatal:', err);
    process.exit(1);
  }
}

runMigration();
