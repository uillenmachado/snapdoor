-- =====================================================
-- POLÍTICAS DE SEGURANÇA RLS (Row Level Security)
-- Garantir segurança e isolamento de dados por usuário
-- =====================================================

-- ============= VERIFICAR E ATUALIZAR POLÍTICAS =============

-- Garantir que RLS está habilitado em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automations ENABLE ROW LEVEL SECURITY;

-- ============= POLÍTICAS DE PROFILES =============

-- Drop políticas existentes se existirem
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Políticas atualizadas
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Não permitir delete de profiles (usar soft delete se necessário)
CREATE POLICY "profiles_no_delete"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (false);

-- ============= POLÍTICAS DE PIPELINES =============

DROP POLICY IF EXISTS "Users can view their own pipelines" ON public.pipelines;
DROP POLICY IF EXISTS "Users can create their own pipelines" ON public.pipelines;
DROP POLICY IF EXISTS "Users can update their own pipelines" ON public.pipelines;
DROP POLICY IF EXISTS "Users can delete their own pipelines" ON public.pipelines;

CREATE POLICY "pipelines_select_own"
  ON public.pipelines FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "pipelines_insert_own"
  ON public.pipelines FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "pipelines_update_own"
  ON public.pipelines FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "pipelines_delete_own"
  ON public.pipelines FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============= POLÍTICAS DE STAGES =============

DROP POLICY IF EXISTS "Users can view stages of their pipelines" ON public.stages;
DROP POLICY IF EXISTS "Users can create stages in their pipelines" ON public.stages;
DROP POLICY IF EXISTS "Users can update stages in their pipelines" ON public.stages;
DROP POLICY IF EXISTS "Users can delete stages in their pipelines" ON public.stages;

-- Usuários podem ver stages dos seus pipelines
CREATE POLICY "stages_select_own_pipeline"
  ON public.stages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pipelines
      WHERE pipelines.id = stages.pipeline_id
      AND pipelines.user_id = auth.uid()
    )
  );

CREATE POLICY "stages_insert_own_pipeline"
  ON public.stages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pipelines
      WHERE pipelines.id = pipeline_id
      AND pipelines.user_id = auth.uid()
    )
  );

CREATE POLICY "stages_update_own_pipeline"
  ON public.stages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pipelines
      WHERE pipelines.id = stages.pipeline_id
      AND pipelines.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pipelines
      WHERE pipelines.id = pipeline_id
      AND pipelines.user_id = auth.uid()
    )
  );

CREATE POLICY "stages_delete_own_pipeline"
  ON public.stages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.pipelines
      WHERE pipelines.id = stages.pipeline_id
      AND pipelines.user_id = auth.uid()
    )
  );

-- ============= POLÍTICAS DE LEADS =============

DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

CREATE POLICY "leads_select_own"
  ON public.leads FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "leads_insert_own"
  ON public.leads FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "leads_update_own"
  ON public.leads FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "leads_delete_own"
  ON public.leads FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============= POLÍTICAS DE NOTES =============

DROP POLICY IF EXISTS "Users can view notes on their leads" ON public.notes;
DROP POLICY IF EXISTS "Users can create notes on their leads" ON public.notes;
DROP POLICY IF EXISTS "Users can update their notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete their notes" ON public.notes;

CREATE POLICY "notes_select_own"
  ON public.notes FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notes_insert_own"
  ON public.notes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notes_update_own"
  ON public.notes FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "notes_delete_own"
  ON public.notes FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============= POLÍTICAS DE ACTIVITIES =============

DROP POLICY IF EXISTS "Users can view activities on their leads" ON public.activities;
DROP POLICY IF EXISTS "Users can create activities on their leads" ON public.activities;
DROP POLICY IF EXISTS "Users can update their activities" ON public.activities;
DROP POLICY IF EXISTS "Users can delete their activities" ON public.activities;

CREATE POLICY "activities_select_own"
  ON public.activities FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "activities_insert_own"
  ON public.activities FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "activities_update_own"
  ON public.activities FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "activities_delete_own"
  ON public.activities FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============= POLÍTICAS DE LINKEDIN_IMPORTS =============

DROP POLICY IF EXISTS "Users can view their own imports" ON public.linkedin_imports;
DROP POLICY IF EXISTS "Users can create their own imports" ON public.linkedin_imports;

CREATE POLICY "linkedin_imports_select_own"
  ON public.linkedin_imports FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "linkedin_imports_insert_own"
  ON public.linkedin_imports FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Não permitir update/delete de imports (manter histórico completo)
CREATE POLICY "linkedin_imports_no_update"
  ON public.linkedin_imports FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "linkedin_imports_no_delete"
  ON public.linkedin_imports FOR DELETE
  TO authenticated
  USING (false);

-- ============= POLÍTICAS DE ANALYTICS_EVENTS =============

DROP POLICY IF EXISTS "Users can view their own events" ON public.analytics_events;
DROP POLICY IF EXISTS "Users can create their own events" ON public.analytics_events;

CREATE POLICY "analytics_events_select_own"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "analytics_events_insert_own"
  ON public.analytics_events FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Não permitir update/delete de events (imutáveis)
CREATE POLICY "analytics_events_no_update"
  ON public.analytics_events FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "analytics_events_no_delete"
  ON public.analytics_events FOR DELETE
  TO authenticated
  USING (false);

-- ============= POLÍTICAS DE WEBHOOKS =============

DROP POLICY IF EXISTS "Users can manage their own webhooks" ON public.webhooks;

CREATE POLICY "webhooks_select_own"
  ON public.webhooks FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "webhooks_insert_own"
  ON public.webhooks FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "webhooks_update_own"
  ON public.webhooks FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "webhooks_delete_own"
  ON public.webhooks FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============= POLÍTICAS DE AUTOMATIONS =============

DROP POLICY IF EXISTS "Users can manage their own automations" ON public.automations;

CREATE POLICY "automations_select_own"
  ON public.automations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "automations_insert_own"
  ON public.automations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "automations_update_own"
  ON public.automations FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "automations_delete_own"
  ON public.automations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============= POLÍTICAS DE STORAGE (AVATARS) =============

-- Permitir usuários fazer upload de seus próprios avatares
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============= FUNÇÕES DE SEGURANÇA =============

-- Função para validar se usuário tem acesso ao lead
CREATE OR REPLACE FUNCTION public.user_has_lead_access(lead_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.leads
    WHERE id = lead_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para validar se usuário tem acesso ao pipeline
CREATE OR REPLACE FUNCTION public.user_has_pipeline_access(pipeline_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.pipelines
    WHERE id = pipeline_id
    AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============= RATE LIMITING (BÁSICO) =============

-- Tabela para rastreamento de rate limiting
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rate_limits_own"
  ON public.rate_limits FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action ON public.rate_limits(user_id, action, window_start);

-- Função para verificar rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_action TEXT,
  p_max_requests INTEGER DEFAULT 100,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
  v_window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  v_window_start := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  SELECT COUNT(*)
  INTO v_count
  FROM public.rate_limits
  WHERE user_id = auth.uid()
    AND action = p_action
    AND window_start > v_window_start;
  
  IF v_count >= p_max_requests THEN
    RETURN FALSE;
  END IF;
  
  -- Registrar a ação
  INSERT INTO public.rate_limits (user_id, action)
  VALUES (auth.uid(), p_action);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============= AUDIT LOG =============

-- Tabela para audit log
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_select_own"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Não permitir insert/update/delete manual (apenas via triggers)
CREATE POLICY "audit_log_no_manual_changes"
  ON public.audit_log FOR ALL
  TO authenticated
  USING (false);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON public.audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_record ON public.audit_log(table_name, record_id);

-- Função para criar audit log
CREATE OR REPLACE FUNCTION public.create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_log (user_id, table_name, record_id, action, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    TG_OP,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers de audit para tabelas principais
CREATE TRIGGER leads_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.create_audit_log();

CREATE TRIGGER pipelines_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.pipelines
  FOR EACH ROW
  EXECUTE FUNCTION public.create_audit_log();

-- ============= COMENTÁRIOS =============

COMMENT ON TABLE public.rate_limits IS 'Controle de rate limiting por usuário e ação';
COMMENT ON TABLE public.audit_log IS 'Log de auditoria de todas as mudanças nas tabelas principais';
COMMENT ON FUNCTION public.check_rate_limit IS 'Verifica se usuário excedeu limite de requisições';


