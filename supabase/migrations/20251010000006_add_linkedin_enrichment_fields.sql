-- =====================================================
-- ADICIONA CAMPOS DE ENRICHMENT DO LINKEDIN
-- Campos para dados extraídos do LinkedIn Scraper
-- =====================================================

-- Adiciona novos campos para dados do LinkedIn
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

-- Adiciona comentários para documentação
COMMENT ON COLUMN public.leads.full_name IS 'Nome completo do lead (ex: Uillen Machado)';
COMMENT ON COLUMN public.leads.headline IS 'Headline profissional do LinkedIn (ex: B2B Demand Generation Specialist)';
COMMENT ON COLUMN public.leads.about IS 'Resumo "Sobre" do perfil do LinkedIn';
COMMENT ON COLUMN public.leads.location IS 'Localização do lead (ex: São Paulo)';
COMMENT ON COLUMN public.leads.education IS 'Educação do lead (ex: UFPB - Brazil)';
COMMENT ON COLUMN public.leads.connections IS 'Número de conexões no LinkedIn (ex: 500+)';
COMMENT ON COLUMN public.leads.avatar_url IS 'URL da foto do perfil do LinkedIn';
COMMENT ON COLUMN public.leads.seniority IS 'Senioridade do cargo (ex: Senior, Manager)';
COMMENT ON COLUMN public.leads.department IS 'Departamento (ex: Marketing, Sales)';
COMMENT ON COLUMN public.leads.twitter_url IS 'URL do perfil do Twitter';
COMMENT ON COLUMN public.leads.company_size IS 'Tamanho da empresa (número de funcionários)';
COMMENT ON COLUMN public.leads.company_industry IS 'Indústria/setor da empresa';
COMMENT ON COLUMN public.leads.company_location IS 'Localização da empresa';
