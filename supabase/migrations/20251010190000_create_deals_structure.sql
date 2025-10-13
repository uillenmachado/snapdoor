-- =====================================================
-- REESTRUTURAÇÃO: LEADS vs NEGÓCIOS (estilo Pipedrive)
-- Leads = PESSOAS/CONTATOS
-- Deals = NEGÓCIOS/OPORTUNIDADES
-- =====================================================

-- 1. Criar tabela de NEGÓCIOS (deals)
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pipeline_id UUID NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
  stage_id UUID NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
  
  -- Informações básicas do negócio
  title TEXT NOT NULL,
  value DECIMAL(15, 2) DEFAULT 0,
  currency TEXT DEFAULT 'BRL',
  
  -- Empresa/Organização
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  company_name TEXT,
  
  -- Status e probabilidade
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost')),
  probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  
  -- Datas importantes
  expected_close_date DATE,
  closed_date TIMESTAMPTZ,
  
  -- Responsável
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Campos adicionais
  description TEXT,
  lost_reason TEXT,
  source TEXT,
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}'::jsonb,
  
  -- Posição no pipeline (drag and drop)
  position INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Índices para performance
  CONSTRAINT deals_title_not_empty CHECK (length(trim(title)) > 0)
);

-- 2. Criar tabela pivot: PARTICIPANTES DO NEGÓCIO (deal_participants)
-- Relacionamento M:N entre Deals e Leads
CREATE TABLE IF NOT EXISTS public.deal_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Papel da pessoa no negócio
  role TEXT DEFAULT 'participant' CHECK (role IN (
    'decision_maker',    -- Tomador de decisão
    'influencer',        -- Influenciador
    'user',             -- Usuário final
    'technical',        -- Avaliador técnico
    'champion',         -- Defensor interno
    'participant'       -- Participante geral
  )),
  
  -- Se é o contato principal
  is_primary BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraint: combinação única de deal + lead
  UNIQUE(deal_id, lead_id)
);

-- 3. Adicionar campos ao profile para onboarding
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS job_role TEXT,
  ADD COLUMN IF NOT EXISTS company_size TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS goals TEXT[],
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- 4. Índices para performance
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON public.deals(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_pipeline_id ON public.deals(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_deals_stage_id ON public.deals(stage_id);
CREATE INDEX IF NOT EXISTS idx_deals_company_id ON public.deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON public.deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON public.deals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deals_expected_close_date ON public.deals(expected_close_date);

CREATE INDEX IF NOT EXISTS idx_deal_participants_deal_id ON public.deal_participants(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_participants_lead_id ON public.deal_participants(lead_id);
CREATE INDEX IF NOT EXISTS idx_deal_participants_user_id ON public.deal_participants(user_id);

-- 5. Triggers para updated_at
CREATE OR REPLACE FUNCTION update_deals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION update_deals_updated_at();

CREATE OR REPLACE FUNCTION update_deal_participants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_deal_participants_updated_at
  BEFORE UPDATE ON public.deal_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_deal_participants_updated_at();

-- 6. RLS (Row Level Security)
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_participants ENABLE ROW LEVEL SECURITY;

-- Policies para deals
CREATE POLICY "Users can view their own deals"
  ON public.deals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deals"
  ON public.deals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deals"
  ON public.deals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deals"
  ON public.deals FOR DELETE
  USING (auth.uid() = user_id);

-- Policies para deal_participants
CREATE POLICY "Users can view their deal participants"
  ON public.deal_participants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their deal participants"
  ON public.deal_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their deal participants"
  ON public.deal_participants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their deal participants"
  ON public.deal_participants FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Comentários para documentação
COMMENT ON TABLE public.deals IS 'Negócios/Oportunidades de vendas (estilo Pipedrive)';
COMMENT ON TABLE public.deal_participants IS 'Participantes do negócio (relacionamento M:N entre deals e leads)';

COMMENT ON COLUMN public.deals.title IS 'Título/nome do negócio (ex: "Projeto de Marketing Digital para Acme Corp")';
COMMENT ON COLUMN public.deals.value IS 'Valor monetário do negócio';
COMMENT ON COLUMN public.deals.probability IS 'Probabilidade de fechamento (0-100%)';
COMMENT ON COLUMN public.deals.expected_close_date IS 'Data esperada de fechamento';
COMMENT ON COLUMN public.deals.status IS 'Status: open (ativo), won (ganho), lost (perdido)';

COMMENT ON COLUMN public.deal_participants.role IS 'Papel da pessoa no negócio (decision_maker, influencer, user, etc)';
COMMENT ON COLUMN public.deal_participants.is_primary IS 'Se é o contato principal do negócio';

COMMENT ON COLUMN public.profiles.job_role IS 'Cargo/função do usuário (capturado no onboarding)';
COMMENT ON COLUMN public.profiles.company_size IS 'Tamanho da empresa do usuário (1, 2-5, 6-10, 11-50, 50+)';
COMMENT ON COLUMN public.profiles.goals IS 'Metas/objetivos do usuário com o CRM';
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Se completou o fluxo de boas-vindas';
