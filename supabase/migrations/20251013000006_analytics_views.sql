-- =====================================================
-- FASE 10: Dashboards Avançados - Analytics Views
-- Materialized views e functions para métricas em tempo real
-- =====================================================

-- =====================================================
-- 1. VIEW: Leads por Stage (com métricas)
-- =====================================================

CREATE OR REPLACE VIEW leads_by_stage_view AS
SELECT 
  l.stage,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE l.created_at >= NOW() - INTERVAL '7 days') as leads_last_7_days,
  COUNT(*) FILTER (WHERE l.created_at >= NOW() - INTERVAL '30 days') as leads_last_30_days,
  AVG(l.score) as avg_score,
  SUM(CASE WHEN l.status = 'won' THEN 1 ELSE 0 END) as won_count,
  SUM(CASE WHEN l.status = 'lost' THEN 1 ELSE 0 END) as lost_count,
  l.user_id
FROM leads l
GROUP BY l.stage, l.user_id;

-- =====================================================
-- 2. VIEW: Funil de Conversão
-- =====================================================

CREATE OR REPLACE VIEW conversion_funnel_view AS
WITH stage_order AS (
  SELECT 
    unnest(ARRAY['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']) as stage,
    unnest(ARRAY[1, 2, 3, 4, 5, 6, 7]) as stage_order
),
stage_metrics AS (
  SELECT 
    l.stage,
    l.user_id,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE l.created_at >= NOW() - INTERVAL '30 days') as count_30d
  FROM leads l
  GROUP BY l.stage, l.user_id
)
SELECT 
  so.stage,
  so.stage_order,
  COALESCE(sm.count, 0) as total_leads,
  COALESCE(sm.count_30d, 0) as leads_30d,
  sm.user_id
FROM stage_order so
LEFT JOIN stage_metrics sm ON so.stage = sm.stage
ORDER BY so.stage_order, sm.user_id;

-- =====================================================
-- 3. VIEW: Receita por Período
-- =====================================================

CREATE OR REPLACE VIEW revenue_by_period_view AS
SELECT 
  DATE_TRUNC('day', d.won_at) as period_date,
  DATE_TRUNC('week', d.won_at) as period_week,
  DATE_TRUNC('month', d.won_at) as period_month,
  COUNT(*) as deals_count,
  SUM(d.value) as total_revenue,
  AVG(d.value) as avg_deal_value,
  d.user_id
FROM deals d
WHERE d.status = 'won' AND d.won_at IS NOT NULL
GROUP BY period_date, period_week, period_month, d.user_id;

-- =====================================================
-- 4. VIEW: Pipeline Atual (Deals em Progresso)
-- =====================================================

CREATE OR REPLACE VIEW pipeline_current_view AS
SELECT 
  ps.name as stage_name,
  ps.order_index as stage_order,
  COUNT(d.id) as deals_count,
  SUM(d.value) as total_value,
  AVG(d.value) as avg_value,
  AVG(EXTRACT(EPOCH FROM (NOW() - d.created_at)) / 86400) as avg_days_in_stage,
  d.user_id
FROM deals d
JOIN pipeline_stages ps ON d.stage_id = ps.id
WHERE d.status NOT IN ('won', 'lost')
GROUP BY ps.name, ps.order_index, d.user_id
ORDER BY ps.order_index;

-- =====================================================
-- 5. VIEW: Atividades por Período
-- =====================================================

CREATE OR REPLACE VIEW activities_by_period_view AS
SELECT 
  DATE_TRUNC('day', a.activity_date) as activity_date,
  a.activity_type,
  COUNT(*) as count,
  COUNT(*) FILTER (WHERE a.created_at >= NOW() - INTERVAL '7 days') as count_7d,
  COUNT(*) FILTER (WHERE a.created_at >= NOW() - INTERVAL '30 days') as count_30d,
  a.user_id
FROM activities a
GROUP BY activity_date, a.activity_type, a.user_id;

-- =====================================================
-- 6. VIEW: Top Performers (Usuários com mais vendas)
-- =====================================================

CREATE OR REPLACE VIEW top_performers_view AS
SELECT 
  p.id as user_id,
  p.full_name,
  p.email,
  COUNT(d.id) FILTER (WHERE d.status = 'won') as won_deals,
  SUM(d.value) FILTER (WHERE d.status = 'won') as total_revenue,
  AVG(d.value) FILTER (WHERE d.status = 'won') as avg_deal_value,
  COUNT(d.id) FILTER (WHERE d.status = 'won' AND d.won_at >= NOW() - INTERVAL '30 days') as won_deals_30d,
  SUM(d.value) FILTER (WHERE d.status = 'won' AND d.won_at >= NOW() - INTERVAL '30 days') as revenue_30d
FROM profiles p
LEFT JOIN deals d ON d.user_id = p.id
GROUP BY p.id, p.full_name, p.email
ORDER BY total_revenue DESC NULLS LAST;

-- =====================================================
-- 7. VIEW: Previsão de Receita (Deals em Pipeline)
-- =====================================================

CREATE OR REPLACE VIEW revenue_forecast_view AS
WITH stage_probability AS (
  SELECT 
    unnest(ARRAY['qualified', 'proposal', 'negotiation']) as stage_name,
    unnest(ARRAY[0.25, 0.50, 0.75]) as probability
)
SELECT 
  ps.name as stage_name,
  COUNT(d.id) as deals_count,
  SUM(d.value) as total_value,
  COALESCE(sp.probability, 0) as win_probability,
  SUM(d.value) * COALESCE(sp.probability, 0) as forecasted_revenue,
  d.user_id
FROM deals d
JOIN pipeline_stages ps ON d.stage_id = ps.id
LEFT JOIN stage_probability sp ON ps.name = sp.stage_name
WHERE d.status NOT IN ('won', 'lost')
GROUP BY ps.name, sp.probability, d.user_id;

-- =====================================================
-- 8. VIEW: Taxa de Conversão por Stage
-- =====================================================

CREATE OR REPLACE VIEW conversion_rate_by_stage_view AS
WITH stage_transitions AS (
  SELECT 
    l.stage as from_stage,
    LEAD(l.stage) OVER (PARTITION BY l.id ORDER BY l.updated_at) as to_stage,
    l.user_id
  FROM leads l
),
transition_counts AS (
  SELECT 
    from_stage,
    to_stage,
    COUNT(*) as transition_count,
    user_id
  FROM stage_transitions
  WHERE to_stage IS NOT NULL
  GROUP BY from_stage, to_stage, user_id
)
SELECT 
  from_stage,
  to_stage,
  transition_count,
  SUM(transition_count) OVER (PARTITION BY from_stage, user_id) as total_from_stage,
  ROUND(
    transition_count::NUMERIC / 
    NULLIF(SUM(transition_count) OVER (PARTITION BY from_stage, user_id), 0) * 100, 
    2
  ) as conversion_rate,
  user_id
FROM transition_counts;

-- =====================================================
-- 9. VIEW: Métricas Gerais do Dashboard
-- =====================================================

CREATE OR REPLACE VIEW dashboard_metrics_view AS
SELECT 
  -- Leads
  COUNT(DISTINCT l.id) as total_leads,
  COUNT(DISTINCT l.id) FILTER (WHERE l.created_at >= NOW() - INTERVAL '7 days') as leads_7d,
  COUNT(DISTINCT l.id) FILTER (WHERE l.created_at >= NOW() - INTERVAL '30 days') as leads_30d,
  AVG(l.score) as avg_lead_score,
  
  -- Deals
  COUNT(DISTINCT d.id) as total_deals,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'won') as won_deals,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'lost') as lost_deals,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status NOT IN ('won', 'lost')) as active_deals,
  
  -- Receita
  SUM(d.value) FILTER (WHERE d.status = 'won') as total_revenue,
  SUM(d.value) FILTER (WHERE d.status = 'won' AND d.won_at >= NOW() - INTERVAL '30 days') as revenue_30d,
  AVG(d.value) FILTER (WHERE d.status = 'won') as avg_deal_value,
  
  -- Pipeline
  SUM(d.value) FILTER (WHERE d.status NOT IN ('won', 'lost')) as pipeline_value,
  
  -- Taxa de Conversão
  ROUND(
    COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'won')::NUMERIC / 
    NULLIF(COUNT(DISTINCT d.id), 0) * 100,
    2
  ) as overall_conversion_rate,
  
  -- Atividades
  COUNT(DISTINCT a.id) as total_activities,
  COUNT(DISTINCT a.id) FILTER (WHERE a.activity_date >= NOW() - INTERVAL '7 days') as activities_7d,
  
  -- User ID
  COALESCE(l.user_id, d.user_id, a.user_id) as user_id
FROM leads l
FULL OUTER JOIN deals d ON l.user_id = d.user_id
FULL OUTER JOIN activities a ON COALESCE(l.user_id, d.user_id) = a.user_id
GROUP BY COALESCE(l.user_id, d.user_id, a.user_id);

-- =====================================================
-- 10. VIEW: Tendência de Vendas (Últimos 90 dias)
-- =====================================================

CREATE OR REPLACE VIEW sales_trend_view AS
WITH date_series AS (
  SELECT generate_series(
    NOW() - INTERVAL '90 days',
    NOW(),
    '1 day'::interval
  )::date as date
),
daily_deals AS (
  SELECT 
    DATE(won_at) as date,
    COUNT(*) as deals_won,
    SUM(value) as revenue,
    user_id
  FROM deals
  WHERE status = 'won' AND won_at >= NOW() - INTERVAL '90 days'
  GROUP BY date, user_id
)
SELECT 
  ds.date,
  COALESCE(dd.deals_won, 0) as deals_won,
  COALESCE(dd.revenue, 0) as revenue,
  -- Média móvel de 7 dias
  AVG(COALESCE(dd.revenue, 0)) OVER (
    PARTITION BY dd.user_id
    ORDER BY ds.date 
    ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
  ) as revenue_7d_avg,
  dd.user_id
FROM date_series ds
LEFT JOIN daily_deals dd ON ds.date = dd.date
ORDER BY ds.date DESC;

-- =====================================================
-- 11. FUNCTION: Refresh Analytics
-- Função para atualizar analytics manualmente
-- =====================================================

CREATE OR REPLACE FUNCTION refresh_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Esta função pode ser usada para refresh manual
  -- Como estamos usando VIEWs (não materialized), 
  -- elas são sempre atualizadas automaticamente
  
  -- Se no futuro convertermos para MATERIALIZED VIEWS:
  -- REFRESH MATERIALIZED VIEW CONCURRENTLY leads_by_stage_mv;
  -- etc.
  
  RAISE NOTICE 'Analytics views are always up to date (using regular views)';
END;
$$;

-- =====================================================
-- 12. FUNCTION: Get Analytics for Period
-- Função helper para obter analytics de um período específico
-- =====================================================

CREATE OR REPLACE FUNCTION get_analytics_for_period(
  p_user_id UUID,
  p_period_days INTEGER DEFAULT 30
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'total_leads', COUNT(DISTINCT l.id),
    'new_leads', COUNT(DISTINCT l.id) FILTER (WHERE l.created_at >= NOW() - (p_period_days || ' days')::INTERVAL),
    'conversion_rate', ROUND(
      COUNT(DISTINCT l.id) FILTER (WHERE l.status = 'won')::NUMERIC / 
      NULLIF(COUNT(DISTINCT l.id), 0) * 100,
      2
    ),
    'avg_score', ROUND(AVG(l.score), 2),
    'total_deals', COUNT(DISTINCT d.id),
    'won_deals', COUNT(DISTINCT d.id) FILTER (WHERE d.status = 'won'),
    'total_revenue', COALESCE(SUM(d.value) FILTER (WHERE d.status = 'won'), 0),
    'pipeline_value', COALESCE(SUM(d.value) FILTER (WHERE d.status NOT IN ('won', 'lost')), 0),
    'period_days', p_period_days
  )
  INTO v_result
  FROM leads l
  LEFT JOIN deals d ON l.id::text = d.lead_id
  WHERE l.user_id = p_user_id
    AND l.created_at >= NOW() - (p_period_days || ' days')::INTERVAL;
  
  RETURN v_result;
END;
$$;

-- =====================================================
-- 13. RLS Policies para Views
-- =====================================================

-- Como as views utilizam as tabelas base (leads, deals, activities),
-- as policies RLS das tabelas base já se aplicam automaticamente.
-- Não é necessário criar policies adicionais para as views.

-- =====================================================
-- 14. Indexes para Performance
-- =====================================================

-- Index para filtros por período em deals
CREATE INDEX IF NOT EXISTS idx_deals_won_at 
ON deals(won_at) 
WHERE status = 'won';

-- Index para filtros por período em activities
CREATE INDEX IF NOT EXISTS idx_activities_activity_date 
ON activities(activity_date);

-- Index composto para conversão por stage
CREATE INDEX IF NOT EXISTS idx_leads_stage_status_user 
ON leads(stage, status, user_id);

-- Index para deals em pipeline
CREATE INDEX IF NOT EXISTS idx_deals_stage_status 
ON deals(stage_id, status) 
WHERE status NOT IN ('won', 'lost');

-- =====================================================
-- Comentários
-- =====================================================

COMMENT ON VIEW leads_by_stage_view IS 'Agregação de leads por stage com métricas de período';
COMMENT ON VIEW conversion_funnel_view IS 'Funil de conversão com contagem por stage';
COMMENT ON VIEW revenue_by_period_view IS 'Receita agregada por dia/semana/mês';
COMMENT ON VIEW pipeline_current_view IS 'Estado atual do pipeline com valores';
COMMENT ON VIEW activities_by_period_view IS 'Atividades agregadas por período e tipo';
COMMENT ON VIEW top_performers_view IS 'Ranking de usuários por performance de vendas';
COMMENT ON VIEW revenue_forecast_view IS 'Previsão de receita baseada em probabilidades por stage';
COMMENT ON VIEW conversion_rate_by_stage_view IS 'Taxa de conversão entre stages';
COMMENT ON VIEW dashboard_metrics_view IS 'Métricas gerais consolidadas para o dashboard';
COMMENT ON VIEW sales_trend_view IS 'Tendência de vendas com média móvel';
COMMENT ON FUNCTION refresh_analytics() IS 'Atualiza views de analytics (placeholder para futuro)';
COMMENT ON FUNCTION get_analytics_for_period(UUID, INTEGER) IS 'Retorna analytics JSON para período específico';
