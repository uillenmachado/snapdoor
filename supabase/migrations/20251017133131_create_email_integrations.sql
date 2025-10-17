-- ============================================
-- CREATE TABLE: email_integrations
-- ============================================
-- Tabela para armazenar integrações de email dos usuários
-- Permite múltiplas integrações, mas apenas uma ativa por vez

CREATE TABLE IF NOT EXISTS public.email_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Configurações básicas
  provider TEXT NOT NULL CHECK (provider IN ('resend', 'gmail', 'outlook', 'smtp')),
  email TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT false,
  
  -- Resend
  api_key TEXT,
  
  -- SMTP
  smtp_host TEXT,
  smtp_port INTEGER,
  smtp_username TEXT,
  smtp_password TEXT,
  
  -- Metadata
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Constraints
  UNIQUE(user_id, email),
  CHECK (
    (provider = 'resend' AND api_key IS NOT NULL) OR
    (provider = 'smtp' AND smtp_host IS NOT NULL AND smtp_port IS NOT NULL AND smtp_username IS NOT NULL AND smtp_password IS NOT NULL) OR
    (provider IN ('gmail', 'outlook'))
  )
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_email_integrations_user_id 
  ON public.email_integrations(user_id);

CREATE INDEX IF NOT EXISTS idx_email_integrations_active 
  ON public.email_integrations(user_id, is_active) 
  WHERE is_active = true;

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE public.email_integrations ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver apenas suas próprias integrações
CREATE POLICY "Users can view own email integrations"
  ON public.email_integrations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Usuários podem criar suas próprias integrações
CREATE POLICY "Users can insert own email integrations"
  ON public.email_integrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas próprias integrações
CREATE POLICY "Users can update own email integrations"
  ON public.email_integrations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Usuários podem deletar suas próprias integrações
CREATE POLICY "Users can delete own email integrations"
  ON public.email_integrations
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTION: Garantir apenas uma integração ativa por usuário
-- ============================================

CREATE OR REPLACE FUNCTION ensure_single_active_email_integration()
RETURNS TRIGGER AS $$
BEGIN
  -- Se estiver ativando uma integração
  IF NEW.is_active = true THEN
    -- Desativar todas as outras integrações do usuário
    UPDATE public.email_integrations
    SET is_active = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_active = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_active_email_integration
  BEFORE INSERT OR UPDATE ON public.email_integrations
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_active_email_integration();

-- ============================================
-- FUNCTION: Atualizar updated_at automaticamente
-- ============================================

CREATE OR REPLACE FUNCTION update_email_integrations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_email_integrations_updated_at
  BEFORE UPDATE ON public.email_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_email_integrations_updated_at();

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON TABLE public.email_integrations IS 'Integrações de email dos usuários para envio de mensagens através do CRM';
COMMENT ON COLUMN public.email_integrations.provider IS 'Provedor de email: resend, gmail, outlook, smtp';
COMMENT ON COLUMN public.email_integrations.is_active IS 'Apenas uma integração pode estar ativa por usuário';
COMMENT ON COLUMN public.email_integrations.is_verified IS 'Se o email/domínio foi verificado no provedor';
