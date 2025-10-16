-- ====================================================
-- SQL 3: TESTAR CORRESPONDÊNCIA DEALS ↔ STAGES
-- Execute no Supabase SQL Editor
-- ====================================================

SELECT 
  d.title as deal_titulo,
  d.stage_id::text,
  s.id::text as stage_real_id,
  s.name as stage_nome,
  s.position as ordem,
  CASE 
    WHEN d.stage_id IS NULL THEN '❌ STAGE_ID NULL'
    WHEN s.id IS NULL THEN '❌ STAGE NÃO EXISTE (RLS?)'
    WHEN d.stage_id = s.id THEN '✅ MATCH OK'
    ELSE '❌ IDS DIFERENTES'
  END as status_match
FROM deals d
LEFT JOIN stages s ON d.stage_id = s.id
WHERE d.user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1)
ORDER BY s.position, d.title
LIMIT 10;

-- ====================================================
-- RESULTADO ESPERADO:
-- - Todas as 10 linhas devem mostrar stage_nome preenchido
-- - status_match deve ser "✅ MATCH OK" para todos
-- - Se algum mostrar "❌ STAGE NÃO EXISTE" → problema de RLS
-- ====================================================
