-- EXECUTAR NO SUPABASE SQL EDITOR
-- https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Adicionar campos de rastreamento de fechamento de deals
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
UPDATE public.deals 
SET won_at = closed_date 
WHERE status = 'won' AND closed_date IS NOT NULL AND won_at IS NULL;

UPDATE public.deals 
SET lost_at = closed_date 
WHERE status = 'lost' AND closed_date IS NOT NULL AND lost_at IS NULL;

-- Verificar resultado
SELECT 
  status,
  COUNT(*) as total,
  COUNT(won_at) as com_won_at,
  COUNT(lost_at) as com_lost_at
FROM public.deals
GROUP BY status;
