-- ============================================================================
-- 🔧 SOLUÇÃO DEFINITIVA: Recriar/Corrigir tabela LEADS
-- ============================================================================
-- ⚠️ IMPORTANTE: Este script preserva dados existentes
-- ============================================================================

-- PASSO 1: Verificar estrutura atual
DO $$
DECLARE
  v_table_exists BOOLEAN;
  v_has_stage_id BOOLEAN;
BEGIN
  -- Verificar se tabela existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'leads'
  ) INTO v_table_exists;

  IF v_table_exists THEN
    -- Verificar se stage_id existe
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'leads' AND column_name = 'stage_id'
    ) INTO v_has_stage_id;

    IF NOT v_has_stage_id THEN
      RAISE NOTICE '⚠️ PROBLEMA: Tabela leads existe mas NÃO TEM stage_id!';
      RAISE NOTICE '✅ Vamos adicionar as colunas necessárias...';
    ELSE
      RAISE NOTICE '✅ Tabela leads está OK com stage_id';
    END IF;
  ELSE
    RAISE NOTICE '⚠️ PROBLEMA: Tabela leads NÃO EXISTE!';
    RAISE NOTICE '✅ Vamos criar do zero...';
  END IF;
END $$;

-- ============================================================================
-- PASSO 2: Criar tabela se não existir
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stage_id UUID NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  job_title TEXT,
  company TEXT,
  company_id UUID,
  status TEXT DEFAULT 'new',
  source TEXT DEFAULT 'manual',
  position INTEGER NOT NULL DEFAULT 0,
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PASSO 3: Adicionar colunas se faltarem (para tabela existente)
-- ============================================================================
DO $$
BEGIN
  -- Adicionar stage_id se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'stage_id'
  ) THEN
    -- ⚠️ CRÍTICO: stage_id é obrigatório
    -- Se a tabela já tem dados, precisamos de um stage temporário
    ALTER TABLE public.leads ADD COLUMN stage_id UUID;
    
    RAISE NOTICE '⚠️ Coluna stage_id adicionada. IMPORTANTE: Atualize os registros existentes com um stage_id válido!';
  END IF;

  -- Adicionar outras colunas essenciais
  ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS job_title TEXT;
  ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS company TEXT;
  ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS company_id UUID;
  ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';
  ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
  ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS tags TEXT[];
  ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
  ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
  
  RAISE NOTICE '✅ Todas as colunas foram adicionadas/verificadas';
END $$;

-- ============================================================================
-- PASSO 4: Adicionar/Atualizar CONSTRAINTS
-- ============================================================================
DO $$
BEGIN
  -- Foreign Keys
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS fk_user;
    ALTER TABLE public.leads ADD CONSTRAINT fk_user 
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'stages') THEN
    ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS fk_stage;
    ALTER TABLE public.leads ADD CONSTRAINT fk_stage 
      FOREIGN KEY (stage_id) REFERENCES public.stages(id) ON DELETE CASCADE;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') THEN
    ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_company_id_fkey;
    ALTER TABLE public.leads ADD CONSTRAINT leads_company_id_fkey 
      FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;
  END IF;

  -- CHECK Constraints
  ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;
  ALTER TABLE public.leads ADD CONSTRAINT leads_status_check 
    CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost'));

  RAISE NOTICE '✅ Constraints adicionados';
END $$;

-- ============================================================================
-- PASSO 5: Habilitar RLS (Row Level Security)
-- ============================================================================
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Dropar políticas antigas
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can create their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON public.leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON public.leads;

-- Criar políticas
CREATE POLICY "Users can view their own leads"
  ON public.leads FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own leads"
  ON public.leads FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own leads"
  ON public.leads FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own leads"
  ON public.leads FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- PASSO 6: VERIFICAÇÃO FINAL
-- ============================================================================
SELECT 
  '✅ ESTRUTURA FINAL DA TABELA LEADS:' as titulo;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'leads'
ORDER BY ordinal_position;

-- ============================================================================
-- PASSO 7: Verificar constraints
-- ============================================================================
SELECT 
  '✅ CONSTRAINTS DA TABELA LEADS:' as titulo;

SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'leads'
  AND tc.table_schema = 'public'
ORDER BY tc.constraint_type;

-- ============================================================================
-- 📋 INSTRUÇÕES:
-- 1. Execute este SQL COMPLETO no Supabase SQL Editor
-- 2. Verifique os resultados das queries de verificação
-- 3. Compartilhe TODA a saída aqui no chat
-- 4. Se stage_id foi adicionado a uma tabela existente com dados, 
--    precisaremos atualizar os registros
-- ============================================================================
