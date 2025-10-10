-- =====================================================
-- FIX: RLS Policies para user_credits
-- Permitir SELECT para usuários autenticados
-- =====================================================

-- 1. Drop policies antigas se existirem
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
DROP POLICY IF EXISTS "Users can view their own credits" ON user_credits;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_credits;

-- 2. Criar policy correta para SELECT (permitir usuários verem seus próprios créditos)
CREATE POLICY "Users can view own credits"
ON user_credits
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Permitir INSERT automático quando não existe registro
CREATE POLICY "Users can insert own credits"
ON user_credits
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. Permitir UPDATE dos próprios créditos
CREATE POLICY "Users can update own credits"
ON user_credits
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Verificar se RLS está habilitado
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- 6. Comentários
COMMENT ON POLICY "Users can view own credits" ON user_credits IS 'Permite usuários visualizarem apenas seus próprios créditos';
COMMENT ON POLICY "Users can insert own credits" ON user_credits IS 'Permite criação automática de registro de créditos';
COMMENT ON POLICY "Users can update own credits" ON user_credits IS 'Permite atualização de créditos próprios';
