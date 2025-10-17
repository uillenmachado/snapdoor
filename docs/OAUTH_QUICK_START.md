# ⚡ Guia Rápido: OAuth2 Google em 5 Passos

## 🎯 Objetivo
Implementar login com Google e envio de emails via Gmail API (sem necessidade de domínio próprio).

---

## 📋 Passo 1: Google Cloud Console (15 min)

### 1.1 Criar Projeto
1. Acesse: https://console.cloud.google.com
2. Clique em **Criar Projeto**
3. Nome: `SnapDoor CRM`
4. Clique em **Criar**

### 1.2 Habilitar APIs
1. Menu lateral → **APIs e Serviços** → **Biblioteca**
2. Pesquise e habilite:
   - ✅ **Gmail API**
   - ✅ **Google People API**

### 1.3 Criar Credenciais OAuth 2.0
1. **APIs e Serviços** → **Credenciais**
2. Clique em **+ Criar Credenciais** → **ID do cliente OAuth**
3. Se solicitado, configure a **tela de consentimento OAuth**:
   - Tipo: **Externo**
   - Nome: `SnapDoor CRM`
   - Email de suporte: seu-email@gmail.com
   - Escopos: (adicione manualmente depois)
   - Salve

4. Volte para criar credenciais:
   - Tipo de aplicativo: **Aplicativo da Web**
   - Nome: `SnapDoor Web Client`
   - **URIs de redirecionamento autorizados**:
     ```
     http://localhost:8080/auth/v1/callback
     https://cfydbvrzjtbcrbzimfjm.supabase.co/auth/v1/callback
     ```
   - Clique em **Criar**

5. **IMPORTANTE**: Copie e salve:
   ```
   Client ID: xxx.apps.googleusercontent.com
   Client Secret: GOCSPX-xxx
   ```

### 1.4 Adicionar Escopos
1. **Tela de consentimento OAuth** → **Editar app**
2. **Escopos** → **Adicionar ou remover escopos**
3. Adicione manualmente:
   ```
   https://www.googleapis.com/auth/gmail.send
   https://www.googleapis.com/auth/gmail.readonly
   https://www.googleapis.com/auth/userinfo.email
   https://www.googleapis.com/auth/userinfo.profile
   ```
4. Salve

---

## 📋 Passo 2: Supabase Auth (5 min)

### 2.1 Habilitar Provider Google
1. Acesse: https://supabase.com/dashboard
2. Selecione projeto: **SnapDoor**
3. Menu lateral → **Authentication** → **Providers**
4. Encontre **Google** na lista
5. Clique em **Enable**
6. Cole as credenciais:
   - **Client ID**: (do passo 1.3)
   - **Client Secret**: (do passo 1.3)
7. Clique em **Save**

---

## 📋 Passo 3: Migração do Banco (2 min)

### 3.1 Aplicar SQL
1. Supabase Dashboard → **SQL Editor**
2. Clique em **New Query**
3. Cole:

```sql
ALTER TABLE public.email_integrations 
ADD COLUMN IF NOT EXISTS access_token TEXT,
ADD COLUMN IF NOT EXISTS refresh_token TEXT,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS oauth_scopes TEXT[];

COMMENT ON COLUMN public.email_integrations.access_token IS 'Token de acesso OAuth2 (criptografado)';
COMMENT ON COLUMN public.email_integrations.refresh_token IS 'Token de refresh OAuth2 (criptografado)';
COMMENT ON COLUMN public.email_integrations.token_expires_at IS 'Data de expiração do access_token';
COMMENT ON COLUMN public.email_integrations.oauth_scopes IS 'Escopos autorizados pelo usuário';
```

4. Clique em **RUN** (Ctrl+Enter)
5. Aguarde mensagem: ✅ **Success. No rows returned**

### 3.2 Regenerar Tipos
No terminal do projeto:
```bash
npx supabase gen types typescript --project-id cfydbvrzjtbcrbzimfjm > src/integrations/supabase/types.ts
```

---

## 📋 Passo 4: Variáveis de Ambiente (2 min)

### 4.1 Configurar Secrets
1. Supabase Dashboard → **Settings** → **Edge Functions**
2. Role até **Environment Variables**
3. Adicione as duas variáveis:

**Variável 1:**
- Name: `GOOGLE_CLIENT_ID`
- Value: `xxx.apps.googleusercontent.com` (do passo 1.3)
- Clique em **Add**

**Variável 2:**
- Name: `GOOGLE_CLIENT_SECRET`
- Value: `GOCSPX-xxx` (do passo 1.3)
- Clique em **Add**

4. Clique em **Save** (canto superior direito)

---

## 📋 Passo 5: Deploy Edge Function (1 min)

### 5.1 Deploy
No terminal do projeto:
```bash
npx supabase functions deploy send-email-gmail
```

Aguarde mensagem:
```
✅ Deployed Functions on project cfydbvrzjtbcrbzimfjm:
   - send-email-gmail (xxx ms)
```

---

## 🧪 Teste Final (2 min)

### 1. Teste de Login
1. Faça logout da aplicação
2. Vá para `http://localhost:8080/login`
3. Clique em **Continuar com Google**
4. Selecione sua conta Google
5. **IMPORTANTE**: Clique em **Permitir** quando solicitar permissões do Gmail
6. Você deve ser redirecionado para `/dashboard`
7. Procure toast verde: ✅ **Gmail conectado com sucesso!**

### 2. Verificar Integração
No SQL Editor do Supabase:
```sql
SELECT email, provider, is_active, oauth_scopes
FROM email_integrations
WHERE user_id = auth.uid();
```

Resultado esperado:
```
email: seu-email@gmail.com
provider: gmail
is_active: true
oauth_scopes: {gmail.send, gmail.readonly}
```

### 3. Teste de Email
1. Abra qualquer deal
2. Clique no botão de email (ícone de envelope)
3. Verifique badge: 📧 **Enviando como: seu-email@gmail.com**
4. Preencha:
   - **Para**: seu-email-teste@gmail.com
   - **Assunto**: Teste OAuth2
   - **Mensagem**: Este email foi enviado via Gmail API!
5. Clique em **Enviar**
6. Aguarde toast: ✅ **Email enviado com sucesso**
7. Verifique sua caixa de entrada (pode levar 1-2 minutos)

---

## ✅ Checklist Completo

### Google Cloud
- [ ] Projeto criado
- [ ] Gmail API habilitada
- [ ] Google People API habilitada
- [ ] Credenciais OAuth criadas
- [ ] URIs de redirecionamento configurados
- [ ] Escopos adicionados
- [ ] Client ID e Secret copiados

### Supabase
- [ ] Provider Google habilitado
- [ ] Client ID configurado
- [ ] Client Secret configurado
- [ ] Migração SQL executada
- [ ] Tipos TypeScript regenerados
- [ ] Variáveis de ambiente configuradas (GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET)

### Deploy
- [ ] Edge Function send-email-gmail deployed

### Testes
- [ ] Login com Google funcionando
- [ ] Integração salva no banco
- [ ] Email enviado e recebido

---

## 🆘 Problemas Comuns

### ❌ "Error 400: redirect_uri_mismatch"
**Solução**: Verifique URIs de redirecionamento no Google Cloud Console.
Devem ser exatamente:
```
http://localhost:8080/auth/v1/callback
https://cfydbvrzjtbcrbzimfjm.supabase.co/auth/v1/callback
```

### ❌ "Gmail não conectado"
**Solução**: 
1. Refaça o login com Google
2. Certifique-se de clicar em "Permitir" nas permissões do Gmail

### ❌ "Token expirado"
**Solução**:
1. Verifique se `GOOGLE_CLIENT_SECRET` está configurado nas Edge Functions
2. Refaça login com Google

### ❌ Email não chega
**Solução**:
1. Aguarde 2-3 minutos (pode haver delay)
2. Verifique pasta de spam
3. Veja logs: Supabase Dashboard → Edge Functions → Logs

### ❌ "API não habilitada"
**Solução**:
1. Google Cloud Console → APIs e Serviços → Biblioteca
2. Pesquise "Gmail API" e clique em "Habilitar"
3. Aguarde 5 minutos para propagação

---

## 📞 Suporte

Se encontrar problemas:
1. Veja logs detalhados: Supabase Dashboard → Edge Functions → Logs → `send-email-gmail`
2. Veja console do navegador (F12)
3. Consulte `docs/OAUTH_IMPLEMENTATION_STATUS.md` para detalhes técnicos

---

## 🎉 Pronto!

Agora sua aplicação:
- ✅ Permite login com conta Google
- ✅ Envia emails via Gmail (sem domínio próprio)
- ✅ Tokens renovam automaticamente
- ✅ Histórico de atividades registrado

**Tempo total estimado**: 25-30 minutos
