-- Criar tabela de empresas
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  industry TEXT,
  size TEXT,
  location TEXT,
  logo_url TEXT,
  
  -- Campos de enriquecimento
  description TEXT,
  website TEXT,
  linkedin_url TEXT,
  twitter_url TEXT,
  phone TEXT,
  
  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Adicionar company_id na tabela leads
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(domain);
CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE INDEX IF NOT EXISTS idx_leads_company_id ON leads(company_id);

-- Comentários para documentação
COMMENT ON TABLE companies IS 'Tabela de empresas para agrupamento de leads e evitar duplicação';
COMMENT ON COLUMN companies.name IS 'Nome da empresa';
COMMENT ON COLUMN companies.domain IS 'Domínio principal da empresa (ex: google.com) - usado para deduplicação';
COMMENT ON COLUMN companies.industry IS 'Setor/indústria da empresa';
COMMENT ON COLUMN companies.size IS 'Tamanho da empresa (ex: 1-10, 11-50, 51-200, etc)';
COMMENT ON COLUMN companies.location IS 'Localização principal da empresa';
COMMENT ON COLUMN companies.logo_url IS 'URL do logo da empresa';
COMMENT ON COLUMN leads.company_id IS 'Referência para a empresa do lead - permite agrupamento';

-- RLS (Row Level Security) para companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Política: usuários podem ver apenas suas próprias empresas
CREATE POLICY "Users can view their own companies"
  ON companies FOR SELECT
  USING (auth.uid() = user_id);

-- Política: usuários podem inserir empresas para si mesmos
CREATE POLICY "Users can insert their own companies"
  ON companies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: usuários podem atualizar suas próprias empresas
CREATE POLICY "Users can update their own companies"
  ON companies FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: usuários podem deletar suas próprias empresas
CREATE POLICY "Users can delete their own companies"
  ON companies FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_companies_updated_at();
