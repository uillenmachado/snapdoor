# 🔧 INSTRUÇÕES PARA EXECUTAR SQL NO SUPABASE

## ⚠️ IMPORTANTE: Execute este processo manualmente no Supabase Dashboard

O Supabase CLI tem limitações para executar SQL diretamente. A forma mais confiável é usar o Dashboard.

---

## 📋 PASSO A PASSO

### 1️⃣ Abrir Supabase Dashboard
- Acesse: https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm
- Faça login se necessário

### 2️⃣ Ir para SQL Editor
- No menu lateral esquerdo, clique em **"SQL Editor"**
- Clique no botão **"New query"** (ou "+ New Query")

### 3️⃣ Copiar o SQL
- Abra o arquivo: `SUPABASE_FIX_SCRIPT.sql` (está na raiz do projeto)
- **Selecione TODO o conteúdo** (Ctrl+A)
- **Copie** (Ctrl+C)

### 4️⃣ Colar e Executar
- **Cole** todo o SQL no editor do Supabase (Ctrl+V)
- Clique no botão **"Run"** (ou pressione Ctrl+Enter)
- ⏳ Aguarde a execução (pode levar 5-10 segundos)

### 5️⃣ Verificar Resultado
Você deve ver várias mensagens de sucesso:
```
DROP TRIGGER
DROP FUNCTION
ALTER TABLE
CREATE TABLE
CREATE FUNCTION
CREATE TRIGGER
CREATE POLICY
UPDATE X
INSERT X
CREATE INDEX
```

No final, você verá uma tabela com a verificação:
```
total_users | users_with_profile | users_with_subscription | users_with_credits
------------|-------------------|------------------------|-------------------
     X      |         X         |           X            |         X
```

**✅ Sucesso:** Todos os números devem ser iguais!

---

## 🧪 TESTAR APÓS EXECUÇÃO

### Teste 1: Criar Usuário Manualmente no Dashboard
1. Supabase → **Authentication** → **Users**
2. Clique em **"Add user"** → **"Create new user"**
3. Preencha:
   - Email: `teste@exemplo.com`
   - Password: `Teste123!@#`
   - ✅ **Auto Confirm User** (marcar)
4. Clique em **"Create user"**
5. ✅ **Deve criar SEM ERROS!**

### Teste 2: Verificar Profile Criado
1. Supabase → **Table Editor** → **profiles**
2. Procure o usuário `teste@exemplo.com`
3. ✅ Deve aparecer com:
   - `id`: UUID do usuário
   - `email`: teste@exemplo.com
   - `full_name`: "teste" (parte antes do @)

### Teste 3: Verificar Subscription Criada
1. Supabase → **Table Editor** → **subscriptions**
2. Procure o `user_id` igual ao UUID do usuário
3. ✅ Deve aparecer com:
   - `plan`: "free"
   - `status`: "trial"
   - `current_period_end`: +14 dias da criação

### Teste 4: Verificar Credits Criados
1. Supabase → **Table Editor** → **user_credits**
2. Procure o `user_id` igual ao UUID do usuário
3. ✅ Deve aparecer com:
   - `total_credits`: 10
   - `used_credits`: 0

---

## 🎯 TESTE FINAL: Signup na Aplicação

Após confirmar que tudo funciona no Dashboard:

1. Abra: https://snapdoor-3rlvqvo48-uillens-projects.vercel.app/signup
2. Preencha:
   - Nome: Seu Nome
   - Email: seu-email-real@gmail.com
   - Senha: SenhaForte123!@#
3. Clique em **"Criar conta"**
4. ✅ **Deve funcionar SEM ERRO 500!**
5. Verifique seu email para confirmação
6. Clique no link de confirmação
7. Deve redirecionar para `/confirm-email` → sucesso → `/dashboard`

---

## ❌ SE ALGO DER ERRADO

### Erro: "relation does not exist"
**Solução:** Verifique se as tabelas `subscriptions` e `user_credits` existem:
- Supabase → Table Editor
- Se não existirem, o script criará automaticamente

### Erro: "permission denied"
**Solução:** Execute o script como `postgres` user (já está configurado no script com `SECURITY DEFINER`)

### Erro: "duplicate key value"
**Solução:** Normal! Significa que o usuário já existe. O script tem `ON CONFLICT` para lidar com isso.

---

## 📊 VERIFICAÇÃO FINAL

Após executar, rode esta query no SQL Editor para ver o status:

```sql
SELECT 
  COUNT(DISTINCT au.id) as total_users,
  COUNT(DISTINCT p.id) as users_with_profile,
  COUNT(DISTINCT s.id) as users_with_subscription,
  COUNT(DISTINCT c.id) as users_with_credits
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
LEFT JOIN public.subscriptions s ON s.user_id = au.id
LEFT JOIN public.user_credits c ON c.user_id = au.id;
```

**Resultado esperado:** Todos os valores iguais (exemplo: `5, 5, 5, 5`)

---

## 🎉 PRÓXIMOS PASSOS

Após a execução bem-sucedida:

1. ✅ Configurar Email Confirmation (docs/SUPABASE_EMAIL_SETUP.md)
2. ✅ Testar signup completo
3. ✅ Executar VISUAL_TEST_CHECKLIST.md
4. ✅ Começar SAAS_READY_CHECKLIST.md

---

**💡 Dica:** Salve o SQL executado em uma nova migration depois que funcionar:
```bash
npx supabase migration new user_creation_fix_applied
# Cole o conteúdo de SUPABASE_FIX_SCRIPT.sql na nova migration
```

---

**🔗 Links Úteis:**
- Dashboard: https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm
- SQL Editor: https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm/sql
- Authentication: https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm/auth/users
- App Deploy: https://snapdoor-3rlvqvo48-uillens-projects.vercel.app

