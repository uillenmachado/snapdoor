-- =====================================================
-- CORREÇÃO: Atualizar stage_ids dos Deals
-- Os deals estão com stage_ids que não correspondem aos stages atuais
-- =====================================================

-- Primeiro, vamos ver os IDs atuais dos stages
SELECT 
  id,
  name,
  position,
  pipeline_id
FROM stages
WHERE pipeline_id IN (
  SELECT id FROM pipelines WHERE user_id = (
    SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1
  )
)
ORDER BY position;

-- Agora vamos atualizar os deals para apontarem para os stages corretos
-- baseado no NOME do stage (que é mais estável que o ID)

DO $$
DECLARE
  v_user_id UUID;
  v_pipeline_id UUID;
  v_stage_qualificado UUID;
  v_stage_contato UUID;
  v_stage_demo UUID;
  v_stage_proposta UUID;
  v_stage_ganho UUID;
BEGIN
  -- Pegar user_id
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1;
  
  -- Pegar pipeline_id
  SELECT id INTO v_pipeline_id FROM pipelines WHERE user_id = v_user_id LIMIT 1;
  
  -- Pegar IDs dos stages pelo nome
  SELECT id INTO v_stage_qualificado FROM stages 
  WHERE pipeline_id = v_pipeline_id AND name = 'Qualificado' LIMIT 1;
  
  SELECT id INTO v_stage_contato FROM stages 
  WHERE pipeline_id = v_pipeline_id AND name = 'Contato Feito' LIMIT 1;
  
  SELECT id INTO v_stage_demo FROM stages 
  WHERE pipeline_id = v_pipeline_id AND name = 'Demo Agendada' LIMIT 1;
  
  SELECT id INTO v_stage_proposta FROM stages 
  WHERE pipeline_id = v_pipeline_id AND name = 'Proposta Enviada' LIMIT 1;
  
  SELECT id INTO v_stage_ganho FROM stages 
  WHERE pipeline_id = v_pipeline_id AND name = 'Ganho' LIMIT 1;
  
  -- Mostrar IDs encontrados
  RAISE NOTICE 'IDs dos Stages:';
  RAISE NOTICE 'Qualificado: %', v_stage_qualificado;
  RAISE NOTICE 'Contato Feito: %', v_stage_contato;
  RAISE NOTICE 'Demo Agendada: %', v_stage_demo;
  RAISE NOTICE 'Proposta Enviada: %', v_stage_proposta;
  RAISE NOTICE 'Ganho: %', v_stage_ganho;
  
  -- Atualizar deals baseado nos títulos (distribuição que faz sentido)
  -- Deals que parecem estar em Qualificado (início do funil)
  UPDATE deals SET stage_id = v_stage_qualificado, pipeline_id = v_pipeline_id
  WHERE user_id = v_user_id 
    AND title IN (
      'CRM Gestão de Parcerias Restaurantes',
      'Plano Starter - Equipe Vendas',
      'Demo Personalizada - Diretor Inovação',
      'Trial Estendido - Avaliação'
    );
  
  -- Deals em Proposta Enviada
  UPDATE deals SET stage_id = v_stage_proposta, pipeline_id = v_pipeline_id
  WHERE user_id = v_user_id 
    AND title IN (
      'CRM Integrado - Gestão de Leads PME',
      'Integrações com ERP TOTVS'
    );
  
  -- Deals em Negociação
  UPDATE deals SET stage_id = v_stage_contato, pipeline_id = v_pipeline_id
  WHERE user_id = v_user_id 
    AND title IN (
      'CRM Corporativo - Equipe B2B',
      'Migração Enterprise - VP Vendas'
    );
  
  -- Deals em Fechamento/Ganho
  UPDATE deals SET stage_id = v_stage_ganho, pipeline_id = v_pipeline_id
  WHERE user_id = v_user_id 
    AND title IN (
      'Integração API Bancária - Nubank',
      'CRM Global - Expansão Internacional'
    );
  
  RAISE NOTICE 'Deals atualizados com sucesso!';
END $$;

-- Verificar resultado
SELECT 
  d.title,
  s.name as stage_nome,
  d.value
FROM deals d
JOIN stages s ON d.stage_id = s.id
WHERE d.user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1)
ORDER BY s.position, d.title;
