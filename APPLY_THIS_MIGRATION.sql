-- ============================================================================
-- MIGRATION: Criar tabela deal_participants
-- Data: 2025-10-16
-- Descrição: Tabela M:N para relacionar deals com leads (participantes)
-- ============================================================================

-- 1. CRIAR TABELA
CREATE TABLE IF NOT EXISTS public.deal_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Papel da pessoa no negócio
  role TEXT DEFAULT 'participant' CHECK (role IN (
    'decision_maker',    -- Tomador de decisão
    'influencer',        -- Influenciador
    'user',             -- Usuário final
    'technical',        -- Avaliador técnico
    'champion',         -- Defensor interno
    'participant'       -- Participante geral
  )),
  
  -- Se é o contato principal
  is_primary BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraint: combinação única de deal + lead
  UNIQUE(deal_id, lead_id)
);

-- 2. CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_deal_participants_deal_id ON public.deal_participants(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_participants_lead_id ON public.deal_participants(lead_id);
CREATE INDEX IF NOT EXISTS idx_deal_participants_user_id ON public.deal_participants(user_id);

-- 3. HABILITAR RLS
ALTER TABLE public.deal_participants ENABLE ROW LEVEL SECURITY;

-- 4. REMOVER POLÍTICAS ANTIGAS (se existirem)
DROP POLICY IF EXISTS "Users can view deal_participants of their deals" ON public.deal_participants;
DROP POLICY IF EXISTS "Users can insert deal_participants to their deals" ON public.deal_participants;
DROP POLICY IF EXISTS "Users can update deal_participants of their deals" ON public.deal_participants;
DROP POLICY IF EXISTS "Users can delete deal_participants from their deals" ON public.deal_participants;

-- 5. CRIAR POLÍTICAS RLS
CREATE POLICY "Users can view deal_participants of their deals"
  ON public.deal_participants FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert deal_participants to their deals"
  ON public.deal_participants FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update deal_participants of their deals"
  ON public.deal_participants FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete deal_participants from their deals"
  ON public.deal_participants FOR DELETE
  USING (user_id = auth.uid());

-- 6. CRIAR FUNÇÃO PARA AUTO-UPDATE DO TIMESTAMP
CREATE OR REPLACE FUNCTION update_deal_participants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. CRIAR TRIGGER
DROP TRIGGER IF EXISTS trigger_deal_participants_updated_at ON public.deal_participants;

CREATE TRIGGER trigger_deal_participants_updated_at
  BEFORE UPDATE ON public.deal_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_deal_participants_updated_at();

-- 8. COMENTÁRIOS
COMMENT ON TABLE public.deal_participants IS 'Participantes do negócio - relacionamento M:N entre deals e leads';
COMMENT ON COLUMN public.deal_participants.role IS 'Papel da pessoa no negócio (decision_maker, influencer, user, technical, champion, participant)';
COMMENT ON COLUMN public.deal_participants.is_primary IS 'Define se é o contato principal do negócio';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

-- COMO APLICAR:
-- 1. Acesse: https://supabase.com/dashboard/project/SEU_PROJECT_ID/editor
-- 2. Clique em "SQL Editor"
-- 3. Cole este código
-- 4. Clique em "Run"
-- 5. Verifique se aparece "Success. No rows returned"
