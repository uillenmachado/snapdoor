-- =====================================================
-- FUNÇÃO DE DIAGNÓSTICO VIA RPC
-- Cria funções que podem ser chamadas via supabase.rpc()
-- =====================================================

-- Função 1: Diagnosticar Leads com Companies
CREATE OR REPLACE FUNCTION diagnostico_leads_companies()
RETURNS TABLE (
  lead_nome TEXT,
  company_id TEXT,
  company_nome TEXT,
  cargo TEXT,
  status TEXT
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.first_name || ' ' || l.last_name as lead_nome,
    l.company_id::text,
    c.name as company_nome,
    COALESCE(l.title, l.headline) as cargo,
    CASE 
      WHEN l.company_id IS NULL THEN '⚠️ COMPANY_ID NULL'
      WHEN c.id IS NULL THEN '❌ EMPRESA NÃO EXISTE (RLS?)'
      ELSE '✅ JOIN OK'
    END as status
  FROM leads l
  LEFT JOIN companies c ON l.company_id = c.id
  WHERE l.user_id = auth.uid()
  ORDER BY l.first_name
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Função 2: Diagnosticar Deals com Stages
CREATE OR REPLACE FUNCTION diagnostico_deals_stages()
RETURNS TABLE (
  deal_titulo TEXT,
  stage_id TEXT,
  stage_nome TEXT,
  stage_position INTEGER,
  status TEXT
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.title as deal_titulo,
    d.stage_id::text,
    s.name as stage_nome,
    s.position as stage_position,
    CASE 
      WHEN d.stage_id IS NULL THEN '❌ STAGE_ID NULL'
      WHEN s.id IS NULL THEN '❌ STAGE NÃO EXISTE (RLS?)'
      WHEN d.stage_id = s.id THEN '✅ MATCH OK'
      ELSE '❌ IDS DIFERENTES'
    END as status
  FROM deals d
  LEFT JOIN stages s ON d.stage_id = s.id
  WHERE d.user_id = auth.uid()
  ORDER BY s.position, d.title
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Função 3: Verificar RLS Policies
CREATE OR REPLACE FUNCTION diagnostico_rls_policies()
RETURNS TABLE (
  tabela TEXT,
  politica TEXT,
  comando TEXT,
  condicao TEXT
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tablename::text as tabela,
    policyname::text as politica,
    cmd::text as comando,
    qual::text as condicao
  FROM pg_policies 
  WHERE tablename IN ('leads', 'companies', 'deals', 'stages')
  ORDER BY tablename, policyname;
END;
$$ LANGUAGE plpgsql;

-- Conceder permissões de execução para usuários autenticados
GRANT EXECUTE ON FUNCTION diagnostico_leads_companies() TO authenticated;
GRANT EXECUTE ON FUNCTION diagnostico_deals_stages() TO authenticated;
GRANT EXECUTE ON FUNCTION diagnostico_rls_policies() TO authenticated;
