# 🚨 CONFIGURAÇÃO URGENTE - Variáveis de Ambiente no Vercel

**ERRO ATUAL:** 500 Internal Server Error no signup do Supabase  
**CAUSA:** Variáveis de ambiente não configuradas no Vercel  
**TEMPO PARA RESOLVER:** 5-10 minutos

---

## 🔴 PROBLEMA IDENTIFICADO

```
POST https://cfydbvrzjtbcrbzimfjm.supabase.co/auth/v1/signup 500 (Internal Server Error)
```

O Supabase está configurado (`cfydbvrzjtbcrbzimfjm.supabase.co`) mas as **credenciais não estão no Vercel**.

---

## ✅ SOLUÇÃO RÁPIDA (10 MINUTOS)

### PASSO 1: Obter Credenciais do Supabase

1. **Acesse:** https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm

2. **Clique em:** ⚙️ Settings (menu lateral esquerdo)

3. **Clique em:** API (submenu)

4. **Copie as 4 credenciais:**

```bash
# Project URL
https://cfydbvrzjtbcrbzimfjm.supabase.co

# Project ID (está na URL)
cfydbvrzjtbcrbzimfjm

# anon/public key (começa com eyJhbGc...)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...

# service_role key (começa com eyJhbGc... - CUIDADO: É PRIVADA!)
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
```

⚠️ **IMPORTANTE:** Copie exatamente como aparecem (são MUITO LONGAS - ~300 caracteres cada)

---

### PASSO 2: Adicionar no Vercel

#### A. Acessar Dashboard Vercel
1. Acesse: https://vercel.com/dashboard
2. Clique no projeto: **snapdoor**
3. Clique em: **Settings** (menu superior)
4. Clique em: **Environment Variables** (menu lateral)

#### B. Adicionar Variáveis (TODAS obrigatórias)

**1. VITE_SUPABASE_PROJECT_ID**
```
Name:  VITE_SUPABASE_PROJECT_ID
Value: cfydbvrzjtbcrbzimfjm
Environments: ☑ Production ☑ Preview ☑ Development
```
Clicar: **Save**

**2. VITE_SUPABASE_URL**
```
Name:  VITE_SUPABASE_URL
Value: https://cfydbvrzjtbcrbzimfjm.supabase.co
Environments: ☑ Production ☑ Preview ☑ Development
```
Clicar: **Save**

**3. VITE_SUPABASE_PUBLISHABLE_KEY** (anon key)
```
Name:  VITE_SUPABASE_PUBLISHABLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (COLE A KEY COMPLETA)
Environments: ☑ Production ☑ Preview ☑ Development
```
Clicar: **Save**

**4. SUPABASE_SERVICE_ROLE_KEY** (service_role key)
```
Name:  SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (COLE A KEY COMPLETA)
Environments: ☑ Production ☑ Preview ☑ Development
```
Clicar: **Save**

---

### PASSO 3: Redeploy Imediato

**Opção A: Via Dashboard Vercel (RECOMENDADO)**
1. Ainda em Settings > Environment Variables
2. Clicar em: **Deployments** (menu superior)
3. Encontrar o último deploy (topo da lista)
4. Clicar nos 3 pontos **⋮**
5. Clicar em: **Redeploy**
6. ☑ Marcar: "Use existing Build Cache"
7. Clicar: **Redeploy**

**Opção B: Via Git Push (Alternativa)**
```bash
# Fazer qualquer commit (ex: espaço no README)
git commit --allow-empty -m "chore: Trigger redeploy após config env vars"
git push origin master
```

---

### PASSO 4: Aguardar Deploy (2-3 min)

1. Ir em: **Deployments** (menu superior)
2. Aguardar status mudar para: ✅ **Ready**
3. Copiar URL de produção: `https://snapdoor-xxx.vercel.app`

---

### PASSO 5: Testar Signup

1. Abrir URL de produção
2. Ir para: `/signup`
3. Preencher formulário:
   ```
   Email: teste@example.com
   Senha: Teste123!@#
   ```
4. Clicar: **Criar Conta**

**✅ DEVE FUNCIONAR:**
- Sem erro 500
- Redirecionar para `/dashboard`
- Usuário criado no Supabase

**❌ SE AINDA DER ERRO 500:**
- Verificar console browser (F12)
- Verificar se as 4 variáveis foram salvas corretamente
- Verificar se o redeploy foi feito
- Verificar logs Vercel: Deployments > [último deploy] > Build Logs

---

## 📋 CHECKLIST RÁPIDO

### Supabase (5 min)
- [ ] Acessei dashboard Supabase
- [ ] Copiei Project ID: `cfydbvrzjtbcrbzimfjm`
- [ ] Copiei Project URL: `https://cfydbvrzjtbcrbzimfjm.supabase.co`
- [ ] Copiei anon key (300+ chars)
- [ ] Copiei service_role key (300+ chars)

### Vercel (5 min)
- [ ] Acessei Settings > Environment Variables
- [ ] Adicionei `VITE_SUPABASE_PROJECT_ID`
- [ ] Adicionei `VITE_SUPABASE_URL`
- [ ] Adicionei `VITE_SUPABASE_PUBLISHABLE_KEY`
- [ ] Adicionei `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Todas marcadas: Production + Preview + Development
- [ ] Cliquei em Redeploy

### Validação (2 min)
- [ ] Deploy completou (status: Ready)
- [ ] Abri URL de produção
- [ ] Testei signup
- [ ] ✅ Signup funcionou (sem erro 500)

---

## 🔍 TROUBLESHOOTING

### Erro: "Invalid API key"
**Causa:** Key copiada incorretamente  
**Solução:**
1. Voltar ao Supabase Dashboard
2. Copiar novamente (clicar em "Copy" ao lado da key)
3. Colar no Vercel novamente
4. Garantir que copiou TODA a key (300+ chars)

### Erro: "Project not found"
**Causa:** Project ID incorreto  
**Solução:**
1. Verificar URL do Supabase: `https://[PROJECT_ID].supabase.co`
2. O ID é: `cfydbvrzjtbcrbzimfjm`
3. Verificar se digitou exatamente igual

### Erro: "CORS error"
**Causa:** URL incorreta ou redeploy não feito  
**Solução:**
1. Verificar `VITE_SUPABASE_URL` tem `https://` no começo
2. Fazer redeploy (Vercel não aplica env vars sem redeploy)

### Deploy ainda mostra erro 500
**Causa:** Cache do Vercel  
**Solução:**
1. Deployments > último deploy > ⋮ > Redeploy
2. **DESMARCAR** "Use existing Build Cache"
3. Aguardar rebuild completo (3-4 min)

---

## 🚀 VARIÁVEIS OPCIONAIS (Configurar Depois)

Estas NÃO são necessárias agora, mas serão na FASE 3 (Pagamentos):

### Stripe (FASE 3 - Pagamentos)
```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_...
STRIPE_PRICE_CREDITS_10=price_...
STRIPE_PRICE_CREDITS_50=price_...
STRIPE_PRICE_CREDITS_100=price_...
```

### Resend (FASE 2 - Emails)
```bash
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@snapdoor.com.br
RESEND_FROM_NAME=SnapDoor CRM
```

### Hunter.io (FASE 2 - Enriquecimento)
```bash
VITE_HUNTER_API_KEY=...
```

### Sentry (FASE 1 - Monitoramento)
```bash
VITE_SENTRY_DSN=https://...@o123456.ingest.sentry.io/7654321
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=snapdoor
SENTRY_AUTH_TOKEN=...
```

---

## 📖 DOCUMENTAÇÃO RELACIONADA

- `docs/SAAS_READY_CHECKLIST.md` - FASE 1: Configurações Técnicas
- `docs/POST_DEPLOY_VALIDATION.md` - Validação completa pós-deploy
- `.env.example` - Template de todas variáveis

---

## 🎯 RESUMO EXECUTIVO

**Problema:** Supabase retorna 500 porque Vercel não tem as credenciais  
**Solução:** Adicionar 4 variáveis no Vercel + Redeploy  
**Tempo:** 10 minutos  
**Prioridade:** 🔴 CRÍTICO (app não funciona sem isso)

---

**Após resolver isso, o signup vai funcionar e você poderá continuar a validação! 🚀**
