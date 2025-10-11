-- ============================================================
-- MIGRATION: CRM B2B - Fase 1
-- Data: 10/10/2025
-- ============================================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse: https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm/sql/new
-- 2. Cole TODO este conteúdo
-- 3. Clique em "RUN"
-- 
-- ============================================================

-- 1. Adicionar campos de negócio aos leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS deal_value DECIMAL(12,2) DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS expected_close_date DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS probability INTEGER DEFAULT 50;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS deal_stage TEXT DEFAULT 'qualification';

-- 2. Adicionar constraint de probabilidade
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'leads_probability_check'
  ) THEN
    ALTER TABLE leads ADD CONSTRAINT leads_probability_check 
    CHECK (probability >= 0 AND probability <= 100);
  END IF;
END $$;

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_expected_close_date ON leads(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_leads_deal_value ON leads(deal_value);
CREATE INDEX IF NOT EXISTS idx_leads_probability ON leads(probability);

-- 4. Popular leads existentes com valores de exemplo
UPDATE leads 
SET 
  deal_value = CASE 
    WHEN company LIKE '%Consulting%' THEN 75000
    WHEN company LIKE '%Marketing%' THEN 45000
    ELSE 25000 + (RANDOM() * 50000)::INTEGER
  END,
  expected_close_date = CURRENT_DATE + (15 + (RANDOM() * 45)::INTEGER),
  probability = CASE
    WHEN status = 'active' THEN 50 + (RANDOM() * 30)::INTEGER
    WHEN status = 'new' THEN 30 + (RANDOM() * 20)::INTEGER
    ELSE 60 + (RANDOM() * 20)::INTEGER
  END
WHERE deal_value = 0 OR deal_value IS NULL;

-- 5. Verificar resultado
SELECT 
  'Leads atualizados' as status,
  COUNT(*) as total_leads,
  ROUND(AVG(deal_value), 2) as valor_medio,
  ROUND(SUM(deal_value), 2) as valor_total_pipeline,
  MIN(expected_close_date) as primeira_data,
  MAX(expected_close_date) as ultima_data
FROM leads
WHERE status != 'won' AND status != 'lost';

-- ============================================================
-- FIM DA MIGRATION
-- ============================================================
-- 
-- ✅ Se tudo correr bem, você verá:
-- - Total de leads atualizados
-- - Valor médio dos negócios
-- - Valor total do pipeline
-- 
-- 🎉 Após executar, recarregue o Dashboard!
-- 
-- ============================================================
