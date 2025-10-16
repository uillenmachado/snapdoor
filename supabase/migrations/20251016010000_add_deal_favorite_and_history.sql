-- =====================================================
-- MIGRATION: Adicionar campos de histórico e favoritos
-- Data: 16/10/2025
-- =====================================================

-- 1. Adicionar campo is_favorite (favoritar negócios)
ALTER TABLE deals 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;

-- 2. Adicionar índice para consultas de favoritos
CREATE INDEX IF NOT EXISTS idx_deals_favorite 
ON deals(user_id, is_favorite) 
WHERE is_favorite = TRUE;

-- 3. Adicionar índice para histórico (status + closed_date)
CREATE INDEX IF NOT EXISTS idx_deals_history 
ON deals(user_id, status, closed_date DESC)
WHERE status IN ('won', 'lost');

-- 4. Comentários
COMMENT ON COLUMN deals.is_favorite IS 'Indica se o negócio está marcado como favorito pelo usuário';

-- 5. Verificar resultado
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'deals'
  AND column_name IN ('is_favorite', 'closed_date', 'lost_reason')
ORDER BY column_name;

-- Verificar índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'deals'
  AND indexname LIKE '%favorite%' OR indexname LIKE '%history%'
ORDER BY indexname;
