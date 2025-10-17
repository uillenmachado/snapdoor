-- ============================================================================
-- 🔍 DIAGNÓSTICO URGENTE: Qual é a estrutura REAL da tabela LEADS?
-- ============================================================================

-- 1️⃣ LISTAR **TODAS** AS COLUNAS QUE REALMENTE EXISTEM
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
-- 2️⃣ VERIFICAR SE A TABELA LEADS SEQUER EXISTE
-- ============================================================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'leads';

-- ============================================================================
-- 3️⃣ LISTAR TODAS AS TABELAS DO SCHEMA PUBLIC
-- ============================================================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================================================
-- 📋 INSTRUÇÕES URGENTES:
-- 1. Execute este SQL no Supabase SQL Editor
-- 2. Cole TODOS os resultados aqui no chat
-- 3. Vou criar a estrutura correta baseada no que REALMENTE existe
-- ============================================================================
