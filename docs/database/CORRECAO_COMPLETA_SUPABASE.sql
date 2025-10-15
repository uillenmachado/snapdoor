-- ============================================
-- CORREÇÃO COMPLETA SUPABASE - SNAPDOOR CRM
-- ============================================
-- Data: 15 de Outubro de 2025
-- Objetivo: Corrigir erros 404, 400 e 409
-- 
-- IMPORTANTE: Execute este script COMPLETO no Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm/sql/new
--
-- Tempo estimado: ~2 minutos
-- ============================================

-- ============================================
-- 1. CRIAR TABELA CREDIT_PACKAGES (se não existir)
-- Corrige: Erro 404 - credit_packages não encontrado
-- ============================================

-- Tabela de pacotes de créditos
CREATE TABLE IF NOT EXISTS credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  credits INTEGER NOT NULL CHECK (credits > 0),
  price_brl DECIMAL(10, 2) NOT NULL CHECK (price_brl >= 0),
  discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer usuário autenticado pode ver pacotes ativos
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'credit_packages' AND policyname = 'Anyone can view active credit packages'
  ) THEN
    CREATE POLICY "Anyone can view active credit packages"
      ON credit_packages FOR SELECT
      USING (is_active = true);
  END IF;
END $$;

-- Inserir pacotes padrão (apenas se tabela estiver vazia)
INSERT INTO credit_packages (name, credits, price_brl, discount_percentage)
SELECT 'Starter', 100, 49.90, 0 WHERE NOT EXISTS (SELECT 1 FROM credit_packages WHERE name = 'Starter')
UNION ALL
SELECT 'Professional', 500, 199.90, 20 WHERE NOT EXISTS (SELECT 1 FROM credit_packages WHERE name = 'Professional')
UNION ALL
SELECT 'Business', 1000, 349.90, 30 WHERE NOT EXISTS (SELECT 1 FROM credit_packages WHERE name = 'Business')
UNION ALL
SELECT 'Enterprise', 5000, 1499.90, 40 WHERE NOT EXISTS (SELECT 1 FROM credit_packages WHERE name = 'Enterprise');

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_credit_packages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_credit_packages_updated_at ON credit_packages;
CREATE TRIGGER update_credit_packages_updated_at
  BEFORE UPDATE ON credit_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_credit_packages_updated_at();

-- Comentários
COMMENT ON TABLE credit_packages IS 'Pacotes de créditos disponíveis para compra';
COMMENT ON COLUMN credit_packages.credits IS 'Quantidade de créditos no pacote';
COMMENT ON COLUMN credit_packages.price_brl IS 'Preço em Reais (BRL)';
COMMENT ON COLUMN credit_packages.discount_percentage IS 'Desconto percentual aplicado';

-- ============================================
-- 2. CRIAR TABELA MEETINGS (se não existir)
-- Corrige: Erro 404 - meetings não encontrado
-- ============================================

-- Tabela de reuniões
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location VARCHAR(255),
  meeting_type VARCHAR(50) DEFAULT 'physical' CHECK (meeting_type IN ('physical', 'online', 'phone')),
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Habilitar RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'meetings' AND policyname = 'Users can view their own meetings'
  ) THEN
    CREATE POLICY "Users can view their own meetings"
      ON meetings FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'meetings' AND policyname = 'Users can insert their own meetings'
  ) THEN
    CREATE POLICY "Users can insert their own meetings"
      ON meetings FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'meetings' AND policyname = 'Users can update their own meetings'
  ) THEN
    CREATE POLICY "Users can update their own meetings"
      ON meetings FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'meetings' AND policyname = 'Users can delete their own meetings'
  ) THEN
    CREATE POLICY "Users can delete their own meetings"
      ON meetings FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_lead_id ON meetings(lead_id);
CREATE INDEX IF NOT EXISTS idx_meetings_start_time ON meetings(start_time);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_meetings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_meetings_updated_at ON meetings;
CREATE TRIGGER update_meetings_updated_at
  BEFORE UPDATE ON meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_meetings_updated_at();

-- Comentários
COMMENT ON TABLE meetings IS 'Reuniões agendadas com leads';
COMMENT ON COLUMN meetings.meeting_type IS 'Tipo: physical, online, phone';
COMMENT ON COLUMN meetings.status IS 'Status: scheduled, in_progress, completed, cancelled';

-- ============================================
-- 3. CORRIGIR TABELA DEALS
-- Corrige: Erro 400 - Query deals mal formatada
-- ============================================

-- Adicionar coluna position (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'deals' 
    AND column_name = 'position'
  ) THEN
    ALTER TABLE deals ADD COLUMN position INTEGER DEFAULT 0;
    
    -- Atualizar posições existentes
    WITH numbered_deals AS (
      SELECT id, user_id, stage_id,
             ROW_NUMBER() OVER (PARTITION BY stage_id ORDER BY created_at) - 1 AS new_position
      FROM deals
    )
    UPDATE deals
    SET position = numbered_deals.new_position
    FROM numbered_deals
    WHERE deals.id = numbered_deals.id;
  END IF;
END $$;

-- Garantir que RLS está habilitado
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para deals (se não existirem)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'deals' AND policyname = 'Users can view their own deals'
  ) THEN
    CREATE POLICY "Users can view their own deals"
      ON deals FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'deals' AND policyname = 'Users can insert their own deals'
  ) THEN
    CREATE POLICY "Users can insert their own deals"
      ON deals FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'deals' AND policyname = 'Users can update their own deals'
  ) THEN
    CREATE POLICY "Users can update their own deals"
      ON deals FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'deals' AND policyname = 'Users can delete their own deals'
  ) THEN
    CREATE POLICY "Users can delete their own deals"
      ON deals FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Criar índice na coluna position para performance
CREATE INDEX IF NOT EXISTS idx_deals_position ON deals(position);
CREATE INDEX IF NOT EXISTS idx_deals_stage_id ON deals(stage_id);

-- ============================================
-- 4. CORRIGIR TABELA STAGES
-- Corrige: Erro 409 - Constraint stages violada
-- ============================================

-- Verificar e limpar duplicatas existentes (mantém apenas o mais antigo)
DO $$
DECLARE
  duplicates_count INTEGER;
BEGIN
  -- Contar duplicatas
  SELECT COUNT(*) INTO duplicates_count
  FROM (
    SELECT pipeline_id, name, COUNT(*) 
    FROM stages 
    GROUP BY pipeline_id, name 
    HAVING COUNT(*) > 1
  ) AS dups;

  -- Se houver duplicatas, deletar (mantém o mais antigo por ID)
  IF duplicates_count > 0 THEN
    DELETE FROM stages a
    USING stages b
    WHERE a.id > b.id 
    AND a.pipeline_id = b.pipeline_id 
    AND a.name = b.name;
    
    RAISE NOTICE 'Removidas % duplicatas da tabela stages', duplicates_count;
  END IF;
END $$;

-- Garantir que constraint único existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'stages_name_pipeline_unique'
  ) THEN
    ALTER TABLE stages 
    ADD CONSTRAINT stages_name_pipeline_unique 
    UNIQUE (name, pipeline_id);
  END IF;
END $$;

-- Comentário
COMMENT ON CONSTRAINT stages_name_pipeline_unique ON stages IS 'Garante que nomes de stages são únicos dentro de cada pipeline';

-- ============================================
-- 5. VERIFICAÇÕES FINAIS
-- ============================================

-- Verificar se todas as tabelas foram criadas/corrigidas
DO $$
DECLARE
  tables_ok INTEGER := 0;
  credit_packages_exists BOOLEAN;
  meetings_exists BOOLEAN;
  deals_position_exists BOOLEAN;
  stages_constraint_exists BOOLEAN;
BEGIN
  -- Verificar credit_packages
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'credit_packages'
  ) INTO credit_packages_exists;
  
  -- Verificar meetings
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'meetings'
  ) INTO meetings_exists;
  
  -- Verificar coluna position em deals
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'deals' AND column_name = 'position'
  ) INTO deals_position_exists;
  
  -- Verificar constraint em stages
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'stages_name_pipeline_unique'
  ) INTO stages_constraint_exists;
  
  -- Contar sucessos
  IF credit_packages_exists THEN tables_ok := tables_ok + 1; END IF;
  IF meetings_exists THEN tables_ok := tables_ok + 1; END IF;
  IF deals_position_exists THEN tables_ok := tables_ok + 1; END IF;
  IF stages_constraint_exists THEN tables_ok := tables_ok + 1; END IF;
  
  -- Relatório
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════';
  RAISE NOTICE '✅ CORREÇÃO COMPLETA SUPABASE - SNAPDOOR CRM';
  RAISE NOTICE '════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE 'Status das correções:';
  RAISE NOTICE '  [%] credit_packages: %', 
    CASE WHEN credit_packages_exists THEN '✅' ELSE '❌' END,
    CASE WHEN credit_packages_exists THEN 'OK' ELSE 'FALHOU' END;
  RAISE NOTICE '  [%] meetings: %', 
    CASE WHEN meetings_exists THEN '✅' ELSE '❌' END,
    CASE WHEN meetings_exists THEN 'OK' ELSE 'FALHOU' END;
  RAISE NOTICE '  [%] deals.position: %', 
    CASE WHEN deals_position_exists THEN '✅' ELSE '❌' END,
    CASE WHEN deals_position_exists THEN 'OK' ELSE 'FALHOU' END;
  RAISE NOTICE '  [%] stages constraint: %', 
    CASE WHEN stages_constraint_exists THEN '✅' ELSE '❌' END,
    CASE WHEN stages_constraint_exists THEN 'OK' ELSE 'FALHOU' END;
  RAISE NOTICE '';
  RAISE NOTICE 'Total: % de 4 correções aplicadas com sucesso', tables_ok;
  RAISE NOTICE '';
  
  IF tables_ok = 4 THEN
    RAISE NOTICE '🎉 SUCESSO! Todas as correções foram aplicadas.';
    RAISE NOTICE '';
    RAISE NOTICE 'Próximos passos:';
    RAISE NOTICE '  1. Configurar variáveis no Vercel';
    RAISE NOTICE '  2. Fazer redeploy da aplicação';
    RAISE NOTICE '  3. Testar em: https://snapdoor.vercel.app';
  ELSE
    RAISE NOTICE '⚠️  ATENÇÃO: Algumas correções falharam.';
    RAISE NOTICE 'Verifique os erros acima e tente novamente.';
  END IF;
  
  RAISE NOTICE '════════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;

-- ============================================
-- FIM DO SCRIPT
-- ============================================

-- CONSULTAS DE VALIDAÇÃO (executar separadamente se quiser)
-- Descomente as linhas abaixo para verificar os dados:

-- SELECT * FROM credit_packages;
-- SELECT COUNT(*) AS total_meetings FROM meetings;
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'deals' AND column_name = 'position';
-- SELECT pipeline_id, name, COUNT(*) FROM stages GROUP BY pipeline_id, name HAVING COUNT(*) > 1;
