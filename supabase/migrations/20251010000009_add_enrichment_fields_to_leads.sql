-- =====================================================
-- ADICIONA CAMPOS DE ENRIQUECIMENTO À TABELA LEADS
-- SnapDoor CRM - Enrichment Fields
-- Data: 10/10/2025
-- =====================================================

-- Adiciona campos de enriquecimento do LinkedIn
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS headline TEXT,
  ADD COLUMN IF NOT EXISTS about TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS education TEXT,
  ADD COLUMN IF NOT EXISTS connections TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS seniority TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT,
  ADD COLUMN IF NOT EXISTS company_size TEXT,
  ADD COLUMN IF NOT EXISTS company_industry TEXT,
  ADD COLUMN IF NOT EXISTS company_location TEXT;

-- Comentários para documentação
COMMENT ON COLUMN public.leads.full_name IS 'Nome completo do lead';
COMMENT ON COLUMN public.leads.headline IS 'Headline curto do LinkedIn (ex: Marketing Manager at Company)';
COMMENT ON COLUMN public.leads.about IS 'Biografia completa do perfil do LinkedIn';
COMMENT ON COLUMN public.leads.location IS 'Localização do lead';
COMMENT ON COLUMN public.leads.education IS 'Formação acadêmica';
COMMENT ON COLUMN public.leads.connections IS 'Número de conexões no LinkedIn';
COMMENT ON COLUMN public.leads.avatar_url IS 'URL da foto de perfil';
COMMENT ON COLUMN public.leads.seniority IS 'Nível de senioridade (Junior, Pleno, Senior, etc)';
COMMENT ON COLUMN public.leads.department IS 'Departamento/área de atuação';
COMMENT ON COLUMN public.leads.twitter_url IS 'URL do perfil no Twitter/X';
COMMENT ON COLUMN public.leads.company_size IS 'Tamanho da empresa';
COMMENT ON COLUMN public.leads.company_industry IS 'Setor/indústria da empresa';
COMMENT ON COLUMN public.leads.company_location IS 'Localização da empresa';
