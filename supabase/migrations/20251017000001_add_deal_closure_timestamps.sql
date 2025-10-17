-- Adicionar campos de rastreamento de fechamento de deals
-- Para melhor histórico e analytics

ALTER TABLE public.deals 
  ADD COLUMN IF NOT EXISTS won_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS lost_at TIMESTAMPTZ;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_deals_won_at 
  ON public.deals(won_at) 
  WHERE status = 'won';

CREATE INDEX IF NOT EXISTS idx_deals_lost_at 
  ON public.deals(lost_at) 
  WHERE status = 'lost';

-- Atualizar deals existentes que já foram fechados
-- Usar closed_date como base para won_at/lost_at se existir
UPDATE public.deals 
SET won_at = closed_date 
WHERE status = 'won' AND closed_date IS NOT NULL AND won_at IS NULL;

UPDATE public.deals 
SET lost_at = closed_date 
WHERE status = 'lost' AND closed_date IS NOT NULL AND lost_at IS NULL;

-- Comentários
COMMENT ON COLUMN public.deals.won_at IS 'Data/hora em que o negócio foi marcado como ganho';
COMMENT ON COLUMN public.deals.lost_at IS 'Data/hora em que o negócio foi marcado como perdido';
