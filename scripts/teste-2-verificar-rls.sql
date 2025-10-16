-- ====================================================
-- SQL 2: VERIFICAR RLS POLICIES
-- Execute no Supabase SQL Editor
-- ====================================================

-- Verificar políticas da tabela companies
SELECT 
  '🔒 RLS COMPANIES' as tipo,
  policyname as politica,
  cmd as comando,
  qual as condicao
FROM pg_policies 
WHERE tablename = 'companies'

UNION ALL

-- Verificar políticas da tabela leads
SELECT 
  '🔒 RLS LEADS' as tipo,
  policyname as politica,
  cmd as comando,
  qual as condicao
FROM pg_policies 
WHERE tablename = 'leads'

UNION ALL

-- Verificar políticas da tabela deals
SELECT 
  '🔒 RLS DEALS' as tipo,
  policyname as politica,
  cmd as comando,
  qual as condicao
FROM pg_policies 
WHERE tablename = 'deals'

UNION ALL

-- Verificar políticas da tabela stages
SELECT 
  '🔒 RLS STAGES' as tipo,
  policyname as politica,
  cmd as comando,
  qual as condicao
FROM pg_policies 
WHERE tablename = 'stages';

-- ====================================================
-- ANÁLISE:
-- - Verificar se existe política SELECT para companies
-- - Verificar se a condição permite JOIN com outras tabelas
-- - Condição deve ser algo como: user_id = auth.uid()
-- ====================================================
