-- =============================================
-- INSTRUÇÕES DE APLICAÇÃO - COPIE E COLE NO SUPABASE
-- =============================================

/* 
   PASSO 1: Vá para o Supabase Dashboard
   URL: https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm/editor
   
   PASSO 2: Clique em "SQL Editor" no menu lateral esquerdo
   
   PASSO 3: Clique em "New Query"
   
   PASSO 4: Cole TODO o conteúdo do arquivo:
   supabase/migrations/20251010000001_fix_all_tables.sql
   
   PASSO 5: Clique em "Run" ou pressione Ctrl+Enter
   
   PASSO 6: Aguarde a execução (deve levar 5-10 segundos)
   
   PASSO 7: Verifique se não há erros na saída
   
   PASSO 8: Verifique as tabelas criadas clicando em "Table Editor"
   
   Você deve ver as seguintes tabelas:
   ✅ profiles
   ✅ pipelines
   ✅ stages
   ✅ leads
   ✅ notes
   ✅ activities
   ✅ subscriptions
   ✅ user_credits
   ✅ credit_usage_history
   ✅ credit_packages
   ✅ credit_purchases
*/

-- =============================================
-- O QUE ESTA MIGRATION FAZ:
-- =============================================

-- 1. Cria tabela subscriptions (estava faltando - causando erro 404)
-- 2. Cria/verifica todas as tabelas principais com IF NOT EXISTS
-- 3. Adiciona campos faltantes (temperature, last_interaction, source em leads)
-- 4. Garante RLS em todas as tabelas
-- 5. Cria políticas de segurança apenas se não existirem (usando DO blocks)
-- 6. Adiciona índices para performance
-- 7. Cria pipeline padrão para usuários sem pipeline
-- 8. Cria stages padrão para pipelines vazios

-- =============================================
-- RESULTADO ESPERADO:
-- =============================================

-- Após executar esta migration:
-- ✅ Todos os erros 404 devem desaparecer
-- ✅ Dashboard deve carregar sem erros
-- ✅ Kanban board deve funcionar
-- ✅ Sistema de créditos deve estar operacional
-- ✅ Você terá um pipeline com 6 stages criado automaticamente
