#!/usr/bin/env tsx
/**
 * BOOTSTRAP SCRIPT - Criar conta admin automaticamente
 * 
 * Executa a migration que cria o usuário admin/master
 * no primeiro deploy do sistema.
 * 
 * Uso:
 *   npm run bootstrap:admin
 *   ou
 *   tsx scripts/bootstrap-admin.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://cfydbvrzjtbcrbzimfjm.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ ERRO: SUPABASE_SERVICE_ROLE_KEY não encontrada!');
  console.log('\n📋 Adicione ao .env:');
  console.log('SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function bootstrapAdmin() {
  console.log('🚀 SnapDoor CRM - Bootstrap Admin User');
  console.log('==========================================\n');

  try {
    // Lê a migration
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20251013000001_create_admin_user.sql');
    const sql = readFileSync(migrationPath, 'utf-8');

    console.log('📖 Carregando migration...');
    console.log(`   ${migrationPath}`);

    // Executa via RPC
    console.log('\n🔧 Executando migration...');
    
    const { data, error } = await supabase.rpc('exec', {
      query: sql
    });

    if (error) {
      console.error('❌ Erro ao executar migration:', error);
      console.log('\n📋 SOLUÇÃO ALTERNATIVA:');
      console.log('1. Acesse: https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm/sql');
      console.log('2. Cole o conteúdo de: supabase/migrations/20251013000001_create_admin_user.sql');
      console.log('3. Execute (Run)\n');
      process.exit(1);
    }

    console.log('✅ Migration executada com sucesso!\n');

    // Verifica se admin foi criado
    console.log('🔍 Verificando criação do admin...');
    
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error('❌ Erro ao listar usuários:', usersError);
    } else {
      const adminUser = users.users.find(u => u.email === 'admin@snapdoor.com');
      
      if (adminUser) {
        console.log('✅ Usuário admin criado com sucesso!\n');
        console.log('📋 CREDENCIAIS DE ACESSO:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   Email:    admin@snapdoor.com');
        console.log('   Senha:    SnapDoor2025!Admin');
        console.log('   Role:     super_admin');
        console.log('   Créditos: 999,999 (ilimitado)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        console.log('🎉 Bootstrap completo! Você pode fazer login agora.');
      } else {
        console.log('⚠️  Admin não encontrado. Pode já existir ou houve erro.');
        console.log('   Tente fazer login com: admin@snapdoor.com\n');
      }
    }

  } catch (error: any) {
    console.error('❌ Erro fatal:', error.message);
    console.log('\n📋 Execute manualmente no Supabase Dashboard (SQL Editor)');
    process.exit(1);
  }
}

// Executa
bootstrapAdmin();
