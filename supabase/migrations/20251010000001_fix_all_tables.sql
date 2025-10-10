-- =============================================
-- FIX: Garantir que TODAS as tabelas existam
-- =============================================

-- 1. Criar tabela subscriptions (estava faltando)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  status TEXT NOT NULL DEFAULT 'inactive',
  plan_name TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- 2. Verificar se profiles existe (pode já estar criada)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Verificar se pipelines existe
CREATE TABLE IF NOT EXISTS public.pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Verificar se stages existe
CREATE TABLE IF NOT EXISTS public.stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES public.pipelines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B46F2',
  position INTEGER NOT NULL,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Verificar se leads existe
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  job_title TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  temperature TEXT DEFAULT 'cold',
  last_interaction TIMESTAMP WITH TIME ZONE,
  source TEXT DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Verificar se notes existe
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Verificar se activities existe
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Garantir RLS em todas as tabelas
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- 9. Políticas para pipelines (se não existirem)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pipelines' AND policyname = 'Users can view their own pipelines'
  ) THEN
    CREATE POLICY "Users can view their own pipelines"
      ON public.pipelines FOR SELECT
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pipelines' AND policyname = 'Users can create their own pipelines'
  ) THEN
    CREATE POLICY "Users can create their own pipelines"
      ON public.pipelines FOR INSERT
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pipelines' AND policyname = 'Users can update their own pipelines'
  ) THEN
    CREATE POLICY "Users can update their own pipelines"
      ON public.pipelines FOR UPDATE
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'pipelines' AND policyname = 'Users can delete their own pipelines'
  ) THEN
    CREATE POLICY "Users can delete their own pipelines"
      ON public.pipelines FOR DELETE
      USING (user_id = auth.uid());
  END IF;
END $$;

-- 10. Políticas para stages
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'stages' AND policyname = 'Users can view stages of their pipelines'
  ) THEN
    CREATE POLICY "Users can view stages of their pipelines"
      ON public.stages FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.pipelines
          WHERE pipelines.id = stages.pipeline_id
          AND pipelines.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'stages' AND policyname = 'Users can create stages in their pipelines'
  ) THEN
    CREATE POLICY "Users can create stages in their pipelines"
      ON public.stages FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.pipelines
          WHERE pipelines.id = pipeline_id
          AND pipelines.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'stages' AND policyname = 'Users can update stages in their pipelines'
  ) THEN
    CREATE POLICY "Users can update stages in their pipelines"
      ON public.stages FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.pipelines
          WHERE pipelines.id = stages.pipeline_id
          AND pipelines.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'stages' AND policyname = 'Users can delete stages in their pipelines'
  ) THEN
    CREATE POLICY "Users can delete stages in their pipelines"
      ON public.stages FOR DELETE
      USING (
        EXISTS (
          SELECT 1 FROM public.pipelines
          WHERE pipelines.id = stages.pipeline_id
          AND pipelines.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- 11. Políticas para leads
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Users can view their own leads'
  ) THEN
    CREATE POLICY "Users can view their own leads"
      ON public.leads FOR SELECT
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Users can create their own leads'
  ) THEN
    CREATE POLICY "Users can create their own leads"
      ON public.leads FOR INSERT
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Users can update their own leads'
  ) THEN
    CREATE POLICY "Users can update their own leads"
      ON public.leads FOR UPDATE
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'leads' AND policyname = 'Users can delete their own leads'
  ) THEN
    CREATE POLICY "Users can delete their own leads"
      ON public.leads FOR DELETE
      USING (user_id = auth.uid());
  END IF;
END $$;

-- 12. Políticas para notes
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notes' AND policyname = 'Users can view their own notes'
  ) THEN
    CREATE POLICY "Users can view their own notes"
      ON public.notes FOR SELECT
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notes' AND policyname = 'Users can create their own notes'
  ) THEN
    CREATE POLICY "Users can create their own notes"
      ON public.notes FOR INSERT
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notes' AND policyname = 'Users can delete their own notes'
  ) THEN
    CREATE POLICY "Users can delete their own notes"
      ON public.notes FOR DELETE
      USING (user_id = auth.uid());
  END IF;
END $$;

-- 13. Políticas para activities
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'activities' AND policyname = 'Users can view their own activities'
  ) THEN
    CREATE POLICY "Users can view their own activities"
      ON public.activities FOR SELECT
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'activities' AND policyname = 'Users can create their own activities'
  ) THEN
    CREATE POLICY "Users can create their own activities"
      ON public.activities FOR INSERT
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- 14. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage_id ON public.leads(stage_id);
CREATE INDEX IF NOT EXISTS idx_pipelines_user_id ON public.pipelines(user_id);
CREATE INDEX IF NOT EXISTS idx_stages_pipeline_id ON public.stages(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_notes_lead_id ON public.notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON public.activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

-- 15. Criar pipeline padrão para usuários existentes que não tenham
INSERT INTO public.pipelines (user_id, name)
SELECT id, 'Meu Pipeline'
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.pipelines WHERE user_id = auth.users.id
)
ON CONFLICT DO NOTHING;

-- 16. Criar stages padrão para pipelines sem stages
INSERT INTO public.stages (pipeline_id, name, color, position, order_index)
SELECT 
  p.id,
  stage_data.name,
  stage_data.color,
  stage_data.position,
  stage_data.position
FROM public.pipelines p
CROSS JOIN (
  VALUES 
    ('Novo Lead', '#3B82F6', 0),
    ('Contato Inicial', '#8B5CF6', 1),
    ('Qualificação', '#EC4899', 2),
    ('Proposta', '#F59E0B', 3),
    ('Negociação', '#10B981', 4),
    ('Fechado', '#6B46F2', 5)
) AS stage_data(name, color, position)
WHERE NOT EXISTS (
  SELECT 1 FROM public.stages WHERE pipeline_id = p.id
)
ON CONFLICT DO NOTHING;
