-- =====================================================
-- DIAGNÓSTICO COMPLETO DO SISTEMA
-- Execute este script ÚNICO no Supabase SQL Editor
-- Ele vai mostrar TODOS os problemas de uma vez
-- =====================================================

-- ========== VARIÁVEL DO USUÁRIO ==========
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1;
  RAISE NOTICE '👤 User ID: %', v_user_id;
END $$;

-- ========== 1. DIAGNÓSTICO: LEADS E EMPRESAS ==========
SELECT 
  '🔍 LEADS E EMPRESAS' as secao,
  NULL::text as id,
  NULL::text as nome,
  NULL::text as company_id,
  NULL::text as company_nome,
  NULL::text as title_cargo,
  NULL::text as headline,
  NULL::text as status
WHERE FALSE
UNION ALL
SELECT 
  '─────────────────────' as secao,
  l.id::text,
  l.first_name || ' ' || l.last_name as nome,
  l.company_id::text,
  c.name as company_nome,
  l.title as title_cargo,
  l.headline,
  CASE 
    WHEN l.company_id IS NULL THEN '⚠️ COMPANY_ID NULL'
    WHEN c.id IS NULL THEN '❌ EMPRESA NÃO EXISTE'
    WHEN l.title IS NULL AND l.headline IS NULL THEN '⚠️ SEM CARGO'
    ELSE '✅ OK'
  END as status
FROM leads l
LEFT JOIN companies c ON l.company_id = c.id
WHERE l.user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1);

-- ========== 2. DIAGNÓSTICO: COMPANIES DISPONÍVEIS ==========
SELECT 
  '🏢 EMPRESAS CADASTRADAS' as info,
  NULL::text as id,
  NULL::text as nome,
  NULL::bigint as total_leads
WHERE FALSE
UNION ALL
SELECT 
  '─────────────────────' as info,
  c.id::text,
  c.name as nome,
  COUNT(l.id) as total_leads
FROM companies c
LEFT JOIN leads l ON c.id = l.company_id
WHERE c.user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1)
GROUP BY c.id, c.name;

-- ========== 3. DIAGNÓSTICO: DEALS E STAGES ==========
SELECT 
  '📊 DEALS (NEGÓCIOS)' as info,
  NULL::text as deal_id,
  NULL::text as deal_titulo,
  NULL::text as deal_stage_id,
  NULL::text as deal_pipeline_id,
  NULL::numeric as deal_valor
WHERE FALSE
UNION ALL
SELECT 
  '─────────────────────' as info,
  d.id::text as deal_id,
  d.title as deal_titulo,
  d.stage_id::text as deal_stage_id,
  d.pipeline_id::text as deal_pipeline_id,
  d.value as deal_valor
FROM deals d
WHERE d.user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1);

-- ========== 4. DIAGNÓSTICO: STAGES DO PIPELINE ==========
SELECT
  '🎯 STAGES (ETAPAS DO PIPELINE)' as info,
  NULL::text as stage_id,
  NULL::text as stage_nome,
  NULL::integer as ordem,
  NULL::text as pipeline_id,
  NULL::text as pipeline_nome
WHERE FALSE
UNION ALL
SELECT 
  '─────────────────────' as info,
  s.id::text as stage_id,
  s.name as stage_nome,
  s.position as ordem,
  s.pipeline_id::text,
  p.name as pipeline_nome
FROM stages s
JOIN pipelines p ON s.pipeline_id = p.id
WHERE p.user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1);

-- ========== 5. DIAGNÓSTICO: CORRESPONDÊNCIA DEALS ↔ STAGES ==========
SELECT
  '🔗 VERIFICAÇÃO: DEALS ↔ STAGES' as info,
  NULL::text as deal_titulo,
  NULL::text as deal_stage_id,
  NULL::text as stage_real_id,
  NULL::text as stage_nome,
  NULL::text as status_match
WHERE FALSE
UNION ALL
SELECT 
  '─────────────────────' as info,
  d.title as deal_titulo,
  d.stage_id::text as deal_stage_id,
  s.id::text as stage_real_id,
  s.name as stage_nome,
  CASE 
    WHEN d.stage_id IS NULL THEN '❌ STAGE_ID NULL'
    WHEN s.id IS NULL THEN '❌ STAGE NÃO EXISTE'
    WHEN d.stage_id = s.id THEN '✅ CORRESPONDÊNCIA OK'
    ELSE '❌ ID DIFERENTE'
  END as status_match
FROM deals d
LEFT JOIN stages s ON d.stage_id = s.id
WHERE d.user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1);

-- ========== 6. RESUMO: DEALS POR STAGE ==========
SELECT
  '📈 RESUMO: DEALS POR STAGE' as info,
  NULL::text as stage_nome,
  NULL::bigint as total_deals,
  NULL::numeric as valor_total
WHERE FALSE
UNION ALL
SELECT 
  '─────────────────────' as info,
  COALESCE(s.name, '⚠️ SEM STAGE') as stage_nome,
  COUNT(d.id) as total_deals,
  COALESCE(SUM(d.value), 0) as valor_total
FROM stages s
LEFT JOIN deals d ON s.id = d.stage_id
WHERE s.pipeline_id IN (
  SELECT id FROM pipelines WHERE user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1)
)
GROUP BY s.name, s.position;

-- ========== 7. DIAGNÓSTICO: LEADS SEM COMPANY_ID ==========
SELECT 
  '⚠️ LEADS SEM EMPRESA (company_id NULL)' as problema,
  NULL::text as lead_id,
  NULL::text as nome_lead,
  NULL::text as email
WHERE FALSE
UNION ALL
SELECT 
  '─────────────────────' as problema,
  l.id::text as lead_id,
  l.first_name || ' ' || l.last_name as nome_lead,
  l.email
FROM leads l
WHERE l.user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1)
  AND l.company_id IS NULL;

-- ========== 8. DIAGNÓSTICO: DEALS SEM STAGE_ID ==========
SELECT 
  '⚠️ DEALS SEM STAGE (stage_id NULL)' as problema,
  NULL::text as deal_id,
  NULL::text as deal_titulo,
  NULL::numeric as deal_valor
WHERE FALSE
UNION ALL
SELECT 
  '─────────────────────' as problema,
  d.id::text as deal_id,
  d.title as deal_titulo,
  d.value as deal_valor
FROM deals d
WHERE d.user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1)
  AND d.stage_id IS NULL;

-- ========== RESUMO FINAL ==========
SELECT 
  '📊 RESUMO FINAL' as categoria,
  NULL::text as metrica,
  NULL::bigint as quantidade
WHERE FALSE
UNION ALL
SELECT 
  '═══════════════════════' as categoria,
  'Total de Leads' as metrica,
  COUNT(*) as quantidade
FROM leads
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1)
UNION ALL
SELECT 
  '═══════════════════════' as categoria,
  'Leads COM empresa' as metrica,
  COUNT(*) as quantidade
FROM leads
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1)
  AND company_id IS NOT NULL
UNION ALL
SELECT 
  '═══════════════════════' as categoria,
  'Leads SEM empresa' as metrica,
  COUNT(*) as quantidade
FROM leads
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1)
  AND company_id IS NULL
UNION ALL
SELECT 
  '═══════════════════════' as categoria,
  'Total de Empresas' as metrica,
  COUNT(*) as quantidade
FROM companies
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1)
UNION ALL
SELECT 
  '═══════════════════════' as categoria,
  'Total de Deals' as metrica,
  COUNT(*) as quantidade
FROM deals
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1)
UNION ALL
SELECT 
  '═══════════════════════' as categoria,
  'Deals COM stage' as metrica,
  COUNT(*) as quantidade
FROM deals
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1)
  AND stage_id IS NOT NULL
UNION ALL
SELECT 
  '═══════════════════════' as categoria,
  'Deals SEM stage' as metrica,
  COUNT(*) as quantidade
FROM deals
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1)
  AND stage_id IS NULL
UNION ALL
SELECT 
  '═══════════════════════' as categoria,
  'Total de Stages' as metrica,
  COUNT(*) as quantidade
FROM stages s
JOIN pipelines p ON s.pipeline_id = p.id
WHERE p.user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1);
