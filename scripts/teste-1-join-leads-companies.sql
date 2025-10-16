-- ====================================================
-- SQL 1: TESTAR JOIN LEADS ↔ COMPANIES
-- Execute no Supabase SQL Editor
-- ====================================================

SELECT 
  l.first_name || ' ' || l.last_name as lead_nome,
  l.company_id::text,
  c.id::text as company_real_id,
  c.name as company_nome,
  l.title,
  l.headline,
  CASE 
    WHEN l.company_id IS NULL THEN '❌ COMPANY_ID NULL'
    WHEN c.id IS NULL THEN '❌ EMPRESA NÃO EXISTE (RLS?)'
    ELSE '✅ JOIN OK'
  END as status_join
FROM leads l
LEFT JOIN companies c ON l.company_id = c.id
WHERE l.user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1)
ORDER BY l.first_name
LIMIT 10;

-- ====================================================
-- RESULTADO ESPERADO:
-- - Todas as 10 linhas devem mostrar company_nome preenchido
-- - status_join deve ser "✅ JOIN OK" para todos
-- - Se algum mostrar "❌ EMPRESA NÃO EXISTE" → problema de RLS
-- ====================================================
