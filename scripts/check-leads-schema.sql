-- =====================================================
-- DIAGNÓSTICO: Ver schema REAL da tabela leads
-- Execute este script PRIMEIRO no Supabase SQL Editor
-- =====================================================

-- Ver todas as colunas da tabela leads
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'leads'
ORDER BY ordinal_position;
