-- =====================================================
-- DIAGNÓSTICO: Verificar relacionamento entre deals e stages
-- Execute este script no Supabase SQL Editor
-- =====================================================

-- 1. Ver todos os deals do usuário dev
SELECT 
  d.id,
  d.title,
  d.value,
  d.stage_id as deal_stage_id,
  d.pipeline_id as deal_pipeline_id,
  d.created_at
FROM deals d
WHERE d.user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1)
ORDER BY d.created_at DESC;

-- 2. Ver todos os stages do pipeline "Pipeline de Vendas"
SELECT 
  s.id as stage_id,
  s.name as stage_nome,
  s.order_index,
  s.pipeline_id,
  p.name as pipeline_nome
FROM stages s
JOIN pipelines p ON s.pipeline_id = p.id
WHERE p.user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1)
ORDER BY s.order_index;

-- 3. Verificar se stage_id dos deals corresponde aos stages reais
SELECT 
  d.id as deal_id,
  d.title as deal_titulo,
  d.stage_id as deal_stage_id,
  s.id as stage_real_id,
  s.name as stage_nome,
  p.name as pipeline_nome,
  CASE 
    WHEN d.stage_id = s.id THEN '✅ CORRESPONDÊNCIA OK'
    WHEN d.stage_id IS NULL THEN '⚠️ STAGE_ID NULL'
    ELSE '❌ STAGE_ID INVÁLIDO'
  END as status_relacionamento
FROM deals d
LEFT JOIN stages s ON d.stage_id = s.id
LEFT JOIN pipelines p ON s.pipeline_id = p.id
WHERE d.user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1)
ORDER BY d.created_at DESC;

-- 4. Contar deals por stage
SELECT 
  s.name as stage_nome,
  s.id as stage_id,
  COUNT(d.id) as total_deals,
  COALESCE(SUM(d.value), 0) as valor_total
FROM stages s
LEFT JOIN deals d ON s.id = d.stage_id
WHERE s.pipeline_id IN (
  SELECT id FROM pipelines WHERE user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1)
)
GROUP BY s.id, s.name, s.order_index
ORDER BY s.order_index;
