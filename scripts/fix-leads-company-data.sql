-- =====================================================
-- CORREÇÃO: Adicionar dados de empresa e cargo aos leads
-- Os leads foram inseridos mas faltam company e job_title
-- =====================================================

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Pegar user_id da conta dev
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1;
  
  -- Atualizar leads com informações de empresa e cargo
  UPDATE leads SET company = 'Nubank', headline = 'Co-fundadora & CFO'
  WHERE email = 'cristina.j@nubank.com.br' AND user_id = v_user_id;
  
  UPDATE leads SET company = 'Mercado Livre', headline = 'Diretor de Parcerias'
  WHERE email = 'fernando.silva@mercadolivre.com' AND user_id = v_user_id;
  
  UPDATE leads SET company = 'Stone Pagamentos', headline = 'Gerente de Vendas Corporativas'
  WHERE email = 'mariana.costa@stone.com.br' AND user_id = v_user_id;
  
  UPDATE leads SET company = 'iFood', headline = 'Head de Parcerias Estratégicas'
  WHERE email = 'roberto.andrade@ifood.com.br' AND user_id = v_user_id;
  
  UPDATE leads SET company = 'Conta Azul', headline = 'Gerente Comercial'
  WHERE email = 'paula.rodrigues@contaazul.com' AND user_id = v_user_id;
  
  UPDATE leads SET company = 'Resultados Digitais', headline = 'VP de Vendas'
  WHERE email = 'carlos.mendes@rdstation.com' AND user_id = v_user_id;
  
  UPDATE leads SET company = 'TOTVS', headline = 'Diretora de Integrações'
  WHERE email = 'juliana.santos@totvs.com' AND user_id = v_user_id;
  
  UPDATE leads SET company = 'Movile', headline = 'Diretor de Inovação'
  WHERE email = 'andre.oliveira@movile.com' AND user_id = v_user_id;
  
  UPDATE leads SET company = 'Wellhub', headline = 'Global Sales Director'
  WHERE email = 'beatriz.lima@wellhub.com' AND user_id = v_user_id;
  
  UPDATE leads SET company = 'QuintoAndar', headline = 'Gerente de Avaliação'
  WHERE email = 'rafael.ferreira@quintoandar.com.br' AND user_id = v_user_id;
  
  RAISE NOTICE '✅ 10 Leads atualizados com empresa e cargo!';
  
END $$;

-- Verificação
SELECT 
  first_name || ' ' || last_name as nome,
  company as empresa,
  headline as cargo,
  email
FROM leads 
WHERE email IN (
  'cristina.j@nubank.com.br',
  'fernando.silva@mercadolivre.com',
  'mariana.costa@stone.com.br',
  'roberto.andrade@ifood.com.br',
  'paula.rodrigues@contaazul.com',
  'carlos.mendes@rdstation.com',
  'juliana.santos@totvs.com',
  'andre.oliveira@movile.com',
  'beatriz.lima@wellhub.com',
  'rafael.ferreira@quintoandar.com.br'
)
ORDER BY first_name;
