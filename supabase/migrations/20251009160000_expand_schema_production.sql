-- =====================================================
-- EXPANSÃO DO SCHEMA PARA PRODUÇÃO
-- SnapDoor CRM - Schema Completo v2.0
-- =====================================================

-- ============= PROFILES TABLE EXPANSION =============
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_title TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_type TEXT DEFAULT 'essential' CHECK (plan_type IN ('essential', 'advanced', 'professional'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days');
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_id TEXT;

-- ============= PIPELINES TABLE EXPANSION =============
ALTER TABLE public.pipelines ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.pipelines ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;
ALTER TABLE public.pipelines ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- ============= LEADS TABLE EXPANSION =============
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS linkedin_profile_data JSONB;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_contact_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS notes_count INTEGER DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS activities_count INTEGER DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;

-- ============= NOTES TABLE EXPANSION =============
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false;
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============= ACTIVITIES TABLE EXPANSION =============
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
ALTER TABLE public.activities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Expandir tipos de atividade
ALTER TABLE public.activities DROP CONSTRAINT IF EXISTS activities_type_check;
ALTER TABLE public.activities ADD CONSTRAINT activities_type_check 
  CHECK (type IN ('message', 'email', 'call', 'meeting', 'comment', 'linkedin_visit', 'note', 'task', 'stage_change'));

-- ============= NOVA TABELA: LINKEDIN IMPORTS =============
CREATE TABLE IF NOT EXISTS public.linkedin_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  linkedin_url TEXT NOT NULL,
  profile_data JSONB NOT NULL,
  import_status TEXT DEFAULT 'pending' CHECK (import_status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

ALTER TABLE public.linkedin_imports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own imports"
  ON public.linkedin_imports FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own imports"
  ON public.linkedin_imports FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============= NOVA TABELA: ANALYTICS EVENTS =============
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own events"
  ON public.analytics_events FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============= NOVA TABELA: WEBHOOKS =============
CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT true,
  secret_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own webhooks"
  ON public.webhooks FOR ALL
  USING (user_id = auth.uid());

-- ============= NOVA TABELA: AUTOMATIONS =============
CREATE TABLE IF NOT EXISTS public.automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB NOT NULL,
  actions JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  execution_count INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own automations"
  ON public.automations FOR ALL
  USING (user_id = auth.uid());

-- ============= ÍNDICES DE PERFORMANCE =============

-- Leads indices
CREATE INDEX IF NOT EXISTS idx_leads_user_stage ON public.leads(user_id, stage_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_created ON public.leads(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_tags ON public.leads USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_leads_linkedin_data ON public.leads USING GIN(linkedin_profile_data);
CREATE INDEX IF NOT EXISTS idx_leads_archived ON public.leads(user_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(user_id, lead_score DESC);

-- Activities indices
CREATE INDEX IF NOT EXISTS idx_activities_lead_date ON public.activities(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_user_type ON public.activities(user_id, type);
CREATE INDEX IF NOT EXISTS idx_activities_scheduled ON public.activities(user_id, scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_activities_pending ON public.activities(user_id, completed) WHERE NOT completed;

-- Notes indices
CREATE INDEX IF NOT EXISTS idx_notes_lead_date ON public.notes(lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_user ON public.notes(user_id, created_at DESC);

-- LinkedIn imports indices
CREATE INDEX IF NOT EXISTS idx_linkedin_imports_user ON public.linkedin_imports(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_linkedin_imports_status ON public.linkedin_imports(user_id, import_status);

-- Analytics indices
CREATE INDEX IF NOT EXISTS idx_analytics_user_type ON public.analytics_events(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON public.analytics_events(user_id, created_at DESC);

-- ============= TRIGGERS E FUNÇÕES =============

-- Trigger para atualizar updated_at em notes
CREATE TRIGGER set_updated_at_notes
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para atualizar updated_at em activities
CREATE TRIGGER set_updated_at_activities
  BEFORE UPDATE ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para atualizar updated_at em webhooks
CREATE TRIGGER set_updated_at_webhooks
  BEFORE UPDATE ON public.webhooks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para atualizar updated_at em automations
CREATE TRIGGER set_updated_at_automations
  BEFORE UPDATE ON public.automations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Função para atualizar contadores de leads
CREATE OR REPLACE FUNCTION public.update_lead_counters()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'notes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.leads SET notes_count = notes_count + 1 WHERE id = NEW.lead_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.leads SET notes_count = GREATEST(notes_count - 1, 0) WHERE id = OLD.lead_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'activities' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.leads SET activities_count = activities_count + 1 WHERE id = NEW.lead_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.leads SET activities_count = GREATEST(activities_count - 1, 0) WHERE id = OLD.lead_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para contadores
CREATE TRIGGER update_notes_count
  AFTER INSERT OR DELETE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lead_counters();

CREATE TRIGGER update_activities_count
  AFTER INSERT OR DELETE ON public.activities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lead_counters();

-- Função para criar atividade quando lead muda de stage
CREATE OR REPLACE FUNCTION public.track_stage_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stage_id IS DISTINCT FROM NEW.stage_id THEN
    INSERT INTO public.activities (lead_id, user_id, type, description, metadata)
    VALUES (
      NEW.id,
      NEW.user_id,
      'stage_change',
      'Lead movido para nova etapa',
      jsonb_build_object(
        'old_stage_id', OLD.stage_id,
        'new_stage_id', NEW.stage_id
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_lead_stage_changes
  AFTER UPDATE OF stage_id ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.track_stage_changes();

-- ============= VIEWS PARA ANALYTICS =============

-- View de estatísticas por usuário
CREATE OR REPLACE VIEW public.user_stats AS
SELECT 
  p.id as user_id,
  p.full_name,
  p.plan_type,
  COUNT(DISTINCT l.id) as total_leads,
  COUNT(DISTINCT CASE WHEN l.created_at >= NOW() - INTERVAL '30 days' THEN l.id END) as leads_this_month,
  COUNT(DISTINCT CASE WHEN l.created_at >= NOW() - INTERVAL '7 days' THEN l.id END) as leads_this_week,
  COUNT(DISTINCT n.id) as total_notes,
  COUNT(DISTINCT a.id) as total_activities,
  AVG(l.lead_score) as avg_lead_score
FROM public.profiles p
LEFT JOIN public.leads l ON l.user_id = p.id AND l.is_archived = false
LEFT JOIN public.notes n ON n.user_id = p.id
LEFT JOIN public.activities a ON a.user_id = p.id
GROUP BY p.id, p.full_name, p.plan_type;

-- View de leads por stage
CREATE OR REPLACE VIEW public.leads_by_stage AS
SELECT 
  s.id as stage_id,
  s.name as stage_name,
  s.pipeline_id,
  s.user_id,
  COUNT(l.id) as lead_count,
  AVG(l.lead_score) as avg_score
FROM public.stages s
LEFT JOIN public.leads l ON l.stage_id = s.id AND l.is_archived = false
GROUP BY s.id, s.name, s.pipeline_id, s.user_id;

-- ============= FUNÇÕES DE UTILIDADE =============

-- Função para buscar leads com filtros avançados
CREATE OR REPLACE FUNCTION public.search_leads(
  p_user_id UUID,
  p_search_term TEXT DEFAULT NULL,
  p_stage_id UUID DEFAULT NULL,
  p_tags TEXT[] DEFAULT NULL,
  p_min_score INTEGER DEFAULT NULL,
  p_max_score INTEGER DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  job_title TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  stage_id UUID,
  lead_score INTEGER,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.first_name,
    l.last_name,
    l.company,
    l.job_title,
    l.email,
    l.phone,
    l.linkedin_url,
    l.stage_id,
    l.lead_score,
    l.tags,
    l.created_at
  FROM public.leads l
  WHERE l.user_id = p_user_id
    AND l.is_archived = false
    AND (p_search_term IS NULL OR 
         l.first_name ILIKE '%' || p_search_term || '%' OR
         l.last_name ILIKE '%' || p_search_term || '%' OR
         l.company ILIKE '%' || p_search_term || '%' OR
         l.email ILIKE '%' || p_search_term || '%')
    AND (p_stage_id IS NULL OR l.stage_id = p_stage_id)
    AND (p_tags IS NULL OR l.tags && p_tags)
    AND (p_min_score IS NULL OR l.lead_score >= p_min_score)
    AND (p_max_score IS NULL OR l.lead_score <= p_max_score)
  ORDER BY l.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============= COMENTÁRIOS E DOCUMENTAÇÃO =============

COMMENT ON TABLE public.profiles IS 'Perfis de usuários com informações expandidas';
COMMENT ON TABLE public.leads IS 'Leads capturados do LinkedIn com dados enriquecidos';
COMMENT ON TABLE public.linkedin_imports IS 'Histórico de importações do LinkedIn';
COMMENT ON TABLE public.analytics_events IS 'Eventos para rastreamento e analytics';
COMMENT ON TABLE public.webhooks IS 'Configurações de webhooks para integrações';
COMMENT ON TABLE public.automations IS 'Regras de automação de workflows';

COMMENT ON COLUMN public.leads.linkedin_profile_data IS 'Dados completos do perfil LinkedIn em formato JSON';
COMMENT ON COLUMN public.leads.custom_fields IS 'Campos customizados definidos pelo usuário';
COMMENT ON COLUMN public.leads.tags IS 'Array de tags para categorização';
COMMENT ON COLUMN public.leads.lead_score IS 'Score de 0-100 para qualificação do lead';


