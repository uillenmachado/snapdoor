import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cfydbvrzjtbcrbzimfjm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeWRidnJ6anRiY3JiemltZmptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA4OTMwOSwiZXhwIjoyMDc1NjY1MzA5fQ.AwCiWyYu8loceV-MPXiwRBySJ5q3f2fBnMwEDyXZ9CI';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createSampleDeals() {
  console.log('\n🔧 Criando deals de exemplo...\n');
  
  // Get real user from auth.users
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError || !authData.users || authData.users.length === 0) {
    console.log('❌ Nenhum usuário encontrado!');
    console.log('Crie um usuário primeiro fazendo login no app.');
    return;
  }
  
  const userId = authData.users[0].id;
  const userEmail = authData.users[0].email;
  console.log(`✅ Usuário: ${userEmail}`);
  
  // Get or create pipeline
  let { data: pipelines } = await supabase
    .from('pipelines')
    .select('*')
    .eq('user_id', userId)
    .limit(1);
    
  let pipeline;
  if (!pipelines || pipelines.length === 0) {
    console.log('📝 Criando pipeline...');
    const { data: newPipeline, error } = await supabase
      .from('pipelines')
      .insert({
        name: 'Pipeline de Vendas',
        user_id: userId,
      })
      .select()
      .single();
      
    if (error) {
      console.log('❌ Erro ao criar pipeline:', error.message);
      return;
    }
    pipeline = newPipeline;
  } else {
    pipeline = pipelines[0];
  }
  
  console.log(`✅ Pipeline: ${pipeline.name}`);
  
  // Get or create stages
  let { data: stages } = await supabase
    .from('stages')
    .select('*')
    .eq('pipeline_id', pipeline.id)
    .order('position');
    
  if (!stages || stages.length === 0) {
    console.log('📝 Criando etapas...');
    const defaultStages = [
      { name: 'Qualificação', position: 0 },
      { name: 'Proposta', position: 1 },
      { name: 'Negociação', position: 2 },
      { name: 'Fechamento', position: 3 },
    ];
    
    const { data: newStages, error } = await supabase
      .from('stages')
      .insert(
        defaultStages.map(s => ({
          ...s,
          pipeline_id: pipeline.id,
        }))
      )
      .select();
      
    if (error) {
      console.log('❌ Erro ao criar etapas:', error.message);
      return;
    }
    stages = newStages;
  }
  
  console.log(`✅ ${stages.length} etapas encontradas\n`);
  
  // Sample companies and deals
  const sampleDeals = [
    {
      title: 'Implementação CRM',
      company_name: 'Tech Solutions Ltda',
      value: 85000,
      probability: 75,
      expected_close_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Projeto de implementação completa do sistema CRM',
      stage_id: stages[0]?.id,
    },
    {
      title: 'Consultoria em Marketing Digital',
      company_name: 'Inovare Marketing',
      value: 45000,
      probability: 60,
      expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Consultoria para estratégia de marketing digital',
      stage_id: stages[1]?.id || stages[0]?.id,
    },
    {
      title: 'Desenvolvimento de Website',
      company_name: 'Start Corp',
      value: 28000,
      probability: 80,
      expected_close_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'Website institucional com blog integrado',
      stage_id: stages[2]?.id || stages[0]?.id,
    },
    {
      title: 'Sistema de Gestão',
      company_name: 'Acme Corporation',
      value: 120000,
      probability: 45,
      expected_close_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'ERP customizado para gestão empresarial',
      stage_id: stages[0]?.id,
    },
    {
      title: 'Automação de Processos',
      company_name: 'Global Industries',
      value: 95000,
      probability: 70,
      expected_close_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: 'RPA e automação de workflows internos',
      stage_id: stages[1]?.id || stages[0]?.id,
    },
  ];
  
  console.log('📝 Criando deals...\n');
  
  for (const deal of sampleDeals) {
    const { data, error } = await supabase
      .from('deals')
      .insert({
        ...deal,
        user_id: userId,
        pipeline_id: pipeline.id,
        status: 'open',
        currency: 'BRL',
      })
      .select()
      .single();
      
    if (error) {
      console.log(`❌ Erro ao criar "${deal.title}": ${error.message}`);
    } else {
      console.log(`✅ Criado: "${deal.title}" - R$ ${deal.value.toLocaleString('pt-BR')} (${deal.probability}%)`);
    }
  }
  
  console.log('\n✅ Processo concluído!\n');
}

createSampleDeals();
