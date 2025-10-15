-- =====================================================
-- SCRIPT EVOLUTIVO - REAPROVEITA O QUE JÁ EXISTE
-- Empresas e Leads JÁ EXISTEM - criar apenas o que falta
-- =====================================================

-- =====================================================
-- 1. PIPELINE E STAGES (com reaproveitamento)
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
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1;
  
  -- ✅ VERIFICAR SE JÁ EXISTE PIPELINE (reaproveitar)
  SELECT id INTO v_pipeline_id FROM pipelines WHERE user_id = v_user_id ORDER BY created_at DESC LIMIT 1;
  
  -- Criar apenas se NÃO existir
  IF v_pipeline_id IS NULL THEN
    INSERT INTO pipelines (user_id, name, description, created_at, updated_at)
    VALUES (
      v_user_id,
      'Pipeline de Vendas',
      'Pipeline principal para gestão de oportunidades B2B',
      NOW(),
      NOW()
    )
    RETURNING id INTO v_pipeline_id;
    
    RAISE NOTICE '✅ Novo pipeline criado: %', v_pipeline_id;
  ELSE
    RAISE NOTICE '♻️ Pipeline existente reaproveitado: %', v_pipeline_id;
  END IF;
  
  -- ✅ VERIFICAR SE JÁ EXISTEM STAGES (reaproveitar)
  SELECT id INTO v_stage_qualificado_id FROM stages WHERE pipeline_id = v_pipeline_id AND position = 0 LIMIT 1;
  SELECT id INTO v_stage_proposta_id FROM stages WHERE pipeline_id = v_pipeline_id AND position = 1 LIMIT 1;
  SELECT id INTO v_stage_negociacao_id FROM stages WHERE pipeline_id = v_pipeline_id AND position = 2 LIMIT 1;
  SELECT id INTO v_stage_fechamento_id FROM stages WHERE pipeline_id = v_pipeline_id AND position = 3 LIMIT 1;
  
  -- Criar stages apenas se NÃO existirem
  IF v_stage_qualificado_id IS NULL THEN
    INSERT INTO stages (pipeline_id, name, position, color, created_at, updated_at)
    VALUES (v_pipeline_id, 'Qualificado', 0, '#3B82F6', NOW(), NOW())
    RETURNING id INTO v_stage_qualificado_id;
    RAISE NOTICE '✅ Stage "Qualificado" criado';
  ELSE
    RAISE NOTICE '♻️ Stage "Qualificado" já existe';
  END IF;
  
  IF v_stage_proposta_id IS NULL THEN
    INSERT INTO stages (pipeline_id, name, position, color, created_at, updated_at)
    VALUES (v_pipeline_id, 'Proposta Enviada', 1, '#8B5CF6', NOW(), NOW())
    RETURNING id INTO v_stage_proposta_id;
    RAISE NOTICE '✅ Stage "Proposta Enviada" criado';
  ELSE
    RAISE NOTICE '♻️ Stage "Proposta Enviada" já existe';
  END IF;
  
  IF v_stage_negociacao_id IS NULL THEN
    INSERT INTO stages (pipeline_id, name, position, color, created_at, updated_at)
    VALUES (v_pipeline_id, 'Em Negociação', 2, '#F59E0B', NOW(), NOW())
    RETURNING id INTO v_stage_negociacao_id;
    RAISE NOTICE '✅ Stage "Em Negociação" criado';
  ELSE
    RAISE NOTICE '♻️ Stage "Em Negociação" já existe';
  END IF;
  
  IF v_stage_fechamento_id IS NULL THEN
    INSERT INTO stages (pipeline_id, name, position, color, created_at, updated_at)
    VALUES (v_pipeline_id, 'Fechamento', 3, '#10B981', NOW(), NOW())
    RETURNING id INTO v_stage_fechamento_id;
    RAISE NOTICE '✅ Stage "Fechamento" criado';
  ELSE
    RAISE NOTICE '♻️ Stage "Fechamento" já existe';
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 Pipeline pronto para uso!';
  RAISE NOTICE '========================================';
  
END $$;

-- =====================================================
-- 2. DEALS/OPORTUNIDADES (apenas se NÃO existirem)
-- =====================================================

DO $$
DECLARE
  v_user_id UUID;
  v_pipeline_id UUID;
  v_stage_qualificado_id UUID;
  v_stage_proposta_id UUID;
  v_stage_negociacao_id UUID;
  v_stage_fechamento_id UUID;
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
  v_existing_deals INTEGER;
  v_inserted_count INTEGER := 0;
BEGIN
  -- Pegar user_id
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1;
  
  -- ✅ VERIFICAR QUANTOS DEALS JÁ EXISTEM
  SELECT COUNT(*) INTO v_existing_deals FROM deals WHERE user_id = v_user_id;
  
  IF v_existing_deals >= 10 THEN
    RAISE NOTICE '♻️ JÁ EXISTEM % deals - NADA A FAZER!', v_existing_deals;
    RETURN;
  END IF;
  
  RAISE NOTICE '📊 Deals existentes: % - Inserindo novos deals...', v_existing_deals;
  
  -- Pegar pipeline
  SELECT id INTO v_pipeline_id FROM pipelines WHERE user_id = v_user_id ORDER BY created_at DESC LIMIT 1;
  
  IF v_pipeline_id IS NULL THEN
    RAISE NOTICE '⚠️ Nenhum pipeline encontrado! Execute o Bloco 1 primeiro.';
    RETURN;
  END IF;

  -- Pegar stages
  SELECT id INTO v_stage_qualificado_id FROM stages WHERE pipeline_id = v_pipeline_id AND position = 0 LIMIT 1;
  SELECT id INTO v_stage_proposta_id FROM stages WHERE pipeline_id = v_pipeline_id AND position = 1 LIMIT 1;
  SELECT id INTO v_stage_negociacao_id FROM stages WHERE pipeline_id = v_pipeline_id AND position = 2 LIMIT 1;
  SELECT id INTO v_stage_fechamento_id FROM stages WHERE pipeline_id = v_pipeline_id AND position = 3 LIMIT 1;

  IF v_stage_qualificado_id IS NULL OR v_stage_proposta_id IS NULL OR v_stage_negociacao_id IS NULL OR v_stage_fechamento_id IS NULL THEN
    RAISE NOTICE '⚠️ Alguns estágios não foram encontrados!';
    RETURN;
  END IF;

  -- Pegar IDs das empresas EXISTENTES
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

  -- Pegar IDs dos leads EXISTENTES
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

  -- ✅ INSERIR APENAS DEALS QUE NÃO EXISTEM (verificar por título único)
  
  -- Deal 1: Nubank
  IF NOT EXISTS (SELECT 1 FROM deals WHERE user_id = v_user_id AND title = 'Integração API Bancária - Nubank') AND v_nubank_id IS NOT NULL THEN
    INSERT INTO deals (user_id, pipeline_id, stage_id, company_id, lead_id, title, value, status, probability, expected_close_date, description, created_at, updated_at)
    VALUES (v_user_id, v_pipeline_id, v_stage_fechamento_id, v_nubank_id, v_lead_cristina, 'Integração API Bancária - Nubank', 250000.00, 'open', 90, NOW() + INTERVAL '10 days', 'Projeto de integração de APIs do SnapDoor CRM com sistemas bancários do Nubank.', NOW() - INTERVAL '45 days', NOW());
    v_inserted_count := v_inserted_count + 1;
  END IF;
  
  -- Deal 2: Mercado Livre
  IF NOT EXISTS (SELECT 1 FROM deals WHERE user_id = v_user_id AND title = 'CRM Corporativo - Equipe B2B') AND v_mercadolivre_id IS NOT NULL THEN
    INSERT INTO deals (user_id, pipeline_id, stage_id, company_id, lead_id, title, value, status, probability, expected_close_date, description, created_at, updated_at)
    VALUES (v_user_id, v_pipeline_id, v_stage_negociacao_id, v_mercadolivre_id, v_lead_fernando, 'CRM Corporativo - Equipe B2B', 180000.00, 'open', 70, NOW() + INTERVAL '20 days', 'Implantação de CRM para equipe de vendas B2B com 50 usuários.', NOW() - INTERVAL '30 days', NOW());
    v_inserted_count := v_inserted_count + 1;
  END IF;
  
  -- Deal 3: Stone
  IF NOT EXISTS (SELECT 1 FROM deals WHERE user_id = v_user_id AND title = 'CRM Integrado - Gestão de Leads PME') AND v_stone_id IS NOT NULL THEN
    INSERT INTO deals (user_id, pipeline_id, stage_id, company_id, lead_id, title, value, status, probability, expected_close_date, description, created_at, updated_at)
    VALUES (v_user_id, v_pipeline_id, v_stage_proposta_id, v_stone_id, v_lead_mariana, 'CRM Integrado - Gestão de Leads PME', 320000.00, 'open', 60, NOW() + INTERVAL '30 days', 'Solução customizada de CRM integrada com Stone Checkout.', NOW() - INTERVAL '25 days', NOW());
    v_inserted_count := v_inserted_count + 1;
  END IF;
  
  -- Deal 4: iFood
  IF NOT EXISTS (SELECT 1 FROM deals WHERE user_id = v_user_id AND title = 'CRM Gestão de Parcerias Restaurantes') AND v_ifood_id IS NOT NULL THEN
    INSERT INTO deals (user_id, pipeline_id, stage_id, company_id, lead_id, title, value, status, probability, expected_close_date, description, created_at, updated_at)
    VALUES (v_user_id, v_pipeline_id, v_stage_qualificado_id, v_ifood_id, v_lead_roberto, 'CRM Gestão de Parcerias Restaurantes', 420000.00, 'open', 40, NOW() + INTERVAL '45 days', 'Plataforma CRM para gestão de relacionamento com 50.000+ restaurantes.', NOW() - INTERVAL '20 days', NOW());
    v_inserted_count := v_inserted_count + 1;
  END IF;
  
  -- Deal 5: Conta Azul
  IF NOT EXISTS (SELECT 1 FROM deals WHERE user_id = v_user_id AND title = 'Plano Starter - Equipe Vendas') AND v_contaazul_id IS NOT NULL THEN
    INSERT INTO deals (user_id, pipeline_id, stage_id, company_id, lead_id, title, value, status, probability, expected_close_date, description, created_at, updated_at)
    VALUES (v_user_id, v_pipeline_id, v_stage_qualificado_id, v_contaazul_id, v_lead_paula, 'Plano Starter - Equipe Vendas', 35000.00, 'open', 30, NOW() + INTERVAL '60 days', 'Plano Starter para equipe de vendas interna.', NOW() - INTERVAL '15 days', NOW());
    v_inserted_count := v_inserted_count + 1;
  END IF;
  
  -- Deal 6: RD Station
  IF NOT EXISTS (SELECT 1 FROM deals WHERE user_id = v_user_id AND title = 'Migração Enterprise - VP Vendas') AND v_rd_id IS NOT NULL THEN
    INSERT INTO deals (user_id, pipeline_id, stage_id, company_id, lead_id, title, value, status, probability, expected_close_date, description, created_at, updated_at)
    VALUES (v_user_id, v_pipeline_id, v_stage_negociacao_id, v_rd_id, v_lead_carlos, 'Migração Enterprise - VP Vendas', 550000.00, 'open', 80, NOW() + INTERVAL '15 days', 'Migração completa de CRM atual (Salesforce) para SnapDoor.', NOW() - INTERVAL '35 days', NOW());
    v_inserted_count := v_inserted_count + 1;
  END IF;
  
  -- Deal 7: TOTVS
  IF NOT EXISTS (SELECT 1 FROM deals WHERE user_id = v_user_id AND title = 'Integrações com ERP TOTVS') AND v_totvs_id IS NOT NULL THEN
    INSERT INTO deals (user_id, pipeline_id, stage_id, company_id, lead_id, title, value, status, probability, expected_close_date, description, created_at, updated_at)
    VALUES (v_user_id, v_pipeline_id, v_stage_proposta_id, v_totvs_id, v_lead_juliana, 'Integrações com ERP TOTVS', 280000.00, 'open', 50, NOW() + INTERVAL '40 days', 'Projeto de integrações bi-direcionais entre SnapDoor CRM e ERPs TOTVS.', NOW() - INTERVAL '18 days', NOW());
    v_inserted_count := v_inserted_count + 1;
  END IF;
  
  -- Deal 8: Movile
  IF NOT EXISTS (SELECT 1 FROM deals WHERE user_id = v_user_id AND title = 'Demo Personalizada - Diretor Inovação') AND v_movile_id IS NOT NULL THEN
    INSERT INTO deals (user_id, pipeline_id, stage_id, company_id, lead_id, title, value, status, probability, expected_close_date, description, created_at, updated_at)
    VALUES (v_user_id, v_pipeline_id, v_stage_qualificado_id, v_movile_id, v_lead_andre, 'Demo Personalizada - Diretor Inovação', 195000.00, 'open', 35, NOW() + INTERVAL '50 days', 'Demo agendada para próxima terça-feira (15/10) às 14h.', NOW() - INTERVAL '12 days', NOW());
    v_inserted_count := v_inserted_count + 1;
  END IF;
  
  -- Deal 9: Wellhub
  IF NOT EXISTS (SELECT 1 FROM deals WHERE user_id = v_user_id AND title = 'CRM Global - Expansão Internacional') AND v_wellhub_id IS NOT NULL THEN
    INSERT INTO deals (user_id, pipeline_id, stage_id, company_id, lead_id, title, value, status, probability, expected_close_date, description, created_at, updated_at)
    VALUES (v_user_id, v_pipeline_id, v_stage_fechamento_id, v_wellhub_id, v_lead_beatriz, 'CRM Global - Expansão Internacional', 680000.00, 'open', 95, NOW() + INTERVAL '5 days', 'Projeto de CRM global para expansão em 12 países da LATAM.', NOW() - INTERVAL '50 days', NOW());
    v_inserted_count := v_inserted_count + 1;
  END IF;
  
  -- Deal 10: QuintoAndar
  IF NOT EXISTS (SELECT 1 FROM deals WHERE user_id = v_user_id AND title = 'Trial Estendido - Avaliação') AND v_quintoandar_id IS NOT NULL THEN
    INSERT INTO deals (user_id, pipeline_id, stage_id, company_id, lead_id, title, value, status, probability, expected_close_date, description, created_at, updated_at)
    VALUES (v_user_id, v_pipeline_id, v_stage_qualificado_id, v_quintoandar_id, v_lead_rafael, 'Trial Estendido - Avaliação', 85000.00, 'open', 25, NOW() + INTERVAL '75 days', 'Trial gratuito de 14 dias solicitado.', NOW() - INTERVAL '8 days', NOW());
    v_inserted_count := v_inserted_count + 1;
  END IF;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ % novos deals inseridos com sucesso!', v_inserted_count;
  RAISE NOTICE '💰 Valor total do pipeline: R$ 2.995.000,00';
  RAISE NOTICE '========================================';

END $$;

-- =====================================================
-- 3. VERIFICAÇÃO FINAL
-- =====================================================

DO $$
DECLARE
  v_user_id UUID;
  v_companies_count INTEGER;
  v_leads_count INTEGER;
  v_pipelines_count INTEGER;
  v_stages_count INTEGER;
  v_deals_count INTEGER;
  v_total_value NUMERIC;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1;
  
  SELECT COUNT(*) INTO v_companies_count FROM companies WHERE user_id = v_user_id;
  SELECT COUNT(*) INTO v_leads_count FROM leads WHERE user_id = v_user_id;
  SELECT COUNT(*) INTO v_pipelines_count FROM pipelines WHERE user_id = v_user_id;
  SELECT COUNT(*) INTO v_stages_count FROM stages WHERE pipeline_id IN (SELECT id FROM pipelines WHERE user_id = v_user_id);
  SELECT COUNT(*) INTO v_deals_count FROM deals WHERE user_id = v_user_id;
  SELECT COALESCE(SUM(value), 0) INTO v_total_value FROM deals WHERE user_id = v_user_id AND status = 'open';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '📊 RESUMO DO BANCO DE DADOS';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🏢 Empresas: %', v_companies_count;
  RAISE NOTICE '👤 Leads: %', v_leads_count;
  RAISE NOTICE '📈 Pipelines: %', v_pipelines_count;
  RAISE NOTICE '🎯 Stages: %', v_stages_count;
  RAISE NOTICE '💼 Deals: %', v_deals_count;
  RAISE NOTICE '💰 Valor Total Pipeline: R$ %', v_total_value;
  RAISE NOTICE '========================================';
  
END $$;
