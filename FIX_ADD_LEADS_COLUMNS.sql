-- ============================================================================
-- 🔧 FIX: Adicionar colunas essenciais à tabela LEADS
-- Data: 2025-10-16
-- Problema: Colunas job_title, company, status, source não existem
-- Solução: Adicionar com segurança (IF NOT EXISTS)
-- ============================================================================

-- ✅ 1. ADICIONAR COLUNA job_title
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS job_title TEXT;

-- ✅ 2. ADICIONAR COLUNA company (texto livre para casos sem company_id)
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS company TEXT;

-- ✅ 3. ADICIONAR COLUNA status com CHECK constraint
DO $$
BEGIN
  -- Adicionar coluna
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN status TEXT DEFAULT 'new';
  END IF;

  -- Adicionar constraint
  ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;
  ALTER TABLE public.leads ADD CONSTRAINT leads_status_check 
    CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted', 'lost'));
END $$;

-- ✅ 4. ADICIONAR COLUNA source
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

-- ✅ 5. ADICIONAR COLUNA company_id se não existir (com FK)
DO $$
BEGIN
  -- Adicionar coluna company_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'company_id'
  ) THEN
    ALTER TABLE public.leads ADD COLUMN company_id UUID;
  END IF;

  -- Adicionar FK se tabela companies existir
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'companies'
  ) THEN
    ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_company_id_fkey;
    ALTER TABLE public.leads ADD CONSTRAINT leads_company_id_fkey 
      FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================================
-- 📊 VERIFICAÇÃO: Confirmar que colunas foram adicionadas
-- ============================================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'leads'
  AND column_name IN ('job_title', 'company', 'company_id', 'status', 'source')
ORDER BY column_name;

-- ============================================================================
-- 📋 RESULTADO ESPERADO:
-- company      | text | YES | NULL
-- company_id   | uuid | YES | NULL
-- job_title    | text | YES | NULL
-- source       | text | YES | 'manual'::text
-- status       | text | YES | 'new'::text
-- ============================================================================

-- ============================================================================
-- 🧪 TESTE: Inserir lead de exemplo
-- ============================================================================
-- Substitua os UUIDs pelos seus valores reais (user_id e stage_id)
-- 
-- INSERT INTO public.leads (
--   user_id,
--   stage_id,
--   first_name,
--   last_name,
--   email,
--   phone,
--   job_title,
--   company,
--   status,
--   source
-- ) VALUES (
--   'SEU_USER_ID_AQUI',
--   'SEU_STAGE_ID_AQUI',
--   'João',
--   'Silva',
--   'joao@teste.com',
--   '+55 11 99999-9999',
--   'Gerente de Vendas',
--   'Empresa Teste LTDA',
--   'new',
--   'manual'
-- );

-- ============================================================================
-- 📋 INSTRUÇÕES DE USO:
-- 1. Copie TODO este arquivo
-- 2. Cole no Supabase SQL Editor
-- 3. Execute (RUN)
-- 4. Verifique os resultados da query de verificação
-- 5. Se tudo estiver OK, teste criar lead no app novamente
-- ============================================================================
