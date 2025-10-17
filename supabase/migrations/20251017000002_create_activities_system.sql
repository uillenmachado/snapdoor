-- ============================================
-- MIGRATION: Sistema de Atividades e Email Tracking
-- ============================================
-- Criado em: 17/10/2025
-- Objetivo: Rastrear emails, ligações e todas as interações com oportunidades

-- 1. REMOVER tabela existente se houver (para evitar conflitos)
DROP TABLE IF EXISTS public.activities CASCADE;

-- 2. Criar tabela de atividades
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  
  -- Tipo de atividade
  type TEXT NOT NULL CHECK (type IN (
    'email',           -- Email enviado/recebido
    'call',            -- Ligação telefônica
    'meeting',         -- Reunião
    'note',            -- Nota/anotação
    'task',            -- Tarefa
    'linkedin_message' -- Mensagem do LinkedIn
  )),
  
  -- Direção (para emails e mensagens)
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  
  -- Dados da atividade (JSONB flexível)
  data JSONB DEFAULT '{}',
  /* Estrutura para EMAIL: {
    "subject": "Proposta comercial",
    "body_html": "<p>Olá João!</p>",
    "body_text": "Olá João!",
    "to": ["joao@acme.com"],
    "cc": [],
    "bcc": [],
    "from": "comercial@snapdoor.com.br",
    "attachments": [],
    "message_id": "resend-message-id-123",
    "thread_id": "uuid-da-thread"
  }
  
  Estrutura para CALL: {
    "duration": 900,
    "phone": "+5511999999999",
    "recording_url": "https://...",
    "notes": "Cliente interessado em fechar"
  }
  
  Estrutura para NOTE: {
    "content": "Cliente pediu desconto de 10%",
    "attachments": []
  }
  */
  
  -- Status da atividade
  status TEXT DEFAULT 'completed',
  /* Status possíveis:
    - Para emails: 'queued', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'
    - Para calls: 'scheduled', 'completed', 'missed', 'cancelled'
    - Para tasks: 'pending', 'completed', 'cancelled'
  */
  
  -- Rastreamento específico para emails
  opened_at TIMESTAMPTZ,         -- Quando o email foi aberto
  opened_count INTEGER DEFAULT 0, -- Quantas vezes foi aberto
  clicked_at TIMESTAMPTZ,         -- Quando algum link foi clicado
  clicked_count INTEGER DEFAULT 0,-- Quantas vezes links foram clicados
  bounced_at TIMESTAMPTZ,         -- Se o email retornou (bounce)
  bounce_reason TEXT,             -- Motivo do bounce
  
  -- Metadata temporal
  scheduled_for TIMESTAMPTZ,      -- Para atividades agendadas
  completed_at TIMESTAMPTZ,       -- Quando foi completada
  duration_seconds INTEGER,       -- Duração (para calls/meetings)
  
  -- Timestamps padrão
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Criar índices para performance
CREATE INDEX idx_activities_deal_id 
  ON public.activities(deal_id) 
  WHERE deal_id IS NOT NULL;

CREATE INDEX idx_activities_lead_id 
  ON public.activities(lead_id) 
  WHERE lead_id IS NOT NULL;

CREATE INDEX idx_activities_company_id 
  ON public.activities(company_id) 
  WHERE company_id IS NOT NULL;

CREATE INDEX idx_activities_user_id 
  ON public.activities(user_id);

CREATE INDEX idx_activities_type 
  ON public.activities(type);

CREATE INDEX idx_activities_created_at 
  ON public.activities(created_at DESC);

CREATE INDEX idx_activities_status 
  ON public.activities(status);

-- Índice composto para buscar emails por status de abertura
CREATE INDEX idx_activities_email_tracking 
  ON public.activities(type, opened_at, clicked_at);

-- 4. Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS trigger_activities_updated_at ON public.activities;
DROP FUNCTION IF EXISTS update_activities_updated_at();

CREATE FUNCTION update_activities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION update_activities_updated_at();

-- 5. Row Level Security (RLS)
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can create own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can update own activities" ON public.activities;
DROP POLICY IF EXISTS "Users can delete own activities" ON public.activities;

-- Criar políticas novas
CREATE POLICY "Users can view own activities"
  ON public.activities
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuários podem criar suas próprias atividades
CREATE POLICY "Users can create own activities"
  ON public.activities
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar suas próprias atividades
CREATE POLICY "Users can update own activities"
  ON public.activities
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar suas próprias atividades
CREATE POLICY "Users can delete own activities"
  ON public.activities
  FOR DELETE
  USING (auth.uid() = user_id);

-- 5. Comentários para documentação
COMMENT ON TABLE public.activities IS 'Registro de todas as atividades (emails, ligações, reuniões, notas) relacionadas a deals, leads e empresas';
COMMENT ON COLUMN public.activities.type IS 'Tipo da atividade: email, call, meeting, note, task, linkedin_message';
COMMENT ON COLUMN public.activities.direction IS 'Direção da comunicação: inbound (recebido) ou outbound (enviado)';
COMMENT ON COLUMN public.activities.data IS 'Dados flexíveis da atividade em formato JSONB';
COMMENT ON COLUMN public.activities.status IS 'Status da atividade (varia por tipo)';
COMMENT ON COLUMN public.activities.opened_at IS 'Timestamp de quando o email foi aberto pela primeira vez';
COMMENT ON COLUMN public.activities.opened_count IS 'Número de vezes que o email foi aberto';
COMMENT ON COLUMN public.activities.clicked_at IS 'Timestamp de quando algum link do email foi clicado';
COMMENT ON COLUMN public.activities.clicked_count IS 'Número de vezes que links foram clicados';

-- 6. Função helper para buscar atividades de um deal
DROP FUNCTION IF EXISTS get_deal_activities(UUID);

CREATE FUNCTION get_deal_activities(deal_uuid UUID)
RETURNS TABLE (
  id UUID,
  type TEXT,
  direction TEXT,
  data JSONB,
  status TEXT,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.type,
    a.direction,
    a.data,
    a.status,
    a.opened_at,
    a.clicked_at,
    a.created_at
  FROM public.activities a
  WHERE a.deal_id = deal_uuid
  ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. View para analytics de emails
DROP VIEW IF EXISTS email_analytics;

CREATE VIEW email_analytics AS
SELECT 
  user_id,
  deal_id,
  COUNT(*) as total_emails_sent,
  COUNT(opened_at) as emails_opened,
  COUNT(clicked_at) as emails_clicked,
  ROUND(COUNT(opened_at)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as open_rate,
  ROUND(COUNT(clicked_at)::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as click_rate,
  AVG(opened_count) as avg_opens_per_email,
  MAX(created_at) as last_email_sent
FROM public.activities
WHERE type = 'email' AND direction = 'outbound'
GROUP BY user_id, deal_id;

COMMENT ON VIEW email_analytics IS 'Analytics de performance de emails por usuário e deal';

-- ============================================
-- FIM DA MIGRATION
-- ============================================
