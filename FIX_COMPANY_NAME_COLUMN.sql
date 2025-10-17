-- ============================================================================
-- FIX: Adicionar coluna company_name à tabela deals (se não existir)
-- Data: 2025-10-16
-- ============================================================================

-- 1. VERIFICAR SE COLUNA EXISTE
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'deals' 
    AND column_name = 'company_name'
  ) THEN
    -- 2. ADICIONAR COLUNA
    ALTER TABLE public.deals 
    ADD COLUMN company_name TEXT;
    
    RAISE NOTICE 'Coluna company_name adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna company_name já existe';
  END IF;
END $$;

-- 3. VERIFICAR ESTRUTURA COMPLETA
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'deals'
AND column_name IN ('company_name', 'company_id', 'title', 'value', 'status')
ORDER BY ordinal_position;

-- ============================================================================
-- RESULTADO ESPERADO:
-- company_name | text | YES | NULL
-- company_id   | uuid | YES | NULL
-- title        | text | NO  | NULL
-- value        | numeric | YES | 0
-- status       | text | YES | 'open'::text
-- ============================================================================
