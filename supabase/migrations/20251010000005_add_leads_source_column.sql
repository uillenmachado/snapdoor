-- =====================================================
-- FIX: Adicionar coluna 'source' na tabela leads
-- Para rastrear origem dos leads (manual, prospection, import, etc)
-- =====================================================

-- 1. Adicionar coluna source se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'source'
  ) THEN
    ALTER TABLE leads ADD COLUMN source TEXT DEFAULT 'manual';
  END IF;
END $$;

-- 2. Criar enum para sources (opcional, mas recomendado)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_source') THEN
    CREATE TYPE lead_source AS ENUM (
      'manual',
      'prospection',
      'import',
      'linkedin',
      'hunter',
      'snapdoor_ai',
      'api',
      'other'
    );
  END IF;
END $$;

-- 3. Atualizar coluna para usar enum (depois que dados existentes estiverem corretos)
-- ALTER TABLE leads ALTER COLUMN source TYPE lead_source USING source::lead_source;

-- 4. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);

-- 5. Comentários
COMMENT ON COLUMN leads.source IS 'Origem do lead: manual, prospection, import, linkedin, hunter, snapdoor_ai, api, other';
