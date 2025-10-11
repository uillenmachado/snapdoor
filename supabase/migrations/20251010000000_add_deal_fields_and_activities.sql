-- Migration: Adicionar campos de negócio aos leads
-- Data: 2025-10-10
-- Objetivo: Transformar leads em deals completos com valor, data e probabilidade

-- 1. Adicionar campos de deal aos leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS deal_value DECIMAL(12,2) DEFAULT 0;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS expected_close_date DATE;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS probability INTEGER DEFAULT 50;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS deal_stage TEXT DEFAULT 'qualification';

-- 2. Adicionar constraint de probabilidade (separado para evitar erro se já existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'leads_probability_check'
  ) THEN
    ALTER TABLE leads ADD CONSTRAINT leads_probability_check CHECK (probability >= 0 AND probability <= 100);
  END IF;
END $$;

-- 3. Adicionar índices para leads
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_expected_close_date') THEN
    CREATE INDEX idx_leads_expected_close_date ON leads(expected_close_date);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_deal_value') THEN
    CREATE INDEX idx_leads_deal_value ON leads(deal_value);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leads_probability') THEN
    CREATE INDEX idx_leads_probability ON leads(probability);
  END IF;
END $$;

-- 4. Criar tabela de atividades
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo de atividade
  type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'task', 'note', 'whatsapp')),
  
  -- Informações da atividade
  title TEXT NOT NULL,
  description TEXT,
  
  -- Agendamento
  due_date TIMESTAMPTZ,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  
  -- Metadata
  duration INTEGER, -- em minutos
  outcome TEXT, -- resultado da atividade
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Índices para atividades (apenas se a tabela foi criada)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activities') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_activities_lead_id') THEN
      CREATE INDEX idx_activities_lead_id ON activities(lead_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_activities_user_id') THEN
      CREATE INDEX idx_activities_user_id ON activities(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_activities_due_date') THEN
      CREATE INDEX idx_activities_due_date ON activities(due_date);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_activities_completed') THEN
      CREATE INDEX idx_activities_completed ON activities(completed);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_activities_type') THEN
      CREATE INDEX idx_activities_type ON activities(type);
    END IF;
  END IF;
END $$;

-- 6. Trigger para atualizar updated_at (apenas se a tabela existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activities') THEN
    -- Criar função se não existir
    CREATE OR REPLACE FUNCTION update_activities_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;

    -- Criar trigger se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'activities_updated_at') THEN
      CREATE TRIGGER activities_updated_at
        BEFORE UPDATE ON activities
        FOR EACH ROW
        EXECUTE FUNCTION update_activities_updated_at();
    END IF;
  END IF;
END $$;

-- 7. RLS Policies para activities
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activities') THEN
    ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
    
    -- Drop policies if they exist
    DROP POLICY IF EXISTS "Users can view own activities" ON activities;
    DROP POLICY IF EXISTS "Users can insert own activities" ON activities;
    DROP POLICY IF EXISTS "Users can update own activities" ON activities;
    DROP POLICY IF EXISTS "Users can delete own activities" ON activities;
    
    -- Create policies
    CREATE POLICY "Users can view own activities"
      ON activities FOR SELECT
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own activities"
      ON activities FOR INSERT
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own activities"
      ON activities FOR UPDATE
      USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own activities"
      ON activities FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 7. Criar view para métricas do pipeline
CREATE OR REPLACE VIEW pipeline_metrics AS
SELECT 
  user_id,
  stage_id,
  COUNT(*) as deals_count,
  SUM(deal_value) as total_value,
  AVG(deal_value) as avg_value,
  AVG(probability) as avg_probability,
  SUM(deal_value * probability / 100) as weighted_value
FROM leads
WHERE status != 'lost' AND status != 'won'
GROUP BY user_id, stage_id;

-- 8. Adicionar comentários
COMMENT ON COLUMN leads.deal_value IS 'Valor estimado do negócio em reais';
COMMENT ON COLUMN leads.expected_close_date IS 'Data prevista para fechamento do negócio';
COMMENT ON COLUMN leads.probability IS 'Probabilidade de fechamento (0-100%)';
COMMENT ON TABLE activities IS 'Histórico de interações e tarefas relacionadas aos leads';
