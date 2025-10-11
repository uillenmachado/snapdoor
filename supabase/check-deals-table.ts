import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cfydbvrzjtbcrbzimfjm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeWRidnJ6anRiY3JiemltZmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODkzMDksImV4cCI6MjA3NTY2NTMwOX0.mheMDyCvgqpgNJnAqrqeiZbouFQP6QZ0nrQlOEsRLW8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDealsTable() {
  console.log('\n🔍 Verificando se a tabela DEALS existe...\n');
  
  // Tentar buscar da tabela deals
  const { data: deals, error: dealsError } = await supabase
    .from('deals')
    .select('*')
    .limit(1);
  
  if (dealsError) {
    console.log('❌ Tabela DEALS NÃO existe!');
    console.log('Erro:', dealsError.message);
    console.log('\n📝 Estrutura antiga detectada (leads com campos de deal)');
    return false;
  }
  
  console.log('✅ Tabela DEALS EXISTE!');
  console.log(`📊 Total de deals: ${deals?.length || 0}`);
  
  // Verificar deal_participants
  const { error: participantsError } = await supabase
    .from('deal_participants')
    .select('*')
    .limit(1);
  
  if (participantsError) {
    console.log('❌ Tabela DEAL_PARTICIPANTS NÃO existe!');
  } else {
    console.log('✅ Tabela DEAL_PARTICIPANTS EXISTE!');
  }
  
  console.log('\n🎯 ESTRUTURA MODERNA DETECTADA (deals separados de leads)!');
  return true;
}

checkDealsTable();
