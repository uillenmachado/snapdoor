# 🚨 FIX URGENTE - Supabase 500 Error no Signup

**ERRO:** `POST /auth/v1/signup 500 (Internal Server Error)`  
**CAUSA:** Configuração do Supabase Auth

---

## ✅ SOLUÇÃO (5 MINUTOS)

### PASSO 1: Desabilitar Confirmação de Email (Temporário)

1. **Acesse:** https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm

2. **Menu lateral** → 🔐 **Authentication**

3. **Submenu** → **Providers** → **Email**

4. **Encontre:** "Confirm email"

5. **DESABILITE:** ☐ Confirm email

6. **Clique:** **Save**

---

### PASSO 2: Adicionar URL de Redirecionamento

1. Ainda em **Authentication**

2. **Submenu** → **URL Configuration**

3. **Site URL:** 
   ```
   https://snapdoor-n4nggfuyd-uillens-projects.vercel.app
   ```

4. **Redirect URLs** (adicionar TODAS):
   ```
   https://snapdoor-n4nggfuyd-uillens-projects.vercel.app/**
   https://snapdoor-n4nggfuyd-uillens-projects.vercel.app/dashboard
   https://snapdoor-*.vercel.app/**
   http://localhost:8080/**
   ```

5. **Clique:** **Save**

---

### PASSO 3: Verificar Políticas RLS

1. **Menu lateral** → 📊 **Database** → **Tables**

2. **Tabela:** `profiles` (ou `users`)

3. **Clique** na tabela

4. **Menu superior** → **RLS (Row Level Security)**

5. **Verificar se tem política:**
   ```sql
   -- Deve existir:
   CREATE POLICY "Users can insert own profile"
   ON profiles FOR INSERT
   WITH CHECK (auth.uid() = id);
   ```

6. **Se NÃO existir, adicionar:**
   - Clique em **"New Policy"**
   - Template: **"Enable insert for authenticated users only"**
   - Target roles: **authenticated**
   - Clique: **Save policy**

---

### PASSO 4: Testar Novamente

1. **Abrir:** https://snapdoor-n4nggfuyd-uillens-projects.vercel.app/signup

2. **Preencher:**
   - Email: `teste@example.com`
   - Senha: `Teste123!@#`
   - Nome: `Teste Usuario`

3. **Criar Conta**

4. **DEVE FUNCIONAR** ✅

---

## 🔍 SE AINDA DER ERRO 500

### Ver Logs Detalhados do Supabase

1. **Supabase Dashboard** → **Logs** (menu lateral)

2. **Filtrar por:** `auth`

3. **Procurar por:** Últimas requisições com erro 500

4. **Copiar mensagem de erro exata**

---

## 🛠️ ALTERNATIVA: Criar Usuário Manualmente (Temporário)

Se quiser testar AGORA enquanto configura:

1. **Supabase Dashboard** → **Authentication** → **Users**

2. **Clique:** **Add user** → **Create new user**

3. **Preencher:**
   - Email: `admin@snapdoor.local`
   - Password: `Admin123!@#`
   - ☑ Auto Confirm User

4. **Clique:** **Create user**

5. **Fazer login** com essas credenciais em:
   ```
   https://snapdoor-n4nggfuyd-uillens-projects.vercel.app/login
   ```

---

## 📋 CHECKLIST

- [ ] Desabilitei "Confirm email"
- [ ] Adicionei Site URL
- [ ] Adicionei Redirect URLs (4 URLs)
- [ ] Verifiquei RLS policies na tabela profiles
- [ ] Testei signup novamente
- [ ] ✅ Funcionou!

---

## 🎯 APÓS FUNCIONAR

**Reabilitar confirmação de email:**
1. Configurar Resend (emails transacionais)
2. Voltar em Auth > Providers > Email
3. ☑ Habilitar "Confirm email"
4. Configurar template de email
5. Testar fluxo completo

---

**🚀 EXECUTE PASSO 1 e PASSO 2 AGORA E ME AVISE O RESULTADO!**
