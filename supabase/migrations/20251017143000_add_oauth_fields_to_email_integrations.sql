-- ============================================
-- ADD OAUTH2 FIELDS TO email_integrations
-- ============================================
-- Adiciona campos necessários para OAuth2 (Google, Outlook)

ALTER TABLE public.email_integrations 
ADD COLUMN IF NOT EXISTS access_token TEXT,
ADD COLUMN IF NOT EXISTS refresh_token TEXT,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS oauth_scopes TEXT[];

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON COLUMN public.email_integrations.access_token IS 'Token de acesso OAuth2 (criptografado)';
COMMENT ON COLUMN public.email_integrations.refresh_token IS 'Token de refresh OAuth2 (criptografado)';
COMMENT ON COLUMN public.email_integrations.token_expires_at IS 'Data de expiração do access_token';
COMMENT ON COLUMN public.email_integrations.oauth_scopes IS 'Escopos autorizados pelo usuário';
