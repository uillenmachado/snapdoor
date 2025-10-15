-- =====================================================
-- CORREÇÃO: Adicionar cargo aos leads
-- Schema real: leads tem 'title' e 'headline' (NÃO tem job_title ou company)
-- =====================================================

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Pegar user_id da conta dev
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1;
  
  RAISE NOTICE 'Atualizando title e headline de 10 leads para user_id: %', v_user_id;
  
  -- Atualizar title (cargo) e headline (descrição profissional)
  UPDATE leads SET 
    title = 'Co-fundadora & CFO',
    headline = 'Co-fundadora & CFO at Nubank'
  WHERE email = 'cristina.j@nubank.com.br' AND user_id = v_user_id;
  
  UPDATE leads SET 
    title = 'Diretor de Parcerias',
    headline = 'Diretor de Parcerias at Mercado Livre'
  WHERE email = 'fernando.silva@mercadolivre.com' AND user_id = v_user_id;
  
  UPDATE leads SET 
    title = 'Gerente de Vendas Corporativas',
    headline = 'Gerente de Vendas Corporativas at Stone Pagamentos'
  WHERE email = 'mariana.costa@stone.com.br' AND user_id = v_user_id;
  
  UPDATE leads SET 
    title = 'Head de Parcerias Estratégicas',
    headline = 'Head de Parcerias Estratégicas at iFood'
  WHERE email = 'roberto.andrade@ifood.com.br' AND user_id = v_user_id;
  
  UPDATE leads SET 
    title = 'Gerente Comercial',
    headline = 'Gerente Comercial at Conta Azul'
  WHERE email = 'paula.rodrigues@contaazul.com' AND user_id = v_user_id;
  
  UPDATE leads SET 
    title = 'VP de Vendas',
    headline = 'VP de Vendas at Resultados Digitais'
  WHERE email = 'carlos.mendes@rdstation.com' AND user_id = v_user_id;
  
  UPDATE leads SET 
    title = 'Diretora de Integrações',
    headline = 'Diretora de Integrações at TOTVS'
  WHERE email = 'juliana.santos@totvs.com' AND user_id = v_user_id;
  
  UPDATE leads SET 
    title = 'Diretor de Inovação',
    headline = 'Diretor de Inovação at Movile'
  WHERE email = 'andre.oliveira@movile.com' AND user_id = v_user_id;
  
  UPDATE leads SET 
    title = 'Global Sales Director',
    headline = 'Global Sales Director at Wellhub'
  WHERE email = 'beatriz.lima@wellhub.com' AND user_id = v_user_id;
  
  UPDATE leads SET 
    title = 'Gerente de Avaliação',
    headline = 'Gerente de Avaliação at QuintoAndar'
  WHERE email = 'rafael.ferreira@quintoandar.com.br' AND user_id = v_user_id;
  
  RAISE NOTICE '✅ 10 Leads atualizados com title e headline!';
  
END $$;

-- Verificação (usando colunas que REALMENTE existem)
SELECT 
  l.first_name || ' ' || l.last_name as nome,
  COALESCE(c.name, 'Sem empresa') as empresa,
  l.title as cargo,
  l.headline,
  l.email
FROM leads l
LEFT JOIN companies c ON l.company_id = c.id
WHERE l.email IN (
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
ORDER BY l.first_name;
