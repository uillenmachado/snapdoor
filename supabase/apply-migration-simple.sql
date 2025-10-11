-- Aplicação manual da migration - CRM B2B Fase 1
-- Execute este arquivo no SQL Editor do Supabase Dashboard

-- 1. Adicionar campos de deal aos leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS deal_value DECIMAL(12,2) DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS expected_close_date DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS probability INTEGER DEFAULT 50;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS deal_stage TEXT DEFAULT 'qualification';

-- 2. Adicionar constraint de probabilidade
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leads_probability_check'
  ) THEN
    ALTER TABLE leads ADD CONSTRAINT leads_probability_check CHECK (probability >= 0 AND probability <= 100);
  END IF;
END $$;

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_expected_close_date ON leads(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_leads_deal_value ON leads(deal_value);
CREATE INDEX IF NOT EXISTS idx_leads_probability ON leads(probability);

-- 4. Atualizar leads existentes com valores padrão
UPDATE leads 
SET 
  deal_value = 25000 + (RANDOM() * 75000)::INTEGER,
  expected_close_date = CURRENT_DATE + (RANDOM() * 60)::INTEGER,
  probability = 40 + (RANDOM() * 40)::INTEGER
WHERE deal_value = 0 OR deal_value IS NULL;

-- 5. Mostrar resultado
SELECT 
  COUNT(*) as total_leads,
  AVG(deal_value) as valor_medio,
  SUM(deal_value) as valor_total_pipeline
FROM leads
WHERE status != 'won' AND status != 'lost';
