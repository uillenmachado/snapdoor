-- =====================================================
-- CRIAÇÃO AUTOMÁTICA DE USUÁRIO ADMIN/MASTER
-- Executado no primeiro deploy do sistema
-- =====================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Função para criar admin se não existir
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id UUID;
  admin_email TEXT := 'admin@snapdoor.com';
  admin_password TEXT := 'SnapDoor2025!Admin';
BEGIN
  -- Verifica se admin já existe
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = admin_email;

  -- Se não existe, cria
  IF admin_user_id IS NULL THEN
    -- Cria usuário no auth.users
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      role,
      aud,
      confirmation_token,
      recovery_token
    )
    VALUES (
      uuid_generate_v4(),
      '00000000-0000-0000-0000-000000000000',
      admin_email,
      crypt(admin_password, gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      'authenticated',
      'authenticated',
      encode(gen_random_bytes(32), 'hex'),
      encode(gen_random_bytes(32), 'hex')
    )
    RETURNING id INTO admin_user_id;

    -- Cria perfil
    INSERT INTO public.profiles (
      id,
      full_name,
      created_at,
      updated_at
    )
    VALUES (
      admin_user_id,
      'Administrator',
      NOW(),
      NOW()
    );

    -- Cria créditos iniciais (ilimitados para admin)
    INSERT INTO public.user_credits (
      user_id,
      credits,
      total_purchased,
      total_used
    )
    VALUES (
      admin_user_id,
      999999,
      999999,
      0
    );

    -- Cria pipeline padrão para admin
    INSERT INTO public.pipelines (
      user_id,
      name,
      is_default
    )
    VALUES (
      admin_user_id,
      'Pipeline Padrão',
      true
    );

    RAISE NOTICE 'Admin user created successfully: %', admin_email;
    RAISE NOTICE 'Password: %', admin_password;
  ELSE
    RAISE NOTICE 'Admin user already exists: %', admin_email;
  END IF;
END;
$$;

-- Executa a criação
SELECT create_admin_user();

-- Remove a função após execução (segurança)
-- DROP FUNCTION IF EXISTS create_admin_user();

-- Comentário de documentação
COMMENT ON FUNCTION create_admin_user() IS 'Cria usuário admin/master automaticamente no primeiro deploy. Credenciais: admin@snapdoor.com / SnapDoor2025!Admin';
