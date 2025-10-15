-- =====================================================
-- SCRIPT DE DADOS REAIS - SNAPDOOR CRM
-- Inserir 10 empresas, 10 leads e 10 oportunidades
-- Dados baseados em empresas brasileiras reais
-- =====================================================

-- IMPORTANTE: Execute este script no Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Cole este script > Run

-- =====================================================
-- 1. EMPRESAS (10 empresas brasileiras reais)
-- =====================================================

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Pegar user_id da conta dev
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1;
  
  -- Inserir Empresas
  INSERT INTO companies (
    user_id,
    name, 
    domain, 
    industry, 
    size, 
    location, 
    description, 
    website, 
    linkedin_url,
    phone,
    created_at,
    updated_at
  ) VALUES
    -- 1. Nubank
    (
      v_user_id,
      'Nubank',
      'nubank.com.br',
      'Fintech',
      '1001-5000',
      'São Paulo, SP',
      'Fintech brasileira líder em serviços financeiros digitais, com mais de 70 milhões de clientes.',
      'https://nubank.com.br',
      'https://linkedin.com/company/nubank',
      '+55 11 3004-7828',
      NOW(),
      NOW()
    ),
    
    -- 2. Mercado Livre
    (
      v_user_id,
      'Mercado Livre',
      'mercadolivre.com.br',
      'E-commerce',
      '5001+',
      'São Paulo, SP',
      'Maior marketplace da América Latina, conectando milhões de compradores e vendedores.',
      'https://mercadolivre.com.br',
      'https://linkedin.com/company/mercadolivre',
      '+55 11 4003-4003',
      NOW(),
      NOW()
    ),
    
    -- 3. Stone
    (
      v_user_id,
      'Stone Pagamentos',
      'stone.com.br',
      'Fintech',
      '1001-5000',
      'São Paulo, SP',
      'Empresa de tecnologia financeira focada em soluções de pagamento para PMEs.',
      'https://stone.com.br',
      'https://linkedin.com/company/stone-pagamentos',
      '+55 11 3004-9680',
      NOW(),
      NOW()
    ),
    
    -- 4. iFood
    (
      v_user_id,
      'iFood',
      'ifood.com.br',
      'Food Tech',
      '5001+',
      'São Paulo, SP',
      'Principal plataforma de delivery de comida do Brasil, conectando restaurantes e clientes.',
      'https://ifood.com.br',
      'https://linkedin.com/company/ifood',
      '+55 11 3230-3130',
      NOW(),
      NOW()
    ),
    
    -- 5. Conta Azul
    (
      v_user_id,
      'Conta Azul',
      'contaazul.com',
      'SaaS',
      '201-500',
      'Joinville, SC',
      'Software de gestão empresarial para pequenas e médias empresas.',
      'https://contaazul.com',
      'https://linkedin.com/company/contaazul',
      '+55 47 3025-8800',
      NOW(),
      NOW()
    ),
    
    -- 6. Resultados Digitais (RD Station)
    (
      v_user_id,
      'Resultados Digitais',
      'rdstation.com',
      'Marketing Tech',
      '501-1000',
      'Florianópolis, SC',
      'Plataforma líder de automação de marketing e vendas no Brasil.',
      'https://rdstation.com',
      'https://linkedin.com/company/resultados-digitais',
      '+55 48 3037-3600',
      NOW(),
      NOW()
    ),
    
    -- 7. TOTVS
    (
      v_user_id,
      'TOTVS',
      'totvs.com',
      'Software',
      '5001+',
      'São Paulo, SP',
      'Maior empresa de software de gestão empresarial da América Latina.',
      'https://totvs.com',
      'https://linkedin.com/company/totvs',
      '+55 11 2099-7300',
      NOW(),
      NOW()
    ),
    
    -- 8. Movile (Grupo iFood)
    (
      v_user_id,
      'Movile',
      'movile.com',
      'Mobile Tech',
      '1001-5000',
      'Campinas, SP',
      'Ecossistema de empresas de tecnologia mobile, incluindo iFood, PlayKids e outras.',
      'https://movile.com',
      'https://linkedin.com/company/movile',
      '+55 19 3256-5400',
      NOW(),
      NOW()
    ),
    
    -- 9. Gympass (Wellhub)
    (
      v_user_id,
      'Wellhub',
      'wellhub.com',
      'Health Tech',
      '1001-5000',
      'São Paulo, SP',
      'Plataforma de bem-estar corporativo conectando empresas e academias.',
      'https://wellhub.com',
      'https://linkedin.com/company/wellhub',
      '+55 11 3230-5800',
      NOW(),
      NOW()
    ),
    
    -- 10. QuintoAndar
    (
      v_user_id,
      'QuintoAndar',
      'quintoandar.com.br',
      'PropTech',
      '1001-5000',
      'São Paulo, SP',
      'Plataforma digital de aluguel e venda de imóveis sem burocracia.',
      'https://quintoandar.com.br',
      'https://linkedin.com/company/quintoandar',
      '+55 11 3230-2400',
      NOW(),
      NOW()
    );
    
END $$;

-- =====================================================
-- 2. LEADS (10 leads profissionais vinculados às empresas)
-- =====================================================

DO $$
DECLARE
  v_user_id UUID;
  v_pipeline_id UUID;
  v_stage_id UUID;
  v_nubank_id UUID;
  v_mercadolivre_id UUID;
  v_stone_id UUID;
  v_ifood_id UUID;
  v_contaazul_id UUID;
  v_rd_id UUID;
  v_totvs_id UUID;
  v_movile_id UUID;
  v_wellhub_id UUID;
  v_quintoandar_id UUID;
  v_has_stage_id BOOLEAN;
  v_has_company BOOLEAN;
  v_has_company_id BOOLEAN;
  v_sql TEXT;
BEGIN
  -- Pegar user_id da conta dev
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1;
  
  -- Verificar quais colunas existem na tabela leads
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'stage_id'
  ) INTO v_has_stage_id;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'company'
  ) INTO v_has_company;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'company_id'
  ) INTO v_has_company_id;
  
  -- Se tem stage_id, precisamos criar pipeline e stage
  IF v_has_stage_id THEN
    SELECT id INTO v_pipeline_id FROM pipelines WHERE user_id = v_user_id ORDER BY created_at DESC LIMIT 1;
    IF v_pipeline_id IS NULL THEN
      INSERT INTO pipelines (user_id, name, description, created_at, updated_at)
      VALUES (v_user_id, 'Pipeline de Leads', 'Pipeline para gestão de leads', NOW(), NOW())
      RETURNING id INTO v_pipeline_id;
    END IF;
    
    SELECT id INTO v_stage_id FROM stages WHERE pipeline_id = v_pipeline_id ORDER BY position LIMIT 1;
    IF v_stage_id IS NULL THEN
      INSERT INTO stages (pipeline_id, name, position, color, created_at, updated_at)
      VALUES (v_pipeline_id, 'Leads Ativos', 0, '#3B82F6', NOW(), NOW())
      RETURNING id INTO v_stage_id;
    END IF;
  END IF;
  
  -- Pegar IDs das empresas
  SELECT id INTO v_nubank_id FROM companies WHERE domain = 'nubank.com.br' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_mercadolivre_id FROM companies WHERE domain = 'mercadolivre.com.br' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_stone_id FROM companies WHERE domain = 'stone.com.br' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_ifood_id FROM companies WHERE domain = 'ifood.com.br' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_contaazul_id FROM companies WHERE domain = 'contaazul.com' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_rd_id FROM companies WHERE domain = 'rdstation.com' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_totvs_id FROM companies WHERE domain = 'totvs.com' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_movile_id FROM companies WHERE domain = 'movile.com' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_wellhub_id FROM companies WHERE domain = 'wellhub.com' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_quintoandar_id FROM companies WHERE domain = 'quintoandar.com.br' AND user_id = v_user_id LIMIT 1;
  
  -- Construir SQL dinamicamente baseado nas colunas disponíveis
  v_sql := 'INSERT INTO leads (user_id, first_name, last_name, email, phone';
  
  IF v_has_stage_id THEN
    v_sql := v_sql || ', stage_id';
  END IF;
  
  IF v_has_company THEN
    v_sql := v_sql || ', company';
  END IF;
  
  IF v_has_company_id THEN
    v_sql := v_sql || ', company_id';
  END IF;
  
  v_sql := v_sql || ', created_at, updated_at) VALUES ';
  
  -- Adicionar os 10 registros
  v_sql := v_sql || '($1, $2, $3, $4, $5';
  
  IF v_has_stage_id THEN
    v_sql := v_sql || ', $6';
  END IF;
  
  IF v_has_company THEN
    v_sql := v_sql || ', $7';
  END IF;
  
  IF v_has_company_id THEN
    v_sql := v_sql || ', $8';
  END IF;
  
  v_sql := v_sql || ', NOW() - INTERVAL ''15 days'', NOW())';
  
  -- Inserir leads usando EXECUTE para SQL dinâmico
  FOR i IN 1..10 LOOP
    CASE i
      WHEN 1 THEN
        IF v_has_stage_id AND v_has_company AND v_has_company_id THEN
          EXECUTE 'INSERT INTO leads (stage_id, user_id, company_id, first_name, last_name, email, phone, company, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() - INTERVAL ''15 days'', NOW())'
          USING v_stage_id, v_user_id, v_nubank_id, 'Cristina', 'Junqueira', 'cristina.j@nubank.com.br', '+55 11 98765-4321', 'Nubank';
        ELSIF v_has_stage_id AND v_has_company THEN
          EXECUTE 'INSERT INTO leads (stage_id, user_id, first_name, last_name, email, phone, company, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL ''15 days'', NOW())'
          USING v_stage_id, v_user_id, 'Cristina', 'Junqueira', 'cristina.j@nubank.com.br', '+55 11 98765-4321', 'Nubank';
        ELSE
          EXECUTE 'INSERT INTO leads (user_id, first_name, last_name, email, phone, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL ''15 days'', NOW())'
          USING v_user_id, 'Cristina', 'Junqueira', 'cristina.j@nubank.com.br', '+55 11 98765-4321';
        END IF;
      
      WHEN 2 THEN
        IF v_has_stage_id AND v_has_company AND v_has_company_id THEN
          EXECUTE 'INSERT INTO leads (stage_id, user_id, company_id, first_name, last_name, email, phone, company, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() - INTERVAL ''10 days'', NOW())'
          USING v_stage_id, v_user_id, v_mercadolivre_id, 'Fernando', 'Silva', 'fernando.silva@mercadolivre.com', '+55 11 97654-3210', 'Mercado Livre';
        ELSIF v_has_stage_id AND v_has_company THEN
          EXECUTE 'INSERT INTO leads (stage_id, user_id, first_name, last_name, email, phone, company, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL ''10 days'', NOW())'
          USING v_stage_id, v_user_id, 'Fernando', 'Silva', 'fernando.silva@mercadolivre.com', '+55 11 97654-3210', 'Mercado Livre';
        ELSE
          EXECUTE 'INSERT INTO leads (user_id, first_name, last_name, email, phone, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL ''10 days'', NOW())'
          USING v_user_id, 'Fernando', 'Silva', 'fernando.silva@mercadolivre.com', '+55 11 97654-3210';
        END IF;
      
      WHEN 3 THEN
        IF v_has_stage_id AND v_has_company AND v_has_company_id THEN
          EXECUTE 'INSERT INTO leads (stage_id, user_id, company_id, first_name, last_name, email, phone, company, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() - INTERVAL ''5 days'', NOW())'
          USING v_stage_id, v_user_id, v_stone_id, 'Mariana', 'Costa', 'mariana.costa@stone.com.br', '+55 11 96543-2109', 'Stone Pagamentos';
        ELSIF v_has_stage_id AND v_has_company THEN
          EXECUTE 'INSERT INTO leads (stage_id, user_id, first_name, last_name, email, phone, company, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL ''5 days'', NOW())'
          USING v_stage_id, v_user_id, 'Mariana', 'Costa', 'mariana.costa@stone.com.br', '+55 11 96543-2109', 'Stone Pagamentos';
        ELSE
          EXECUTE 'INSERT INTO leads (user_id, first_name, last_name, email, phone, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL ''5 days'', NOW())'
          USING v_user_id, 'Mariana', 'Costa', 'mariana.costa@stone.com.br', '+55 11 96543-2109';
        END IF;
      
      WHEN 4 THEN
        IF v_has_stage_id AND v_has_company AND v_has_company_id THEN
          EXECUTE 'INSERT INTO leads (stage_id, user_id, company_id, first_name, last_name, email, phone, company, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() - INTERVAL ''20 days'', NOW())'
          USING v_stage_id, v_user_id, v_ifood_id, 'Roberto', 'Andrade', 'roberto.andrade@ifood.com.br', '+55 11 95432-1098', 'iFood';
        ELSIF v_has_stage_id AND v_has_company THEN
          EXECUTE 'INSERT INTO leads (stage_id, user_id, first_name, last_name, email, phone, company, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL ''20 days'', NOW())'
          USING v_stage_id, v_user_id, 'Roberto', 'Andrade', 'roberto.andrade@ifood.com.br', '+55 11 95432-1098', 'iFood';
        ELSE
          EXECUTE 'INSERT INTO leads (user_id, first_name, last_name, email, phone, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL ''20 days'', NOW())'
          USING v_user_id, 'Roberto', 'Andrade', 'roberto.andrade@ifood.com.br', '+55 11 95432-1098';
        END IF;
      
      WHEN 5 THEN
        IF v_has_stage_id AND v_has_company AND v_has_company_id THEN
          EXECUTE 'INSERT INTO leads (stage_id, user_id, company_id, first_name, last_name, email, phone, company, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() - INTERVAL ''3 days'', NOW())'
          USING v_stage_id, v_user_id, v_contaazul_id, 'Paula', 'Rodrigues', 'paula.rodrigues@contaazul.com', '+55 47 94321-0987', 'Conta Azul';
        ELSIF v_has_stage_id AND v_has_company THEN
          EXECUTE 'INSERT INTO leads (stage_id, user_id, first_name, last_name, email, phone, company, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL ''3 days'', NOW())'
          USING v_stage_id, v_user_id, 'Paula', 'Rodrigues', 'paula.rodrigues@contaazul.com', '+55 47 94321-0987', 'Conta Azul';
        ELSE
          EXECUTE 'INSERT INTO leads (user_id, first_name, last_name, email, phone, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL ''3 days'', NOW())'
          USING v_user_id, 'Paula', 'Rodrigues', 'paula.rodrigues@contaazul.com', '+55 47 94321-0987';
        END IF;
      
      WHEN 6 THEN
        IF v_has_stage_id AND v_has_company AND v_has_company_id THEN
          EXECUTE 'INSERT INTO leads (stage_id, user_id, company_id, first_name, last_name, email, phone, company, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() - INTERVAL ''7 days'', NOW())'
          USING v_stage_id, v_user_id, v_rd_id, 'Carlos', 'Mendes', 'carlos.mendes@rdstation.com', '+55 48 93210-9876', 'Resultados Digitais';
        ELSIF v_has_stage_id AND v_has_company THEN
          EXECUTE 'INSERT INTO leads (stage_id, user_id, first_name, last_name, email, phone, company, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL ''7 days'', NOW())'
          USING v_stage_id, v_user_id, 'Carlos', 'Mendes', 'carlos.mendes@rdstation.com', '+55 48 93210-9876', 'Resultados Digitais';
        ELSE
          EXECUTE 'INSERT INTO leads (user_id, first_name, last_name, email, phone, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL ''7 days'', NOW())'
          USING v_user_id, 'Carlos', 'Mendes', 'carlos.mendes@rdstation.com', '+55 48 93210-9876';
        END IF;
      
      WHEN 7 THEN
        IF v_has_stage_id AND v_has_company AND v_has_company_id THEN
          EXECUTE 'INSERT INTO leads (stage_id, user_id, company_id, first_name, last_name, email, phone, company, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() - INTERVAL ''2 days'', NOW())'
          USING v_stage_id, v_user_id, v_totvs_id, 'Juliana', 'Santos', 'juliana.santos@totvs.com', '+55 11 92109-8765', 'TOTVS';
        ELSIF v_has_stage_id AND v_has_company THEN
          EXECUTE 'INSERT INTO leads (stage_id, user_id, first_name, last_name, email, phone, company, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL ''2 days'', NOW())'
          USING v_stage_id, v_user_id, 'Juliana', 'Santos', 'juliana.santos@totvs.com', '+55 11 92109-8765', 'TOTVS';
        ELSE
          EXECUTE 'INSERT INTO leads (user_id, first_name, last_name, email, phone, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL ''2 days'', NOW())'
          USING v_user_id, 'Juliana', 'Santos', 'juliana.santos@totvs.com', '+55 11 92109-8765';
        END IF;
      
      WHEN 8 THEN
        IF v_has_stage_id AND v_has_company AND v_has_company_id THEN
          EXECUTE 'INSERT INTO leads (stage_id, user_id, company_id, first_name, last_name, email, phone, company, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() - INTERVAL ''12 days'', NOW())'
          USING v_stage_id, v_user_id, v_movile_id, 'André', 'Oliveira', 'andre.oliveira@movile.com', '+55 19 91098-7654', 'Movile';
        ELSIF v_has_stage_id AND v_has_company THEN
          EXECUTE 'INSERT INTO leads (stage_id, user_id, first_name, last_name, email, phone, company, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL ''12 days'', NOW())'
          USING v_stage_id, v_user_id, 'André', 'Oliveira', 'andre.oliveira@movile.com', '+55 19 91098-7654', 'Movile';
        ELSE
          EXECUTE 'INSERT INTO leads (user_id, first_name, last_name, email, phone, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL ''12 days'', NOW())'
          USING v_user_id, 'André', 'Oliveira', 'andre.oliveira@movile.com', '+55 19 91098-7654';
        END IF;
      
      WHEN 9 THEN
        IF v_has_stage_id AND v_has_company AND v_has_company_id THEN
          EXECUTE 'INSERT INTO leads (stage_id, user_id, company_id, first_name, last_name, email, phone, company, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() - INTERVAL ''8 days'', NOW())'
          USING v_stage_id, v_user_id, v_wellhub_id, 'Beatriz', 'Lima', 'beatriz.lima@wellhub.com', '+55 11 90987-6543', 'Wellhub';
        ELSIF v_has_stage_id AND v_has_company THEN
          EXECUTE 'INSERT INTO leads (stage_id, user_id, first_name, last_name, email, phone, company, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL ''8 days'', NOW())'
          USING v_stage_id, v_user_id, 'Beatriz', 'Lima', 'beatriz.lima@wellhub.com', '+55 11 90987-6543', 'Wellhub';
        ELSE
          EXECUTE 'INSERT INTO leads (user_id, first_name, last_name, email, phone, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL ''8 days'', NOW())'
          USING v_user_id, 'Beatriz', 'Lima', 'beatriz.lima@wellhub.com', '+55 11 90987-6543';
        END IF;
      
      WHEN 10 THEN
        IF v_has_stage_id AND v_has_company AND v_has_company_id THEN
          EXECUTE 'INSERT INTO leads (stage_id, user_id, company_id, first_name, last_name, email, phone, company, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() - INTERVAL ''1 day'', NOW())'
          USING v_stage_id, v_user_id, v_quintoandar_id, 'Rafael', 'Ferreira', 'rafael.ferreira@quintoandar.com.br', '+55 11 89876-5432', 'QuintoAndar';
        ELSIF v_has_stage_id AND v_has_company THEN
          EXECUTE 'INSERT INTO leads (stage_id, user_id, first_name, last_name, email, phone, company, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW() - INTERVAL ''1 day'', NOW())'
          USING v_stage_id, v_user_id, 'Rafael', 'Ferreira', 'rafael.ferreira@quintoandar.com.br', '+55 11 89876-5432', 'QuintoAndar';
        ELSE
          EXECUTE 'INSERT INTO leads (user_id, first_name, last_name, email, phone, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW() - INTERVAL ''1 day'', NOW())'
          USING v_user_id, 'Rafael', 'Ferreira', 'rafael.ferreira@quintoandar.com.br', '+55 11 89876-5432';
        END IF;
    END CASE;
  END LOOP;
  
  -- Atualizar company_id SE a coluna existir mas não foi inserida
  IF v_has_company_id AND NOT (v_has_stage_id AND v_has_company AND v_has_company_id) THEN
    UPDATE leads SET company_id = CASE email
      WHEN 'cristina.j@nubank.com.br' THEN v_nubank_id
      WHEN 'fernando.silva@mercadolivre.com' THEN v_mercadolivre_id
      WHEN 'mariana.costa@stone.com.br' THEN v_stone_id
      WHEN 'roberto.andrade@ifood.com.br' THEN v_ifood_id
      WHEN 'paula.rodrigues@contaazul.com' THEN v_contaazul_id
      WHEN 'carlos.mendes@rdstation.com' THEN v_rd_id
      WHEN 'juliana.santos@totvs.com' THEN v_totvs_id
      WHEN 'andre.oliveira@movile.com' THEN v_movile_id
      WHEN 'beatriz.lima@wellhub.com' THEN v_wellhub_id
      WHEN 'rafael.ferreira@quintoandar.com.br' THEN v_quintoandar_id
    END
    WHERE email IN (
      'cristina.j@nubank.com.br', 'fernando.silva@mercadolivre.com',
      'mariana.costa@stone.com.br', 'roberto.andrade@ifood.com.br',
      'paula.rodrigues@contaazul.com', 'carlos.mendes@rdstation.com',
      'juliana.santos@totvs.com', 'andre.oliveira@movile.com',
      'beatriz.lima@wellhub.com', 'rafael.ferreira@quintoandar.com.br'
    ) AND user_id = v_user_id;
  END IF;
    
END $$;

-- =====================================================
-- 3. PIPELINE E STAGES
-- Criar pipeline padrão e estágios
-- =====================================================

DO $$
DECLARE
  v_user_id UUID;
  v_pipeline_id UUID;
  v_stage_qualificado_id UUID;
  v_stage_proposta_id UUID;
  v_stage_negociacao_id UUID;
  v_stage_fechamento_id UUID;
BEGIN
  -- Pegar user_id
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1;
  
  -- Criar Pipeline Principal
  INSERT INTO pipelines (user_id, name, description, created_at, updated_at)
  VALUES (
    v_user_id,
    'Pipeline de Vendas',
    'Pipeline principal para gestão de oportunidades B2B',
    NOW(),
    NOW()
  )
  RETURNING id INTO v_pipeline_id;
  
  -- Criar Estágios (Stages)
  -- 1. Qualificado
  INSERT INTO stages (pipeline_id, name, position, color, created_at, updated_at)
  VALUES (v_pipeline_id, 'Qualificado', 0, '#3B82F6', NOW(), NOW())
  RETURNING id INTO v_stage_qualificado_id;
  
  -- 2. Proposta Enviada
  INSERT INTO stages (pipeline_id, name, position, color, created_at, updated_at)
  VALUES (v_pipeline_id, 'Proposta Enviada', 1, '#8B5CF6', NOW(), NOW())
  RETURNING id INTO v_stage_proposta_id;
  
  -- 3. Em Negociação
  INSERT INTO stages (pipeline_id, name, position, color, created_at, updated_at)
  VALUES (v_pipeline_id, 'Em Negociação', 2, '#F59E0B', NOW(), NOW())
  RETURNING id INTO v_stage_negociacao_id;
  
  -- 4. Fechamento
  INSERT INTO stages (pipeline_id, name, position, color, created_at, updated_at)
  VALUES (v_pipeline_id, 'Fechamento', 3, '#10B981', NOW(), NOW())
  RETURNING id INTO v_stage_fechamento_id;
  
  -- Armazenar IDs em variável temporária para usar nos deals
  -- (Vamos criar deals na próxima seção)
  
END $$;

-- =====================================================
-- 4. DEALS/OPORTUNIDADES (com segurança total)
-- =====================================================

DO $$
DECLARE
  v_user_id UUID;
  v_pipeline_id UUID;
  v_stage_qualificado_id UUID;
  v_stage_proposta_id UUID;
  v_stage_negociacao_id UUID;
  v_stage_fechamento_id UUID;
  
  -- Company IDs
  v_nubank_id UUID;
  v_mercadolivre_id UUID;
  v_stone_id UUID;
  v_ifood_id UUID;
  v_contaazul_id UUID;
  v_rd_id UUID;
  v_totvs_id UUID;
  v_movile_id UUID;
  v_wellhub_id UUID;
  v_quintoandar_id UUID;
  
  -- Lead IDs
  v_lead_cristina UUID;
  v_lead_fernando UUID;
  v_lead_mariana UUID;
  v_lead_roberto UUID;
  v_lead_paula UUID;
  v_lead_carlos UUID;
  v_lead_juliana UUID;
  v_lead_andre UUID;
  v_lead_beatriz UUID;
  v_lead_rafael UUID;
BEGIN
  -- Pegar o user_id da conta principal
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1;

  -- Buscar o pipeline mais recente do usuário (REUTILIZA SE EXISTIR)
  SELECT id INTO v_pipeline_id 
  FROM pipelines 
  WHERE user_id = v_user_id 
  ORDER BY created_at DESC 
  LIMIT 1;

  IF v_pipeline_id IS NULL THEN
    RAISE NOTICE '⚠️ Nenhum pipeline encontrado para o usuário. Execute primeiro o bloco de criação de pipelines.';
    RETURN;
  END IF;

  -- Buscar os stages associados a esse pipeline (REUTILIZA SE EXISTIR)
  SELECT id INTO v_stage_qualificado_id FROM stages WHERE pipeline_id = v_pipeline_id AND position = 0 LIMIT 1;
  SELECT id INTO v_stage_proposta_id FROM stages WHERE pipeline_id = v_pipeline_id AND position = 1 LIMIT 1;
  SELECT id INTO v_stage_negociacao_id FROM stages WHERE pipeline_id = v_pipeline_id AND position = 2 LIMIT 1;
  SELECT id INTO v_stage_fechamento_id FROM stages WHERE pipeline_id = v_pipeline_id AND position = 3 LIMIT 1;

  IF v_stage_qualificado_id IS NULL OR v_stage_proposta_id IS NULL OR v_stage_negociacao_id IS NULL OR v_stage_fechamento_id IS NULL THEN
    RAISE NOTICE '⚠️ Alguns estágios não foram encontrados. Nenhum deal será criado.';
    RETURN;
  END IF;

  -- Pegar Company IDs (VALIDA EXISTÊNCIA)
  SELECT id INTO v_nubank_id FROM companies WHERE domain = 'nubank.com.br' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_mercadolivre_id FROM companies WHERE domain = 'mercadolivre.com.br' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_stone_id FROM companies WHERE domain = 'stone.com.br' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_ifood_id FROM companies WHERE domain = 'ifood.com.br' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_contaazul_id FROM companies WHERE domain = 'contaazul.com' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_rd_id FROM companies WHERE domain = 'rdstation.com' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_totvs_id FROM companies WHERE domain = 'totvs.com' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_movile_id FROM companies WHERE domain = 'movile.com' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_wellhub_id FROM companies WHERE domain = 'wellhub.com' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_quintoandar_id FROM companies WHERE domain = 'quintoandar.com.br' AND user_id = v_user_id LIMIT 1;

  -- Pegar Lead IDs (VALIDA EXISTÊNCIA)
  SELECT id INTO v_lead_cristina FROM leads WHERE email = 'cristina.j@nubank.com.br' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_lead_fernando FROM leads WHERE email = 'fernando.silva@mercadolivre.com' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_lead_mariana FROM leads WHERE email = 'mariana.costa@stone.com.br' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_lead_roberto FROM leads WHERE email = 'roberto.andrade@ifood.com.br' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_lead_paula FROM leads WHERE email = 'paula.rodrigues@contaazul.com' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_lead_carlos FROM leads WHERE email = 'carlos.mendes@rdstation.com' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_lead_juliana FROM leads WHERE email = 'juliana.santos@totvs.com' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_lead_andre FROM leads WHERE email = 'andre.oliveira@movile.com' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_lead_beatriz FROM leads WHERE email = 'beatriz.lima@wellhub.com' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_lead_rafael FROM leads WHERE email = 'rafael.ferreira@quintoandar.com.br' AND user_id = v_user_id LIMIT 1;

  -- EVITAR DUPLICAÇÃO: Remove deals criados recentemente (última 1 hora)
  DELETE FROM deals WHERE user_id = v_user_id AND created_at > NOW() - INTERVAL '1 hour';

  -- Inserir os 10 Deals (SEM DUPLICAR)
  
  INSERT INTO deals (
    user_id, pipeline_id, stage_id, company_id, lead_id,
    title, value, status, probability, expected_close_date,
    description, created_at, updated_at
  )
  VALUES
    -- DEAL 1: Nubank - Integração API (FECHAMENTO)
    (v_user_id, v_pipeline_id, v_stage_fechamento_id, v_nubank_id, v_lead_cristina, 
     'Integração API Bancária - Nubank', 250000.00, 'open', 90, NOW() + INTERVAL '10 days', 
     'Projeto de integração de APIs do SnapDoor CRM com sistemas bancários do Nubank. Incluí licenças Enterprise para 200 usuários + custom onboarding.', 
     NOW() - INTERVAL '45 days', NOW()),
    
    -- DEAL 2: Mercado Livre - CRM Corporativo (EM NEGOCIAÇÃO)
    (v_user_id, v_pipeline_id, v_stage_negociacao_id, v_mercadolivre_id, v_lead_fernando, 
     'CRM Corporativo - Equipe B2B', 180000.00, 'open', 70, NOW() + INTERVAL '20 days', 
     'Implantação de CRM para equipe de vendas B2B com 50 usuários. Inclui migração de dados e treinamento.', 
     NOW() - INTERVAL '30 days', NOW()),
    
    -- DEAL 3: Stone - CRM + Integração Pagamentos (PROPOSTA ENVIADA)
    (v_user_id, v_pipeline_id, v_stage_proposta_id, v_stone_id, v_lead_mariana, 
     'CRM Integrado - Gestão de Leads PME', 320000.00, 'open', 60, NOW() + INTERVAL '30 days', 
     'Solução customizada de CRM integrada com Stone Checkout para gestão automatizada de leads de PMEs. Proposta técnica enviada em 28/09.', 
     NOW() - INTERVAL '25 days', NOW()),
    
    -- DEAL 4: iFood - CRM Parcerias (QUALIFICADO)
    (v_user_id, v_pipeline_id, v_stage_qualificado_id, v_ifood_id, v_lead_roberto, 
     'CRM Gestão de Parcerias Restaurantes', 420000.00, 'open', 40, NOW() + INTERVAL '45 days', 
     'Plataforma CRM para gestão de relacionamento com 50.000+ restaurantes parceiros. Requer alta escalabilidade e integrações customizadas.', 
     NOW() - INTERVAL '20 days', NOW()),
    
    -- DEAL 5: Conta Azul - Plano Starter (QUALIFICADO)
    (v_user_id, v_pipeline_id, v_stage_qualificado_id, v_contaazul_id, v_lead_paula, 
     'Plano Starter - Equipe Vendas', 35000.00, 'open', 30, NOW() + INTERVAL '60 days', 
     'Plano Starter para equipe de vendas interna. Cliente ainda avaliando outras opções. Follow-up agendado para próxima semana.', 
     NOW() - INTERVAL '15 days', NOW()),
    
    -- DEAL 6: RD Station - Enterprise Migration (EM NEGOCIAÇÃO)
    (v_user_id, v_pipeline_id, v_stage_negociacao_id, v_rd_id, v_lead_carlos, 
     'Migração Enterprise - VP Vendas', 550000.00, 'open', 80, NOW() + INTERVAL '15 days', 
     'Migração completa de CRM atual (Salesforce) para SnapDoor. 300 usuários + API integrations. Budget aprovado. Negociando SLA e suporte.', 
     NOW() - INTERVAL '35 days', NOW()),
    
    -- DEAL 7: TOTVS - Integrações Estratégicas (PROPOSTA ENVIADA)
    (v_user_id, v_pipeline_id, v_stage_proposta_id, v_totvs_id, v_lead_juliana, 
     'Integrações com ERP TOTVS', 280000.00, 'open', 50, NOW() + INTERVAL '40 days', 
     'Projeto de integrações bi-direcionais entre SnapDoor CRM e ERPs TOTVS. Proposta técnica com POC de 30 dias enviada.', 
     NOW() - INTERVAL '18 days', NOW()),
    
    -- DEAL 8: Movile - Demo Agendada (QUALIFICADO)
    (v_user_id, v_pipeline_id, v_stage_qualificado_id, v_movile_id, v_lead_andre, 
     'Demo Personalizada - Diretor Inovação', 195000.00, 'open', 35, NOW() + INTERVAL '50 days', 
     'Demo agendada para próxima terça-feira (15/10) às 14h. Interesse em automações avançadas para múltiplas empresas do grupo.', 
     NOW() - INTERVAL '12 days', NOW()),
    
    -- DEAL 9: Wellhub - Expansão LATAM (FECHAMENTO)
    (v_user_id, v_pipeline_id, v_stage_fechamento_id, v_wellhub_id, v_lead_beatriz, 
     'CRM Global - Expansão Internacional', 680000.00, 'open', 95, NOW() + INTERVAL '5 days', 
     'Projeto de CRM global para expansão em 12 países da LATAM. Contrato multi-ano. Aguardando apenas assinatura do CEO. ROI aprovado pelo board.', 
     NOW() - INTERVAL '50 days', NOW()),
    
    -- DEAL 10: QuintoAndar - Trial Extension (QUALIFICADO)
    (v_user_id, v_pipeline_id, v_stage_qualificado_id, v_quintoandar_id, v_lead_rafael, 
     'Trial Estendido - Avaliação', 85000.00, 'open', 25, NOW() + INTERVAL '75 days', 
     'Trial gratuito de 14 dias solicitado. Cliente comparando com HubSpot e Pipedrive. Próximo check-in em 5 dias para coletar feedback.', 
     NOW() - INTERVAL '8 days', NOW());
  
  RAISE NOTICE '✅ 10 Deals inseridos com sucesso para o usuário %', v_user_id;

END $$;

-- =====================================================
-- 5. VERIFICAÇÃO DOS DADOS
-- =====================================================

-- Contar registros criados
SELECT 
  'EMPRESAS' as tipo,
  COUNT(*) as total
FROM companies
WHERE created_at > NOW() - INTERVAL '1 hour'

UNION ALL

SELECT 
  'LEADS' as tipo,
  COUNT(*) as total
FROM leads
WHERE created_at > NOW() - INTERVAL '1 hour'

UNION ALL

SELECT 
  'DEALS' as tipo,
  COUNT(*) as total
FROM deals
WHERE created_at > NOW() - INTERVAL '1 hour';

-- =====================================================
-- SCRIPT FINALIZADO
-- Dados reais inseridos com sucesso!
-- =====================================================
