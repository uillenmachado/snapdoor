-- =====================================================
-- SCRIPT DE CORREÇÃO COMPLETA - EXECUTAR NO SUPABASE SQL EDITOR
-- Copie e cole TODO este script no Supabase Dashboard > SQL Editor
-- =====================================================

-- ============= PASSO 1: LIMPAR TRIGGERS DUPLICADOS =============
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS on_user_created_subscription ON public.profiles CASCADE;
DROP TRIGGER IF EXISTS on_user_created_credits ON public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.create_default_subscription() CASCADE;

-- ============= PASSO 2: VERIFICAR TABELAS DEPENDENTES =============

-- Garantir que profiles tem todas as colunas
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Criar subscriptions se não existir
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'professional', 'enterprise')),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('active', 'canceled', 'past_due', 'trial', 'inactive')),
  current_period_end TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '14 days'),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Criar user_credits se não existir
CREATE TABLE IF NOT EXISTS public.user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_credits INTEGER NOT NULL DEFAULT 10,
  used_credits INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT check_used_credits CHECK (used_credits >= 0),
  CONSTRAINT check_total_credits CHECK (total_credits >= 0)
);

ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- ============= PASSO 3: CRIAR FUNÇÃO MASTER =============

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_full_name TEXT;
  profile_id UUID;
BEGIN
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- CRIAR PROFILE
  BEGIN
    INSERT INTO public.profiles (id, full_name, email, avatar_url, created_at, updated_at)
    VALUES (NEW.id, user_full_name, NEW.email, NEW.raw_user_meta_data->>'avatar_url', NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, updated_at = NOW();
    profile_id := NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile: %', SQLERRM;
    RETURN NEW;
  END;

  -- CRIAR SUBSCRIPTION
  IF profile_id IS NOT NULL THEN
    BEGIN
      INSERT INTO public.subscriptions (user_id, plan, status, current_period_end)
      VALUES (profile_id, 'free', 'trial', NOW() + INTERVAL '14 days')
      ON CONFLICT (user_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Error creating subscription: %', SQLERRM;
    END;
  END IF;

  -- CRIAR CREDITS
  IF profile_id IS NOT NULL THEN
    BEGIN
      INSERT INTO public.user_credits (user_id, total_credits, used_credits)
      VALUES (profile_id, 10, 0)
      ON CONFLICT (user_id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Error creating credits: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$;

-- ============= PASSO 4: CRIAR TRIGGER =============

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============= PASSO 5: RLS POLICIES =============

-- Profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Subscriptions
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
CREATE POLICY "Users can view their own subscription" ON public.subscriptions FOR SELECT USING (user_id = auth.uid());

-- User Credits
DROP POLICY IF EXISTS "Users can view their own credits" ON public.user_credits;
CREATE POLICY "Users can view their own credits" ON public.user_credits FOR SELECT USING (user_id = auth.uid());

-- ============= PASSO 6: CORRIGIR USUÁRIOS EXISTENTES =============

-- Sincronizar emails
UPDATE public.profiles p
SET email = au.email, updated_at = NOW()
FROM auth.users au
WHERE p.id = au.id AND (p.email IS NULL OR p.email = '');

-- Criar subscriptions faltantes
INSERT INTO public.subscriptions (user_id, plan, status, current_period_end)
SELECT p.id, 'free', 'trial', NOW() + INTERVAL '14 days'
FROM public.profiles p
LEFT JOIN public.subscriptions s ON s.user_id = p.id
WHERE s.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- Criar credits faltantes
INSERT INTO public.user_credits (user_id, total_credits, used_credits)
SELECT p.id, 10, 0
FROM public.profiles p
LEFT JOIN public.user_credits c ON c.user_id = p.id
WHERE c.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- ============= PASSO 7: CRIAR ÍNDICES =============

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);

-- ============= VERIFICAÇÃO FINAL =============

-- Ver quantos usuários têm todos os dados
SELECT 
  COUNT(DISTINCT au.id) as total_users,
  COUNT(DISTINCT p.id) as users_with_profile,
  COUNT(DISTINCT s.id) as users_with_subscription,
  COUNT(DISTINCT c.id) as users_with_credits
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
LEFT JOIN public.subscriptions s ON s.user_id = au.id
LEFT JOIN public.user_credits c ON c.user_id = au.id;
