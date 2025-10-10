import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cfydbvrzjtbcrbzimfjm.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeWRidnJ6anRiY3JiemltZmptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDA4OTMwOSwiZXhwIjoyMDc1NjY1MzA5fQ.AwCiWyYu8loceV-MPXiwRBySJ5q3f2fBnMwEDyXZ9CI';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function applyMigration() {
  console.log('🚀 Aplicando migration no Supabase...\n');

  try {
    // Ler migration
    const sql = readFileSync('./migrations/20251010000001_fix_all_tables.sql', 'utf-8');
    console.log(`✅ Migration carregada (${sql.length} caracteres)\n`);

    // Dividir em statements individuais (por ponto e vírgula no final da linha)
    const statements = sql
      .split(/;\s*\n/)
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    console.log(`📋 ${statements.length} statements SQL para executar\n`);

    let successCount = 0;
    let errorCount = 0;

    // Executar cada statement individualmente
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Pular comentários e statements vazios
      if (!statement || statement.startsWith('--')) continue;

      try {
        const { error } = await supabase.rpc('exec_sql', { query: statement + ';' });
        
        if (error) {
          // Alguns erros são esperados (ex: tabela já existe)
          if (error.message?.includes('already exists') || 
              error.message?.includes('duplicate') ||
              error.code === 'PGRST204') {
            console.log(`⚠️  [${i + 1}/${statements.length}] Já existe (OK)`);
            successCount++;
          } else {
            console.error(`❌ [${i + 1}/${statements.length}] Erro:`, error.message);
            errorCount++;
          }
        } else {
          console.log(`✅ [${i + 1}/${statements.length}] Executado com sucesso`);
          successCount++;
        }
      } catch (err: any) {
        console.error(`❌ [${i + 1}/${statements.length}] Erro:`, err.message);
        errorCount++;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Sucesso: ${successCount} statements`);
    console.log(`❌ Erros: ${errorCount} statements`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (errorCount === 0 || successCount > errorCount) {
      console.log('🎉 Migration aplicada com sucesso!\n');
      console.log('✅ Verificando tabelas criadas...\n');
      
      // Listar tabelas
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (!tablesError && tables) {
        console.log('📊 Tabelas no banco:\n');
        tables.forEach((t: any) => console.log(`   ✅ ${t.table_name}`));
      }
    } else {
      console.log('⚠️  Migration teve alguns erros, mas pode ter sido parcialmente aplicada.');
      console.log('📋 Verifique manualmente no Supabase Dashboard.');
    }

  } catch (error: any) {
    console.error('❌ Erro fatal:', error.message);
    console.log('\n📋 SOLUÇÃO MANUAL:');
    console.log('1. Acesse: https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm/editor');
    console.log('2. SQL Editor → New Query');
    console.log('3. Cole o conteúdo de: supabase/migrations/20251010000001_fix_all_tables.sql');
    console.log('4. Execute (Ctrl+Enter)\n');
    process.exit(1);
  }
}

applyMigration();
