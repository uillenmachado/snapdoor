-- ============================================================================
-- 🔍 DIAGNÓSTICO COMPLETO: Estrutura da Tabela LEADS
-- Execute este SQL no Supabase SQL Editor para ver EXATAMENTE quais colunas existem
-- ============================================================================

-- 1️⃣ LISTAR TODAS AS COLUNAS DA TABELA LEADS
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'leads'
ORDER BY ordinal_position;

-- ============================================================================
-- 2️⃣ VERIFICAR SE COLUNAS ESPECÍFICAS EXISTEM
-- ============================================================================
SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'job_title'
  ) THEN '✅ job_title EXISTS' ELSE '❌ job_title NOT FOUND' END AS job_title_status,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'company'
  ) THEN '✅ company EXISTS' ELSE '❌ company NOT FOUND' END AS company_status,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'company_id'
  ) THEN '✅ company_id EXISTS' ELSE '❌ company_id NOT FOUND' END AS company_id_status,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'status'
  ) THEN '✅ status EXISTS' ELSE '❌ status NOT FOUND' END AS status_status,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'source'
  ) THEN '✅ source EXISTS' ELSE '❌ source NOT FOUND' END AS source_status;

-- ============================================================================
-- 3️⃣ VERIFICAR CONSTRAINTS E FOREIGN KEYS
-- ============================================================================
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'leads'
  AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, tc.constraint_name;

-- ============================================================================
-- 4️⃣ EXEMPLO DE INSERT MÍNIMO (copie os campos que EXISTEM)
-- ============================================================================
-- Baseado no schema original garantido:
-- INSERT INTO public.leads (
--   user_id,           -- ✅ OBRIGATÓRIO
--   stage_id,          -- ✅ OBRIGATÓRIO  
--   first_name,        -- ✅ OBRIGATÓRIO
--   last_name,         -- ✅ OBRIGATÓRIO
--   email,             -- ✅ Opcional
--   phone,             -- ✅ Opcional
--   linkedin_url,      -- ✅ Opcional
--   job_title,         -- ❓ Verificar resultado da query acima
--   company,           -- ❓ Verificar resultado da query acima
--   company_id,        -- ❓ Verificar resultado da query acima
--   status,            -- ❓ Verificar resultado da query acima
--   source             -- ❓ Verificar resultado da query acima
-- ) VALUES (...);

-- ============================================================================
-- 📋 INSTRUÇÕES:
-- 1. Copie TODO este arquivo
-- 2. Cole no Supabase SQL Editor
-- 3. Execute (RUN)
-- 4. Compartilhe os resultados aqui no chat
-- 5. Vou ajustar o código baseado na estrutura REAL
-- ============================================================================
