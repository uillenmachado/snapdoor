import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cfydbvrzjtbcrbzimfjm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeWRidnJ6anRiY3JiemltZmptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA4OTMwOSwiZXhwIjoyMDc1NjY1MzA5fQ.AwCiWyYu8loceV-MPXiwRBySJ5q3f2fBnMwEDyXZ9CI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAndUpdate() {
  console.log('🚀 Testando estrutura da tabela leads...\n');

  // 1. Verificar estrutura atual
  const { data: leads, error: fetchError } = await supabase
    .from('leads')
    .select('*')
    .limit(1);

  if (fetchError) {
    console.log('❌ Erro ao buscar leads:', fetchError.message);
    return;
  }

  if (leads && leads.length > 0) {
    const firstLead = leads[0];
    console.log('📋 Campos atuais na tabela leads:');
    console.log(Object.keys(firstLead).join(', '));
    console.log('');

    // Verificar se novos campos existem
    const hasNewFields = 'deal_value' in firstLead && 
                        'expected_close_date' in firstLead && 
                        'probability' in firstLead;

    if (hasNewFields) {
      console.log('✅ Novos campos JÁ EXISTEM!');
      console.log('✅ Migration já foi aplicada anteriormente.\n');
      
      // Mostrar estatísticas
      const { data: stats } = await supabase
        .from('leads')
        .select('deal_value, probability, expected_close_date');

      if (stats) {
        const total = stats.length;
        const withValue = stats.filter(l => l.deal_value > 0).length;
        const avgValue = stats.reduce((sum, l) => sum + (l.deal_value || 0), 0) / total;
        
        console.log('📊 Estatísticas:');
        console.log(`- Total de leads: ${total}`);
        console.log(`- Leads com valor: ${withValue} (${(withValue/total*100).toFixed(1)}%)`);
        console.log(`- Valor médio: R$ ${avgValue.toFixed(2)}`);
        console.log('');
      }

      return;
    }

    console.log('⚠️  Novos campos NÃO ENCONTRADOS.');
    console.log('📝 É necessário aplicar a migration no Supabase Dashboard.\n');
    console.log('🔗 Acesse: https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm/sql/new');
    console.log('📄 Cole o conteúdo de: supabase/MIGRATION_MANUAL.sql\n');
  }
}

testAndUpdate().catch(console.error);
