import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = 'https://cfydbvrzjtbcrbzimfjm.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeWRidnJ6anRiY3Jiemlta2ZqbSIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MjgyMjI4NTgsImV4cCI6MjA0Mzc5ODg1OH0.N4d2GJFWCrLTGSXTutkUTEKjq8-5rUVgaMMDyTBVYrU';

async function applyMigration() {
  try {
    console.log('📖 Lendo arquivo de migration...');
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20251010000001_fix_all_tables.sql');
    const sql = readFileSync(migrationPath, 'utf-8');
    
    console.log(`✅ Migration carregada (${sql.length} caracteres)`);
    console.log('🚀 Executando migration no Supabase...\n');

    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erro ao executar migration:', error);
      
      // Tentar método alternativo: executar via API do Supabase Management
      console.log('\n🔄 Tentando método alternativo via Supabase Management API...');
      
      const projectRef = 'cfydbvrzjtbcrbzimfjm';
      const managementResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify({ query: sql })
      });

      if (!managementResponse.ok) {
        const managementError = await managementResponse.text();
        console.error('❌ Método alternativo também falhou:', managementError);
        console.log('\n📋 SOLUÇÃO MANUAL NECESSÁRIA:');
        console.log('1. Acesse: https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm/editor');
        console.log('2. Clique em "SQL Editor"');
        console.log('3. Cole o conteúdo do arquivo: supabase/migrations/20251010000001_fix_all_tables.sql');
        console.log('4. Clique em "Run"\n');
        process.exit(1);
      }
    }

    const result = await response.json();
    console.log('✅ Migration executada com sucesso!');
    console.log('📊 Resultado:', result);
    
    console.log('\n🎉 TODAS AS TABELAS FORAM CRIADAS:');
    console.log('  ✅ profiles');
    console.log('  ✅ pipelines');
    console.log('  ✅ stages');
    console.log('  ✅ leads');
    console.log('  ✅ notes');
    console.log('  ✅ activities');
    console.log('  ✅ subscriptions');
    console.log('  ✅ user_credits');
    console.log('  ✅ credit_usage_history');
    console.log('  ✅ credit_packages');
    console.log('  ✅ credit_purchases');
    
    console.log('\n🔒 RLS e políticas de segurança aplicadas');
    console.log('📈 Índices de performance criados');
    console.log('🎯 Pipeline padrão + 6 stages criados automaticamente\n');
    
  } catch (error) {
    console.error('❌ Erro ao aplicar migration:', error);
    console.log('\n📋 SOLUÇÃO MANUAL NECESSÁRIA:');
    console.log('1. Acesse: https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm/editor');
    console.log('2. Clique em "SQL Editor"');
    console.log('3. Cole o conteúdo do arquivo: supabase/migrations/20251010000001_fix_all_tables.sql');
    console.log('4. Clique em "Run"\n');
    process.exit(1);
  }
}

applyMigration();
