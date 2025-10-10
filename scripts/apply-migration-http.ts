import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = 'https://cfydbvrzjtbcrbzimfjm.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeWRidnJ6anRiY3JiemltZmptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA4OTMwOSwiZXhwIjoyMDc1NjY1MzA5fQ.AwCiWyYu8loceV-MPXiwRBySJ5q3f2fBnMwEDyXZ9CI';

async function executeSQLStatements() {
  console.log('🚀 Iniciando migração do sistema de créditos...\n');

  // Ler arquivo SQL
  const sqlFilePath = path.join(__dirname, '..', 'supabase', 'migrations', '20251010000000_create_credits_system.sql');
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');

  // Dividir em statements individuais (por ponto e vírgula)
  const statements = sqlContent
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

  console.log(`📝 ${statements.length} statements SQL para executar\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    
    // Pular comentários
    if (statement.trim().startsWith('--')) continue;

    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
        },
        body: JSON.stringify({ query: statement })
      });

      if (response.ok) {
        successCount++;
        process.stdout.write(`✅ Statement ${i + 1}/${statements.length}\r`);
      } else {
        errorCount++;
        const errorData = await response.text();
        console.log(`\n❌ Erro no statement ${i + 1}:`, errorData);
      }
    } catch (error: any) {
      errorCount++;
      console.log(`\n❌ Erro ao executar statement ${i + 1}:`, error.message);
    }

    // Pequeno delay entre requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n\n📊 Resultado:`);
  console.log(`   ✅ Sucesso: ${successCount}`);
  console.log(`   ❌ Erros: ${errorCount}\n`);

  if (errorCount === 0) {
    console.log('🎉 Migração concluída com sucesso!');
    console.log('\n📋 Tabelas criadas:');
    console.log('   - user_credits');
    console.log('   - credit_usage_history');
    console.log('   - credit_packages');
    console.log('   - credit_purchases');
    console.log('\n🔧 Funções criadas:');
    console.log('   - debit_credits()');
    console.log('   - add_credits()');
    console.log('\n🎁 Pacotes inseridos:');
    console.log('   - Starter: 50 créditos por R$ 47');
    console.log('   - Growth: 150 créditos por R$ 127');
    console.log('   - Pro: 500 créditos por R$ 397');
    console.log('   - Enterprise: 2000 créditos por R$ 1.497');
    console.log('\n✨ Próximo passo: Execute "npm run generate:types" para atualizar os tipos TypeScript');
  } else {
    console.log('⚠️  Migração concluída com alguns erros.');
    console.log('💡 Tente executar manualmente no SQL Editor do Supabase:');
    console.log(`   ${SUPABASE_URL}/project/cfydbvrzjtbcrbzimfjm/sql/new`);
  }
}

executeSQLStatements().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
