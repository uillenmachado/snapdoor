-- =====================================================
-- MIGRATION: DEV ACCOUNT UNLIMITED CREDITS
-- Conta uillenmachado@gmail.com = desenvolvedor/proprietário
-- Créditos ilimitados para testes e desenvolvimento
-- =====================================================

-- 1. Criar função para verificar se é conta dev
CREATE OR REPLACE FUNCTION is_dev_account(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN user_email = 'uillenmachado@gmail.com';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Modificar função get_user_credits para retornar ilimitado para dev
CREATE OR REPLACE FUNCTION get_user_credits(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_credits INTEGER;
  v_email TEXT;
BEGIN
  -- Buscar email do usuário
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = p_user_id;
  
  -- Se for conta dev, retornar 999999 (ilimitado)
  IF is_dev_account(v_email) THEN
    RETURN 999999;
  END IF;
  
  -- Para outras contas, retornar créditos normais
  SELECT credits INTO v_credits
  FROM user_credits
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(v_credits, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Modificar função debit_credits para não debitar de conta dev
-- Mantém compatibilidade com assinatura existente
CREATE OR REPLACE FUNCTION debit_credits(
  p_user_id UUID,
  p_credits INTEGER,
  p_operation_type TEXT,
  p_domain TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_query_params JSONB DEFAULT NULL,
  p_result_summary JSONB DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_credits INTEGER;
  v_email TEXT;
BEGIN
  -- Buscar email do usuário
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = p_user_id;
  
  -- Se for conta dev, apenas registrar no histórico mas não debitar
  IF is_dev_account(v_email) THEN
    INSERT INTO credit_usage_history (
      user_id,
      credits_used,
      operation_type,
      domain,
      email,
      query_params,
      result_summary,
      success
    ) VALUES (
      p_user_id,
      p_credits,
      p_operation_type || ' (DEV ACCOUNT - FREE)',
      p_domain,
      p_email,
      p_query_params,
      p_result_summary,
      TRUE
    );
    RETURN TRUE;
  END IF;
  
  -- Para outras contas, processo normal
  SELECT credits INTO v_current_credits
  FROM user_credits
  WHERE user_id = p_user_id;
  
  IF v_current_credits IS NULL OR v_current_credits < p_credits THEN
    RETURN FALSE;
  END IF;
  
  UPDATE user_credits
  SET 
    credits = credits - p_credits,
    total_used = total_used + p_credits,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  INSERT INTO credit_usage_history (
    user_id,
    credits_used,
    operation_type,
    domain,
    email,
    query_params,
    result_summary,
    success
  ) VALUES (
    p_user_id,
    p_credits,
    p_operation_type,
    p_domain,
    p_email,
    p_query_params,
    p_result_summary,
    TRUE
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar view para admin visualizar status de contas
CREATE OR REPLACE VIEW v_user_credits_status AS
SELECT 
  u.id as user_id,
  u.email,
  CASE 
    WHEN is_dev_account(u.email) THEN '∞ (DEV ACCOUNT)'
    ELSE COALESCE(uc.credits::TEXT, '0')
  END as credits_display,
  CASE 
    WHEN is_dev_account(u.email) THEN 999999
    ELSE COALESCE(uc.credits, 0)
  END as credits_value,
  is_dev_account(u.email) as is_dev,
  uc.created_at,
  uc.updated_at
FROM auth.users u
LEFT JOIN user_credits uc ON u.id = uc.user_id;

-- 5. Comentário explicativo
COMMENT ON FUNCTION is_dev_account(TEXT) IS 'Verifica se email é conta de desenvolvedor (uillenmachado@gmail.com)';
COMMENT ON FUNCTION get_user_credits(UUID) IS 'Retorna créditos do usuário. Dev account = 999999 (ilimitado)';
COMMENT ON FUNCTION debit_credits(UUID, INTEGER, TEXT, TEXT, TEXT, JSONB, JSONB) IS 'Debita créditos. Dev account não é debitada mas registra no histórico';
COMMENT ON VIEW v_user_credits_status IS 'View para visualizar status de créditos de todos usuários incluindo dev account';

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION is_dev_account(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_credits(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION debit_credits(UUID, INTEGER, TEXT, TEXT, TEXT, JSONB, JSONB) TO authenticated;
GRANT SELECT ON v_user_credits_status TO authenticated;
