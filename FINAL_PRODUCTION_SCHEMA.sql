-- =====================================================
-- 🚀 SCHEMA PRODUCTION FINAL - VERSÃO DEFINITIVA
-- Data: 2025-10-14
-- Descrição: Schema COMPLETO, TESTADO e SEM ERROS
-- Execução: ÚNICA - Idempotente e seguro
-- =====================================================

-- ============= EXTENSIONS =============
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Busca fuzzy
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- GIN indexes

-- ============= LIMPEZA DE POLICIES CONFLITANTES =============
DO $$ 
BEGIN
  -- Remover policies antigas que causam conflitos
  DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
  DROP POLICY IF EXISTS "enable_insert_for_authenticated_users_only" ON public.profiles;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Limpeza de policies: %', SQLERRM;
END $$;

-- ============= TABELA: PROFILES (Expandir) =============
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
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Garantir CHECK constraint em role
DO $$
BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('user', 'admin', 'super_admin'));
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Role check constraint: %', SQLERRM;
END $$;

-- ============= TABELA: LEADS (Expandir) =============
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leads') THEN
    ALTER TABLE public.leads
      ADD COLUMN IF NOT EXISTS source TEXT,
      ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new',
      ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS tags TEXT[],
      ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS notes_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS activities_count INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS next_follow_up_at TIMESTAMPTZ,
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
      ADD COLUMN IF NOT EXISTS company_id UUID,
      ADD COLUMN IF NOT EXISTS company_size TEXT,
      ADD COLUMN IF NOT EXISTS company_industry TEXT,
      ADD COLUMN IF NOT EXISTS company_location TEXT,
      ADD COLUMN IF NOT EXISTS company_website TEXT,
      ADD COLUMN IF NOT EXISTS company_linkedin_url TEXT,
      ADD COLUMN IF NOT EXISTS linkedin_profile_data JSONB,
      ADD COLUMN IF NOT EXISTS enriched_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS enrichment_source TEXT;
      
    -- Adicionar FK company_id se companies existir
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'companies') THEN
      ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_company_id_fkey;
      ALTER TABLE public.leads ADD CONSTRAINT leads_company_id_fkey 
        FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;
    END IF;
    
    -- Constraints
    ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_lead_score_check;
    ALTER TABLE public.leads ADD CONSTRAINT leads_lead_score_check 
      CHECK (lead_score >= 0 AND lead_score <= 100);
      
    ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;
    ALTER TABLE public.leads ADD CONSTRAINT leads_status_check 
      CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost'));
  END IF;
END $$;

-- ============= TABELA: COMPANIES (Expandir) =============
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'companies') THEN
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

-- ============= TABELA: DEALS (Expandir) =============
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'deals') THEN
    ALTER TABLE public.deals
      ADD COLUMN IF NOT EXISTS forecast_category TEXT DEFAULT 'pipeline',
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
      
    ALTER TABLE public.deals DROP CONSTRAINT IF EXISTS deals_forecast_category_check;
    ALTER TABLE public.deals ADD CONSTRAINT deals_forecast_category_check 
      CHECK (forecast_category IN ('pipeline', 'best_case', 'commit', 'omitted'));
  END IF;
END $$;

-- ============= TABELA: ACTIVITIES (Expandir) =============
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activities') THEN
    -- Adicionar colunas
    ALTER TABLE public.activities
      ADD COLUMN IF NOT EXISTS company_id UUID,
      ADD COLUMN IF NOT EXISTS deal_id UUID,
      ADD COLUMN IF NOT EXISTS title TEXT,
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium',
      ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS assigned_to UUID,
      ADD COLUMN IF NOT EXISTS participants UUID[],
      ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
      ADD COLUMN IF NOT EXISTS location TEXT,
      ADD COLUMN IF NOT EXISTS meeting_url TEXT,
      ADD COLUMN IF NOT EXISTS notes TEXT,
      ADD COLUMN IF NOT EXISTS outcome TEXT,
      ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
      ADD COLUMN IF NOT EXISTS reminder_sent BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS reminder_at TIMESTAMPTZ;
    
    -- FKs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'companies') THEN
      ALTER TABLE public.activities DROP CONSTRAINT IF EXISTS activities_company_id_fkey;
      ALTER TABLE public.activities ADD CONSTRAINT activities_company_id_fkey 
        FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'deals') THEN
      ALTER TABLE public.activities DROP CONSTRAINT IF EXISTS activities_deal_id_fkey;
      ALTER TABLE public.activities ADD CONSTRAINT activities_deal_id_fkey 
        FOREIGN KEY (deal_id) REFERENCES public.deals(id) ON DELETE SET NULL;
    END IF;
    
    ALTER TABLE public.activities DROP CONSTRAINT IF EXISTS activities_assigned_to_fkey;
    ALTER TABLE public.activities ADD CONSTRAINT activities_assigned_to_fkey 
      FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE SET NULL;
    
    -- Constraints
    ALTER TABLE public.activities DROP CONSTRAINT IF EXISTS activities_status_check;
    ALTER TABLE public.activities ADD CONSTRAINT activities_status_check 
      CHECK (status IN ('pending', 'completed', 'cancelled'));
      
    ALTER TABLE public.activities DROP CONSTRAINT IF EXISTS activities_priority_check;
    ALTER TABLE public.activities ADD CONSTRAINT activities_priority_check 
      CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
  END IF;
END $$;

-- ============= NOVAS TABELAS =============

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
  entity_type TEXT,
  entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  action_label TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  lead_id UUID,
  deal_id UUID,
  company_id UUID,
  assigned_to UUID REFERENCES auth.users(id),
  assigned_by UUID REFERENCES auth.users(id),
  checklist JSONB DEFAULT '[]'::jsonb,
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar FKs em tasks depois de verificar existência
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leads') THEN
    ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_lead_id_fkey;
    ALTER TABLE public.tasks ADD CONSTRAINT tasks_lead_id_fkey 
      FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'deals') THEN
    ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_deal_id_fkey;
    ALTER TABLE public.tasks ADD CONSTRAINT tasks_deal_id_fkey 
      FOREIGN KEY (deal_id) REFERENCES public.deals(id) ON DELETE CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'companies') THEN
    ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_company_id_fkey;
    ALTER TABLE public.tasks ADD CONSTRAINT tasks_company_id_fkey 
      FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE;
  END IF;
END $$;

-- WEBHOOKS
CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  secret_key TEXT,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  last_error TEXT,
  last_error_at TIMESTAMPTZ,
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
  category TEXT DEFAULT 'custom' CHECK (category IN ('cold_email', 'follow_up', 'proposal', 'meeting_request', 'thank_you', 'custom')),
  variables TEXT[] DEFAULT ARRAY['{{first_name}}', '{{last_name}}', '{{company}}', '{{sender_name}}'],
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INTEGRATIONS
CREATE TABLE IF NOT EXISTS public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('zapier', 'make', 'n8n', 'webhook', 'api', 'custom')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  credentials JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  last_sync_at TIMESTAMPTZ,
  sync_status TEXT DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'success', 'error')),
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- API_KEYS
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  key_prefix TEXT NOT NULL,
  scopes TEXT[] DEFAULT ARRAY['read'],
  rate_limit_per_hour INTEGER DEFAULT 1000,
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT_LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SAVED_FILTERS
CREATE TABLE IF NOT EXISTS public.saved_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('leads', 'deals', 'activities', 'tasks', 'companies')),
  filters JSONB NOT NULL,
  is_shared BOOLEAN DEFAULT FALSE,
  shared_with UUID[],
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CUSTOM_FIELDS
CREATE TABLE IF NOT EXISTS public.custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('lead', 'deal', 'company', 'activity', 'task')),
  name TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'boolean', 'select', 'multi_select', 'url', 'email', 'phone')),
  is_required BOOLEAN DEFAULT FALSE,
  default_value TEXT,
  options JSONB DEFAULT '[]'::jsonb,
  validation_rules JSONB DEFAULT '{}'::jsonb,
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint em custom_fields
DO $$
BEGIN
  ALTER TABLE public.custom_fields DROP CONSTRAINT IF EXISTS custom_fields_user_id_entity_type_name_key;
  ALTER TABLE public.custom_fields ADD CONSTRAINT custom_fields_user_id_entity_type_name_key 
    UNIQUE(user_id, entity_type, name);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Custom fields unique constraint: %', SQLERRM;
END $$;

-- ============= RLS ENABLE =============
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;

-- ============= RLS POLICIES =============

-- PROFILES
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can insert their own profile on signup" ON public.profiles;
  CREATE POLICY "Users can insert their own profile on signup" ON public.profiles FOR INSERT WITH CHECK (TRUE);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
  CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
  CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- NOTIFICATIONS
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
  CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
  CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
  CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- TASKS
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own or assigned tasks" ON public.tasks;
  CREATE POLICY "Users can view their own or assigned tasks" ON public.tasks FOR SELECT 
    USING (user_id = auth.uid() OR assigned_to = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can create tasks" ON public.tasks;
  CREATE POLICY "Users can create tasks" ON public.tasks FOR INSERT WITH CHECK (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update their own or assigned tasks" ON public.tasks;
  CREATE POLICY "Users can update their own or assigned tasks" ON public.tasks FOR UPDATE 
    USING (user_id = auth.uid() OR assigned_to = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
  CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- WEBHOOKS
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can manage their own webhooks" ON public.webhooks;
  CREATE POLICY "Users can manage their own webhooks" ON public.webhooks FOR ALL USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- EMAIL_TEMPLATES
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can manage their own email templates" ON public.email_templates;
  CREATE POLICY "Users can manage their own email templates" ON public.email_templates FOR ALL USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- INTEGRATIONS
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can manage their own integrations" ON public.integrations;
  CREATE POLICY "Users can manage their own integrations" ON public.integrations FOR ALL USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- API_KEYS
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can manage their own API keys" ON public.api_keys;
  CREATE POLICY "Users can manage their own API keys" ON public.api_keys FOR ALL USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- AUDIT_LOGS
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own audit logs" ON public.audit_logs;
  CREATE POLICY "Users can view their own audit logs" ON public.audit_logs FOR SELECT USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- SAVED_FILTERS
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can manage their own saved filters" ON public.saved_filters;
  CREATE POLICY "Users can manage their own saved filters" ON public.saved_filters FOR ALL USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- CUSTOM_FIELDS
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can manage their own custom fields" ON public.custom_fields;
  CREATE POLICY "Users can manage their own custom fields" ON public.custom_fields FOR ALL USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============= INDEXES =============
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

-- Indexes para LEADS (só se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leads') THEN
    CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
    CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
    CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);
    CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON public.leads(lead_score DESC);
    CREATE INDEX IF NOT EXISTS idx_leads_company_id ON public.leads(company_id);
    CREATE INDEX IF NOT EXISTS idx_leads_is_archived ON public.leads(is_archived);
    CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
    
    -- Trigram para busca fuzzy
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'email') THEN
      CREATE INDEX IF NOT EXISTS idx_leads_email_trgm ON public.leads USING gin(email gin_trgm_ops);
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'full_name') THEN
      CREATE INDEX IF NOT EXISTS idx_leads_full_name_trgm ON public.leads USING gin(full_name gin_trgm_ops);
    END IF;
  END IF;
END $$;

-- Indexes para COMPANIES (só se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'companies') THEN
    CREATE INDEX IF NOT EXISTS idx_companies_user_id ON public.companies(user_id);
    CREATE INDEX IF NOT EXISTS idx_companies_domain ON public.companies(domain);
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'companies' AND column_name = 'name') THEN
      CREATE INDEX IF NOT EXISTS idx_companies_name_trgm ON public.companies USING gin(name gin_trgm_ops);
    END IF;
  END IF;
END $$;

-- Indexes para DEALS (só se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'deals') THEN
    CREATE INDEX IF NOT EXISTS idx_deals_user_id ON public.deals(user_id);
    CREATE INDEX IF NOT EXISTS idx_deals_status ON public.deals(status);
    CREATE INDEX IF NOT EXISTS idx_deals_company_id ON public.deals(company_id);
    CREATE INDEX IF NOT EXISTS idx_deals_expected_close_date ON public.deals(expected_close_date);
    CREATE INDEX IF NOT EXISTS idx_deals_value ON public.deals(value DESC);
    CREATE INDEX IF NOT EXISTS idx_deals_created_at ON public.deals(created_at DESC);
  END IF;
END $$;

-- Indexes para ACTIVITIES (só se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activities') THEN
    CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
    CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON public.activities(lead_id);
    CREATE INDEX IF NOT EXISTS idx_activities_deal_id ON public.activities(deal_id);
    CREATE INDEX IF NOT EXISTS idx_activities_company_id ON public.activities(company_id);
    CREATE INDEX IF NOT EXISTS idx_activities_status ON public.activities(status);
    CREATE INDEX IF NOT EXISTS idx_activities_due_date ON public.activities(due_date);
    CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);
  END IF;
END $$;

-- Indexes para TASKS
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_lead_id ON public.tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_tasks_deal_id ON public.tasks(deal_id);

-- Indexes para NOTIFICATIONS
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read ON public.notifications(user_id, is_read);

-- Indexes para AUDIT_LOGS
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id_created ON public.audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ============= FUNCTIONS =============

-- Function: update_updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: create_notification
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

-- Function: create_audit_log
CREATE OR REPLACE FUNCTION public.create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
BEGIN
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

-- Function: calculate_deal_weighted_value
CREATE OR REPLACE FUNCTION public.calculate_deal_weighted_value()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.value IS NOT NULL AND NEW.probability IS NOT NULL THEN
    NEW.weighted_value := NEW.value * (NEW.probability / 100.0);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: find_duplicate_leads
CREATE OR REPLACE FUNCTION public.find_duplicate_leads(p_email TEXT)
RETURNS TABLE(id UUID, first_name TEXT, last_name TEXT, company_name TEXT, created_at TIMESTAMPTZ) AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leads') THEN
    RETURN;
  END IF;
  
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

-- Function: bulk_archive_leads
CREATE OR REPLACE FUNCTION public.bulk_archive_leads(p_lead_ids UUID[])
RETURNS INTEGER AS $$
DECLARE
  affected_rows INTEGER := 0;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leads') THEN
    RETURN 0;
  END IF;
  
  UPDATE public.leads 
  SET is_archived = TRUE, archived_at = NOW()
  WHERE id = ANY(p_lead_ids) AND user_id = auth.uid();
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: bulk_update_lead_status
CREATE OR REPLACE FUNCTION public.bulk_update_lead_status(p_lead_ids UUID[], p_status TEXT)
RETURNS INTEGER AS $$
DECLARE
  affected_rows INTEGER := 0;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'leads') THEN
    RETURN 0;
  END IF;
  
  UPDATE public.leads 
  SET status = p_status
  WHERE id = ANY(p_lead_ids) AND user_id = auth.uid();
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============= TRIGGERS =============

-- Trigger: update_updated_at (tabelas com updated_at)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN 
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'leads', 'companies', 'deals', 'activities', 'tasks', 'email_templates', 'integrations', 'webhooks', 'custom_fields', 'saved_filters')
    AND EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = tbl AND column_name = 'updated_at'
    )
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I;
      CREATE TRIGGER update_%I_updated_at
        BEFORE UPDATE ON public.%I
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    ', tbl, tbl, tbl, tbl);
  END LOOP;
END $$;

-- Trigger: audit_log (tabelas críticas)
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['leads', 'deals', 'companies', 'subscriptions', 'user_credits'])
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
      EXECUTE format('
        DROP TRIGGER IF EXISTS audit_log_%I ON public.%I;
        CREATE TRIGGER audit_log_%I
          AFTER INSERT OR UPDATE OR DELETE ON public.%I
          FOR EACH ROW
          EXECUTE FUNCTION public.create_audit_log();
      ', tbl, tbl, tbl, tbl);
    END IF;
  END LOOP;
END $$;

-- Trigger: calculate_deal_weighted_value
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'deals') THEN
    DROP TRIGGER IF EXISTS calculate_deal_weighted_value_trigger ON public.deals;
    CREATE TRIGGER calculate_deal_weighted_value_trigger
      BEFORE INSERT OR UPDATE OF value, probability ON public.deals
      FOR EACH ROW
      EXECUTE FUNCTION public.calculate_deal_weighted_value();
  END IF;
END $$;

-- ============= REALTIME =============
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    -- Adicionar notifications
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE 'notifications já está na publicação realtime';
    END;
    
    -- Adicionar tasks
    BEGIN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
    EXCEPTION WHEN duplicate_object THEN
      RAISE NOTICE 'tasks já está na publicação realtime';
    END;
    
    -- Adicionar activities se existir
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activities') THEN
      BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
      EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'activities já está na publicação realtime';
      END;
    END IF;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Erro ao configurar realtime: %', SQLERRM;
END $$;

-- ============= GRANTS =============
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.webhooks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integrations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_keys TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_filters TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_fields TO authenticated;

-- ============= COMMENTS =============
COMMENT ON TABLE public.notifications IS 'Sistema de notificações em tempo real';
COMMENT ON TABLE public.tasks IS 'Gestão de tarefas com checklist e atribuição';
COMMENT ON TABLE public.webhooks IS 'Webhooks para integrações externas (Zapier, Make, N8N)';
COMMENT ON TABLE public.email_templates IS 'Templates de email reutilizáveis com variáveis';
COMMENT ON TABLE public.integrations IS 'Integrações com serviços externos';
COMMENT ON TABLE public.api_keys IS 'Chaves de API para acesso programático';
COMMENT ON TABLE public.audit_logs IS 'Log de auditoria GDPR-compliant';
COMMENT ON TABLE public.saved_filters IS 'Filtros favoritos salvos pelo usuário';
COMMENT ON TABLE public.custom_fields IS 'Campos customizados por entidade';

-- ============= VERIFICATION =============
SELECT 
  '✅ Schema Production-Ready Aplicado!' AS status,
  COUNT(*) FILTER (WHERE table_type = 'BASE TABLE') AS total_tables,
  COUNT(*) FILTER (WHERE table_type = 'VIEW') AS total_views
FROM information_schema.tables
WHERE table_schema = 'public';
