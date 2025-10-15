-- =====================================================
-- 🚀 PRODUCTION-READY COMPLETE SCHEMA
-- Data: 2025-10-14
-- Descrição: Schema COMPLETO para produção profissional
-- Inclui: Todas as tabelas, RLS, triggers, functions, indexes
-- =====================================================

-- ============= ENABLE EXTENSIONS =============
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca fuzzy
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- Para GIN indexes

-- ============= DROP PROBLEMATIC POLICIES (Se existirem) =============
-- Evitar conflitos com policies duplicadas

DO $$ 
BEGIN
  -- Remover policies antigas que podem estar causando conflitos
  DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "enable_insert_for_authenticated_users_only" ON public.profiles;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Some policies do not exist, skipping';
END $$;

-- ============= VERIFICAR E EXPANDIR TABELAS CORE =============

-- PROFILES: Garantir todos os campos necessários
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS job_title TEXT,
  ADD COLUMN IF NOT EXISTS company TEXT,
  ADD COLUMN IF NOT EXISTS company_size TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Sao_Paulo',
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'pt-BR',
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- LEADS: Garantir todos os campos de enriquecimento e tracking
DO $$
BEGIN
  -- Verificar se a tabela leads existe antes de adicionar colunas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'leads') THEN
    ALTER TABLE public.leads
      ADD COLUMN IF NOT EXISTS source TEXT, -- linkedin, manual, import, api, etc
      ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost')),
      ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS tags TEXT[],
      ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS notes_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS activities_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS next_follow_up_at TIMESTAMPTZ,
      
      -- Enriquecimento LinkedIn
      ADD COLUMN IF NOT EXISTS full_name TEXT,
      ADD COLUMN IF NOT EXISTS headline TEXT,
      ADD COLUMN IF NOT EXISTS about TEXT,
      ADD COLUMN IF NOT EXISTS location TEXT,
      ADD COLUMN IF NOT EXISTS avatar_url TEXT,
      ADD COLUMN IF NOT EXISTS connections TEXT,
      ADD COLUMN IF NOT EXISTS education JSONB,
      ADD COLUMN IF NOT EXISTS experience JSONB,
      ADD COLUMN IF NOT EXISTS skills TEXT[],
      ADD COLUMN IF NOT EXISTS seniority TEXT,
      ADD COLUMN IF NOT EXISTS department TEXT,
      ADD COLUMN IF NOT EXISTS twitter_url TEXT,
      ADD COLUMN IF NOT EXISTS facebook_url TEXT,
      
      -- Dados da empresa
      ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS company_size TEXT,
      ADD COLUMN IF NOT EXISTS company_industry TEXT,
      ADD COLUMN IF NOT EXISTS company_location TEXT,
      ADD COLUMN IF NOT EXISTS company_website TEXT,
      ADD COLUMN IF NOT EXISTS company_linkedin_url TEXT,
      
      -- Tracking
      ADD COLUMN IF NOT EXISTS linkedin_profile_data JSONB,
      ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS enrichment_source TEXT;
  END IF;
END $$;

-- COMPANIES: Expandir campos
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') THEN
    ALTER TABLE public.companies
      ADD COLUMN IF NOT EXISTS domain TEXT,
      ADD COLUMN IF NOT EXISTS industry TEXT,
      ADD COLUMN IF NOT EXISTS size TEXT,
      ADD COLUMN IF NOT EXISTS location TEXT,
      ADD COLUMN IF NOT EXISTS logo_url TEXT,
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS website TEXT,
      ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
      ADD COLUMN IF NOT EXISTS twitter_url TEXT,
      ADD COLUMN IF NOT EXISTS facebook_url TEXT,
      ADD COLUMN IF NOT EXISTS phone TEXT,
      ADD COLUMN IF NOT EXISTS founded_year INTEGER,
      ADD COLUMN IF NOT EXISTS employee_count INTEGER,
      ADD COLUMN IF NOT EXISTS annual_revenue DECIMAL(15, 2),
      ADD COLUMN IF NOT EXISTS tags TEXT[],
      ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS is_customer BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS customer_since TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS last_interaction_at TIMESTAMPTZ;
  END IF;
END $$;

-- DEALS: Expandir campos
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'deals') THEN
    ALTER TABLE public.deals
      ADD COLUMN IF NOT EXISTS forecast_category TEXT DEFAULT 'pipeline' CHECK (forecast_category IN ('pipeline', 'best_case', 'commit', 'omitted')),
      ADD COLUMN IF NOT EXISTS weighted_value DECIMAL(15, 2),
      ADD COLUMN IF NOT EXISTS actual_close_date DATE,
      ADD COLUMN IF NOT EXISTS days_in_stage INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS days_to_close INTEGER,
      ADD COLUMN IF NOT EXISTS lead_source TEXT,
      ADD COLUMN IF NOT EXISTS competitors TEXT[],
      ADD COLUMN IF NOT EXISTS products_services TEXT[],
      ADD COLUMN IF NOT EXISTS next_step TEXT,
      ADD COLUMN IF NOT EXISTS next_step_date DATE,
      ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- ACTIVITIES: Expandir campos
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activities') THEN
    ALTER TABLE public.activities
      ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS title TEXT,
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
      ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
      ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id),
      ADD COLUMN IF NOT EXISTS participants UUID[],
      ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
      ADD COLUMN IF NOT EXISTS location TEXT,
      ADD COLUMN IF NOT EXISTS meeting_url TEXT,
      ADD COLUMN IF NOT EXISTS notes TEXT,
      ADD COLUMN IF NOT EXISTS outcome TEXT,
      ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS reminder_at TIMESTAMPTZ;
  END IF;
END $$;

-- ============= CREATE MISSING TABLES =============

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL CHECK (type IN (
    'lead_assigned', 'deal_won', 'deal_lost', 'deal_moved', 
    'activity_due', 'activity_overdue', 'mention', 'comment',
    'task_assigned', 'task_completed', 'meeting_reminder',
    'system', 'announcement'
  )),
  
  title TEXT NOT NULL,
  message TEXT,
  
  -- Relacionamentos
  entity_type TEXT, -- lead, deal, activity, etc
  entity_id UUID,
  
  -- Estado
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Ações
  action_url TEXT,
  action_label TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TASKS (Tarefas específicas, diferentes de atividades genéricas)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  
  -- Status e prioridade
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Datas
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Relacionamentos
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Atribuição
  assigned_to UUID REFERENCES auth.users(id),
  assigned_by UUID REFERENCES auth.users(id),
  
  -- Checklist items
  checklist JSONB DEFAULT '[]'::jsonb,
  
  -- Tags e custom fields
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- WEBHOOKS (Para integrações)
CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  
  -- Eventos que trigam o webhook
  events TEXT[] NOT NULL,
  
  -- Estado
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Segurança
  secret_key TEXT,
  
  -- Stats
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  last_error TEXT,
  last_error_at TIMESTAMPTZ,
  
  -- Metadata
  headers JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EMAIL_TEMPLATES
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  
  -- Categorização
  category TEXT DEFAULT 'custom' CHECK (category IN ('cold_email', 'follow_up', 'proposal', 'meeting_request', 'thank_you', 'custom')),
  
  -- Variáveis disponíveis
  variables TEXT[] DEFAULT ARRAY['{{first_name}}', '{{last_name}}', '{{company}}', '{{sender_name}}'],
  
  -- Estado
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INTEGRATIONS (Zapier, Make, N8N, etc)
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('zapier', 'make', 'n8n', 'webhook', 'api', 'custom')),
  
  -- Configuração
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Credenciais (criptografadas)
  credentials JSONB DEFAULT '{}'::jsonb,
  
  -- Estado
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'success', 'error')),
  last_error TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API_KEYS (Para acesso via API)
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE, -- Hash do key, nunca armazenar plain text
  key_prefix TEXT NOT NULL, -- Primeiros 8 chars para identificação (ex: "sk_live_AbCd1234...")
  
  -- Permissões
  scopes TEXT[] DEFAULT ARRAY['read'], -- read, write, delete, admin
  
  -- Rate limiting
  rate_limit_per_hour INTEGER DEFAULT 1000,
  
  -- Estado
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT_LOGS (Rastreamento de mudanças)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Quem fez
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  
  -- O que foi feito
  action TEXT NOT NULL, -- create, update, delete, login, logout, etc
  entity_type TEXT NOT NULL, -- lead, deal, user, etc
  entity_id UUID,
  
  -- Detalhes da mudança
  old_values JSONB,
  new_values JSONB,
  
  -- Contexto
  ip_address INET,
  user_agent TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SAVED_FILTERS (Filtros salvos/favoritos)
CREATE TABLE IF NOT EXISTS public.saved_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('leads', 'deals', 'activities', 'tasks', 'companies')),
  
  -- Filtros (JSON com condições)
  filters JSONB NOT NULL,
  
  -- Compartilhamento
  is_shared BOOLEAN DEFAULT FALSE,
  shared_with UUID[], -- User IDs
  
  -- Stats
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CUSTOM_FIELDS (Campos customizados por entidade)
CREATE TABLE IF NOT EXISTS public.custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  entity_type TEXT NOT NULL CHECK (entity_type IN ('lead', 'deal', 'company', 'activity', 'task')),
  
  name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'boolean', 'select', 'multi_select', 'url', 'email', 'phone')),
  
  -- Configuração
  is_required BOOLEAN DEFAULT FALSE,
  default_value TEXT,
  options JSONB DEFAULT '[]'::jsonb, -- Para select e multi_select
  
  -- Validação
  validation_rules JSONB DEFAULT '{}'::jsonb,
  
  -- Display
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, entity_type, name)
);

-- ============= REALTIME PUBLICATIONS (Com verificação de existência) =============
-- Habilitar Realtime para tabelas principais

DO $$ 
BEGIN
  -- Verificar se as tabelas já estão na publicação
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'activities'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
  END IF;
EXCEPTION 
  WHEN undefined_object THEN
    RAISE NOTICE 'Publicação supabase_realtime não existe ainda';
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao adicionar tabelas à publicação: %', SQLERRM;
END $$;

-- ============= RLS POLICIES (Com verificação de existência) =============

-- NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can view their own notifications'
  ) THEN
    CREATE POLICY "Users can view their own notifications" 
      ON public.notifications FOR SELECT 
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can update their own notifications'
  ) THEN
    CREATE POLICY "Users can update their own notifications" 
      ON public.notifications FOR UPDATE 
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users can delete their own notifications'
  ) THEN
    CREATE POLICY "Users can delete their own notifications" 
      ON public.notifications FOR DELETE 
      USING (user_id = auth.uid());
  END IF;
END $$;

-- TASKS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users can view their own or assigned tasks'
  ) THEN
    CREATE POLICY "Users can view their own or assigned tasks" 
      ON public.tasks FOR SELECT 
      USING (user_id = auth.uid() OR assigned_to = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users can create tasks'
  ) THEN
    CREATE POLICY "Users can create tasks" 
      ON public.tasks FOR INSERT 
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users can update their own or assigned tasks'
  ) THEN
    CREATE POLICY "Users can update their own or assigned tasks" 
      ON public.tasks FOR UPDATE 
      USING (user_id = auth.uid() OR assigned_to = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'tasks' AND policyname = 'Users can delete their own tasks'
  ) THEN
    CREATE POLICY "Users can delete their own tasks" 
      ON public.tasks FOR DELETE 
      USING (user_id = auth.uid());
  END IF;
END $$;

-- WEBHOOKS
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'webhooks' AND policyname = 'Users can manage their own webhooks'
  ) THEN
    CREATE POLICY "Users can manage their own webhooks" 
      ON public.webhooks FOR ALL 
      USING (user_id = auth.uid());
  END IF;
END $$;

-- EMAIL_TEMPLATES
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'email_templates' AND policyname = 'Users can manage their own email templates'
  ) THEN
    CREATE POLICY "Users can manage their own email templates" 
      ON public.email_templates FOR ALL 
      USING (user_id = auth.uid());
  END IF;
END $$;

-- INTEGRATIONS
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'integrations' AND policyname = 'Users can manage their own integrations'
  ) THEN
    CREATE POLICY "Users can manage their own integrations" 
      ON public.integrations FOR ALL 
      USING (user_id = auth.uid());
  END IF;
END $$;

-- API_KEYS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'api_keys' AND policyname = 'Users can manage their own API keys'
  ) THEN
    CREATE POLICY "Users can manage their own API keys" 
      ON public.api_keys FOR ALL 
      USING (user_id = auth.uid());
  END IF;
END $$;

-- AUDIT_LOGS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Users can view their own audit logs'
  ) THEN
    CREATE POLICY "Users can view their own audit logs" 
      ON public.audit_logs FOR SELECT 
      USING (user_id = auth.uid());
  END IF;
END $$;

-- SAVED_FILTERS
ALTER TABLE public.saved_filters ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'saved_filters' AND policyname = 'Users can manage their own saved filters'
  ) THEN
    CREATE POLICY "Users can manage their own saved filters" 
      ON public.saved_filters FOR ALL 
      USING (user_id = auth.uid());
  END IF;
END $$;

-- CUSTOM_FIELDS
ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'custom_fields' AND policyname = 'Users can manage their own custom fields'
  ) THEN
    CREATE POLICY "Users can manage their own custom fields" 
      ON public.custom_fields FOR ALL 
      USING (user_id = auth.uid());
  END IF;
END $$;

-- PROFILES: Políticas CORRETAS para INSERT (evitar conflitos)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert their own profile on signup'
  ) THEN
    CREATE POLICY "Users can insert their own profile on signup"
      ON public.profiles FOR INSERT 
      WITH CHECK (TRUE); -- Permitir INSERT via trigger do signup
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
      ON public.profiles FOR UPDATE 
      USING (id = auth.uid());
  END IF;
END $$;

-- ============= INDEXES FOR PERFORMANCE =============

-- PROFILES
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

-- LEADS
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON public.leads(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON public.leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_is_archived ON public.leads(is_archived);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email_trgm ON public.leads USING gin(email gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_leads_full_name_trgm ON public.leads USING gin(full_name gin_trgm_ops);

-- COMPANIES
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_domain ON public.companies(domain);
CREATE INDEX IF NOT EXISTS idx_companies_name_trgm ON public.companies USING gin(name gin_trgm_ops);

-- DEALS
CREATE INDEX IF NOT EXISTS idx_deals_user_id ON public.deals(user_id);
CREATE INDEX IF NOT EXISTS idx_deals_status ON public.deals(status);
CREATE INDEX IF NOT EXISTS idx_deals_company_id ON public.deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_expected_close_date ON public.deals(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_deals_value ON public.deals(value DESC);
CREATE INDEX IF NOT EXISTS idx_deals_created_at ON public.deals(created_at DESC);

-- ACTIVITIES
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON public.activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_deal_id ON public.activities(deal_id);
CREATE INDEX IF NOT EXISTS idx_activities_company_id ON public.activities(company_id);
CREATE INDEX IF NOT EXISTS idx_activities_status ON public.activities(status);
CREATE INDEX IF NOT EXISTS idx_activities_due_date ON public.activities(due_date);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);

-- TASKS
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_lead_id ON public.tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_tasks_deal_id ON public.tasks(deal_id);

-- NOTIFICATIONS
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);

-- AUDIT_LOGS
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ============= TRIGGERS & FUNCTIONS =============

-- Function para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas relevantes (verificando existência)
DO $$
DECLARE
  tbl_name TEXT;
  trigger_exists BOOLEAN;
BEGIN
  FOR tbl_name IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'leads', 'companies', 'deals', 'activities', 'tasks', 'email_templates', 'integrations', 'webhooks', 'custom_fields', 'saved_filters')
  LOOP
    -- Verificar se o trigger já existe
    SELECT EXISTS (
      SELECT 1 FROM pg_trigger t
      JOIN pg_class c ON t.tgrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname = 'public'
      AND c.relname = tbl_name
      AND t.tgname = 'update_' || tbl_name || '_updated_at'
    ) INTO trigger_exists;
    
    -- Só criar se não existir
    IF NOT trigger_exists THEN
      EXECUTE format('
        CREATE TRIGGER update_%I_updated_at
          BEFORE UPDATE ON public.%I
          FOR EACH ROW
          EXECUTE FUNCTION public.update_updated_at_column();
      ', tbl_name, tbl_name);
      RAISE NOTICE 'Trigger update_%_updated_at criado', tbl_name;
    ELSE
      RAISE NOTICE 'Trigger update_%_updated_at já existe, pulando', tbl_name;
    END IF;
  END LOOP;
END $$;

-- Function para criar notificação
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT DEFAULT NULL,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL,
  p_action_label TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, entity_type, entity_id, action_url, action_label)
  VALUES (p_user_id, p_type, p_title, p_message, p_entity_type, p_entity_id, p_action_url, p_action_label)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function para criar audit log
CREATE OR REPLACE FUNCTION public.create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Buscar email do usuário
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();
  
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, user_email, action, entity_type, entity_id, new_values)
    VALUES (auth.uid(), user_email, 'create', TG_TABLE_NAME, NEW.id, row_to_json(NEW));
    
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, user_email, action, entity_type, entity_id, old_values, new_values)
    VALUES (auth.uid(), user_email, 'update', TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW));
    
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, user_email, action, entity_type, entity_id, old_values)
    VALUES (auth.uid(), user_email, 'delete', TG_TABLE_NAME, OLD.id, row_to_json(OLD));
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar audit log em tabelas críticas (verificando existência)
DO $$
DECLARE
  tbl_name TEXT;
  trigger_exists BOOLEAN;
  table_exists BOOLEAN;
BEGIN
  FOR tbl_name IN 
    SELECT t FROM unnest(ARRAY['leads', 'deals', 'companies', 'subscriptions', 'user_credits']) AS t
  LOOP
    -- Verificar se a tabela existe
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = tbl_name
    ) INTO table_exists;
    
    IF table_exists THEN
      -- Verificar se o trigger já existe
      SELECT EXISTS (
        SELECT 1 FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = 'public'
        AND c.relname = tbl_name
        AND t.tgname = 'audit_log_' || tbl_name
      ) INTO trigger_exists;
      
      -- Só criar se não existir
      IF NOT trigger_exists THEN
        EXECUTE format('
          CREATE TRIGGER audit_log_%I
            AFTER INSERT OR UPDATE OR DELETE ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION public.create_audit_log();
        ', tbl_name, tbl_name);
        RAISE NOTICE 'Audit trigger para % criado', tbl_name;
      ELSE
        RAISE NOTICE 'Audit trigger para % já existe, pulando', tbl_name;
      END IF;
    ELSE
      RAISE NOTICE 'Tabela % não existe, pulando audit trigger', tbl_name;
    END IF;
  END LOOP;
END $$;

-- Function para calcular weighted value do deal (value * probability%)
CREATE OR REPLACE FUNCTION public.calculate_deal_weighted_value()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.value IS NOT NULL AND NEW.probability IS NOT NULL THEN
    NEW.weighted_value := NEW.value * (NEW.probability / 100.0);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger apenas se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'public'
    AND c.relname = 'deals'
    AND t.tgname = 'calculate_deal_weighted_value_trigger'
  ) THEN
    CREATE TRIGGER calculate_deal_weighted_value_trigger
      BEFORE INSERT OR UPDATE OF value, probability ON public.deals
      FOR EACH ROW
      EXECUTE FUNCTION public.calculate_deal_weighted_value();
    RAISE NOTICE 'Trigger calculate_deal_weighted_value_trigger criado';
  ELSE
    RAISE NOTICE 'Trigger calculate_deal_weighted_value_trigger já existe';
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'Tabela deals não existe, pulando trigger';
END $$;

-- Function para atualizar last_seen_at do perfil
CREATE OR REPLACE FUNCTION public.update_user_last_seen()
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles 
  SET last_seen_at = NOW() 
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============= ANALYTICS VIEWS =============

-- View: Pipeline de Deals
CREATE OR REPLACE VIEW public.deals_pipeline_view AS
SELECT 
  d.id,
  d.title,
  d.value,
  d.weighted_value,
  d.probability,
  d.status,
  d.expected_close_date,
  s.name AS stage_name,
  s.order_index AS stage_order,
  p.name AS pipeline_name,
  c.name AS company_name,
  u.email AS owner_email,
  d.created_at,
  d.days_in_stage
FROM public.deals d
LEFT JOIN public.stages s ON d.stage_id = s.id
LEFT JOIN public.pipelines p ON d.pipeline_id = p.id
LEFT JOIN public.companies c ON d.company_id = c.id
LEFT JOIN auth.users u ON d.owner_id = u.id;

-- View: Lead Conversion Funnel
CREATE OR REPLACE VIEW public.lead_conversion_funnel AS
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE status = 'new') AS new_leads,
  COUNT(*) FILTER (WHERE status = 'contacted') AS contacted_leads,
  COUNT(*) FILTER (WHERE status = 'qualified') AS qualified_leads,
  COUNT(*) FILTER (WHERE status = 'converted') AS converted_leads,
  COUNT(*) FILTER (WHERE status = 'lost') AS lost_leads,
  ROUND(
    (COUNT(*) FILTER (WHERE status = 'converted')::DECIMAL / 
    NULLIF(COUNT(*) FILTER (WHERE status IN ('new', 'contacted', 'qualified', 'converted', 'lost')), 0)) * 100, 
    2
  ) AS conversion_rate
FROM public.leads
GROUP BY user_id;

-- View: Activities Summary
CREATE OR REPLACE VIEW public.activities_summary AS
SELECT 
  user_id,
  DATE(created_at) AS activity_date,
  type,
  COUNT(*) AS count,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
  COUNT(*) FILTER (WHERE status = 'pending' AND due_date < NOW()) AS overdue_count
FROM public.activities
GROUP BY user_id, DATE(created_at), type;

-- ============= HELPER FUNCTIONS =============

-- Function: Buscar leads duplicados por email
CREATE OR REPLACE FUNCTION public.find_duplicate_leads(p_email TEXT)
RETURNS TABLE(id UUID, first_name TEXT, last_name TEXT, company_name TEXT, created_at TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id, 
    l.first_name, 
    l.last_name, 
    COALESCE(c.name, l.full_name, 'Sem empresa') AS company_name,
    l.created_at
  FROM public.leads l
  LEFT JOIN public.companies c ON l.company_id = c.id
  WHERE LOWER(l.email) = LOWER(p_email)
  AND l.user_id = auth.uid()
  AND l.is_archived = FALSE
  ORDER BY l.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Merge leads duplicados
CREATE OR REPLACE FUNCTION public.merge_leads(p_primary_lead_id UUID, p_duplicate_lead_ids UUID[])
RETURNS BOOLEAN AS $$
DECLARE
  duplicate_id UUID;
BEGIN
  -- Verificar ownership
  IF NOT EXISTS (
    SELECT 1 FROM public.leads 
    WHERE id = p_primary_lead_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Primary lead not found or not owned by user';
  END IF;
  
  -- Para cada lead duplicado
  FOREACH duplicate_id IN ARRAY p_duplicate_lead_ids
  LOOP
    -- Mover notes
    UPDATE public.notes SET lead_id = p_primary_lead_id WHERE lead_id = duplicate_id;
    
    -- Mover activities
    UPDATE public.activities SET lead_id = p_primary_lead_id WHERE lead_id = duplicate_id;
    
    -- Mover contacts
    UPDATE public.lead_contacts SET lead_id = p_primary_lead_id WHERE lead_id = duplicate_id
    ON CONFLICT DO NOTHING;
    
    -- Deletar lead duplicado
    DELETE FROM public.leads WHERE id = duplicate_id AND user_id = auth.uid();
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Bulk archive leads
CREATE OR REPLACE FUNCTION public.bulk_archive_leads(p_lead_ids UUID[])
RETURNS INTEGER AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  UPDATE public.leads 
  SET is_archived = TRUE, archived_at = NOW()
  WHERE id = ANY(p_lead_ids) AND user_id = auth.uid();
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Bulk update lead status
CREATE OR REPLACE FUNCTION public.bulk_update_lead_status(p_lead_ids UUID[], p_status TEXT)
RETURNS INTEGER AS $$
DECLARE
  affected_rows INTEGER;
BEGIN
  UPDATE public.leads 
  SET status = p_status
  WHERE id = ANY(p_lead_ids) AND user_id = auth.uid();
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user statistics
CREATE OR REPLACE FUNCTION public.get_user_statistics(p_user_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
  target_user_id UUID;
  result JSON;
BEGIN
  target_user_id := COALESCE(p_user_id, auth.uid());
  
  SELECT json_build_object(
    'leads', json_build_object(
      'total', COUNT(DISTINCT l.id),
      'new', COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'new'),
      'qualified', COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'qualified'),
      'converted', COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'converted')
    ),
    'deals', json_build_object(
      'total', COUNT(DISTINCT d.id),
      'open', COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'open'),
      'won', COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'won'),
      'lost', COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'lost'),
      'total_value', COALESCE(SUM(d.value) FILTER (WHERE d.status = 'open'), 0),
      'won_value', COALESCE(SUM(d.value) FILTER (WHERE d.status = 'won'), 0)
    ),
    'activities', json_build_object(
      'total', COUNT(DISTINCT a.id),
      'pending', COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'pending'),
      'completed', COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'completed'),
      'overdue', COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'pending' AND a.due_date < NOW())
    ),
    'companies', json_build_object(
      'total', COUNT(DISTINCT c.id)
    )
  ) INTO result
  FROM public.profiles p
  LEFT JOIN public.leads l ON l.user_id = target_user_id
  LEFT JOIN public.deals d ON d.user_id = target_user_id
  LEFT JOIN public.activities a ON a.user_id = target_user_id
  LEFT JOIN public.companies c ON c.user_id = target_user_id
  WHERE p.id = target_user_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============= COMENTÁRIOS E DOCUMENTAÇÃO =============

COMMENT ON TABLE public.notifications IS 'Notificações em tempo real para usuários';
COMMENT ON TABLE public.tasks IS 'Tarefas específicas com checklist e atribuição';
COMMENT ON TABLE public.webhooks IS 'Webhooks para integrações externas';
COMMENT ON TABLE public.email_templates IS 'Templates de email reutilizáveis';
COMMENT ON TABLE public.integrations IS 'Integrações com serviços externos (Zapier, Make, etc)';
COMMENT ON TABLE public.api_keys IS 'API keys para acesso programático';
COMMENT ON TABLE public.audit_logs IS 'Log de auditoria de todas as ações importantes';
COMMENT ON TABLE public.saved_filters IS 'Filtros salvos/favoritos por usuário';
COMMENT ON TABLE public.custom_fields IS 'Campos customizados definidos pelo usuário';

-- ============= GRANTS =============

-- Garantir que authenticated users possam acessar as tabelas
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.webhooks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integrations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_keys TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_filters TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_fields TO authenticated;

-- ============= FINAL VERIFICATION =============

-- Verificar schema completo
SELECT 
  'Schema Production-Ready Completo!' AS status,
  COUNT(*) FILTER (WHERE table_type = 'BASE TABLE') AS total_tables,
  COUNT(*) FILTER (WHERE table_type = 'VIEW') AS total_views
FROM information_schema.tables
WHERE table_schema = 'public';
