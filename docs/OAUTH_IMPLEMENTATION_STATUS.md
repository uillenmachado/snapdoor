# 🚀 Implementação OAuth2 Google - Status

## ✅ Concluído

### 1. **Migração do Banco de Dados**
- ✅ Criada migração `20251017143000_add_oauth_fields_to_email_integrations.sql`
- ✅ Adicionados campos OAuth2:
  - `access_token` TEXT
  - `refresh_token` TEXT
  - `token_expires_at` TIMESTAMPTZ
  - `oauth_scopes` TEXT[]
- 📝 **Ação necessária**: Aplicar migração via SQL Editor (veja `OAUTH_MIGRATION_MANUAL.md`)

### 2. **Hook OAuth Callback** (`useOAuthCallback.ts`)
- ✅ Monitora autenticações via Google OAuth
- ✅ Salva tokens automaticamente na tabela `email_integrations`
- ✅ Atualiza tokens existentes ou cria nova integração
- ✅ Feedback via toast notificações
- ✅ Integrado ao `App.tsx` (executa globalmente)

### 3. **Atualização do Login** (`Login.tsx`)
- ✅ Solicitação de escopos Gmail no OAuth:
  - `https://www.googleapis.com/auth/gmail.send`
  - `https://www.googleapis.com/auth/gmail.readonly`
- ✅ Parâmetros OAuth corretos:
  - `access_type: offline` (para receber refresh_token)
  - `prompt: consent` (força tela de consentimento)

### 4. **Edge Function Gmail API** (`send-email-gmail/index.ts`)
- ✅ Envia emails via Gmail API usando OAuth2
- ✅ Validação de token (verifica expiração)
- ✅ Refresh automático de tokens expirados
- ✅ Formato RFC 2822 correto
- ✅ Codificação base64url
- ✅ Registro de atividades
- ✅ Atualiza `last_used_at`
- ✅ Tratamento de erros robusto

### 5. **EmailComposer Inteligente**
- ✅ Detecta provider automaticamente (Gmail ou Resend)
- ✅ Invoca Edge Function correta baseada no provider:
  - `send-email-gmail` para OAuth2 Google
  - `send-email` para Resend/Sistema
- ✅ Logs detalhados

---

## ⏳ Pendente (Ações do Usuário)

### 1. **Configurar Google Cloud Console** 🔴 CRÍTICO
Siga as instruções em `docs/GOOGLE_OAUTH_SETUP.md`:

1. Criar projeto no Google Cloud Console
2. Habilitar APIs:
   - Gmail API
   - Google People API
3. Criar credenciais OAuth 2.0
4. Configurar tela de consentimento
5. Adicionar redirect URIs:
   ```
   http://localhost:8080/auth/callback
   https://snapdoor.com/auth/callback
   ```
6. Adicionar escopos:
   ```
   https://www.googleapis.com/auth/gmail.send
   https://www.googleapis.com/auth/gmail.readonly
   https://www.googleapis.com/auth/userinfo.email
   https://www.googleapis.com/auth/userinfo.profile
   ```

**Resultado esperado:**
```
Client ID: xxx.apps.googleusercontent.com
Client Secret: GOCSPX-xxx
```

### 2. **Habilitar Google Auth no Supabase** 🔴 CRÍTICO
1. Abra Supabase Dashboard → Authentication → Providers
2. Encontre "Google"
3. Clique em "Enable"
4. Cole:
   - **Client ID**: (do passo anterior)
   - **Client Secret**: (do passo anterior)
5. Salve

### 3. **Aplicar Migração OAuth2** 🔴 CRÍTICO
Siga as instruções em `docs/OAUTH_MIGRATION_MANUAL.md`:

1. Supabase Dashboard → SQL Editor
2. Cole o SQL da migração
3. Execute (RUN)
4. Regenere tipos TypeScript:
   ```bash
   npx supabase gen types typescript --project-id cfydbvrzjtbcrbzimfjm > src/integrations/supabase/types.ts
   ```

### 4. **Configurar Variáveis de Ambiente** 🔴 CRÍTICO
No Supabase Dashboard → Settings → Edge Functions → Secrets:

Adicione:
```
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
```

### 5. **Deploy Edge Function Gmail** 🔴 CRÍTICO
```bash
npx supabase functions deploy send-email-gmail
```

---

## 🧪 Como Testar

### 1. **Teste de Login OAuth**
1. Faça logout da aplicação
2. Vá para `/login`
3. Clique em "Continuar com Google"
4. Autorize os escopos solicitados
5. Você deve ser redirecionado para `/dashboard`
6. Verifique toast: "Gmail conectado com sucesso!"

### 2. **Verificar Integração Salva**
```sql
SELECT 
  email, 
  provider, 
  is_active, 
  is_verified,
  oauth_scopes,
  token_expires_at
FROM email_integrations
WHERE user_id = auth.uid();
```

Resultado esperado:
```
email: seu-email@gmail.com
provider: gmail
is_active: true
is_verified: true
oauth_scopes: {gmail.send, gmail.readonly}
token_expires_at: [data futura]
```

### 3. **Teste de Envio de Email**
1. Abra um deal
2. Clique no botão de email
3. Badge deve mostrar: "📧 Enviando como: seu-email@gmail.com"
4. Preencha destinatário, assunto e mensagem
5. Clique em "Enviar"
6. Verifique:
   - Toast de sucesso
   - Email recebido na caixa de entrada do destinatário
   - Atividade registrada no histórico do deal

### 4. **Teste de Refresh Token**
Para forçar refresh (apenas desenvolvimento):
```sql
UPDATE email_integrations
SET token_expires_at = now() - interval '1 hour'
WHERE user_id = auth.uid();
```

Envie um email novamente. Logs devem mostrar:
```
🔄 Token expirado, renovando...
✅ Token renovado com sucesso
```

---

## 📊 Arquitetura Implementada

```
┌─────────────┐
│   Usuário   │
│   (Login)   │
└──────┬──────┘
       │
       │ 1. Clica "Continuar com Google"
       ↓
┌─────────────────┐
│  Supabase Auth  │
│  (OAuth2 Flow)  │
└────────┬────────┘
         │
         │ 2. Redireciona para Google
         │    (solicita escopos Gmail)
         ↓
┌──────────────────┐
│  Google OAuth2   │
│  Consent Screen  │
└────────┬─────────┘
         │
         │ 3. Usuário autoriza
         ↓
┌─────────────────┐
│  useOAuthCallback│
│   (Hook React)  │
└────────┬────────┘
         │
         │ 4. Detecta SIGNED_IN event
         │    Salva tokens no banco
         ↓
┌──────────────────────┐
│ email_integrations   │
│  (Supabase Table)    │
│ - access_token       │
│ - refresh_token      │
│ - token_expires_at   │
└──────────────────────┘
         │
         │ 5. Usuário envia email
         ↓
┌──────────────────┐
│  EmailComposer   │
│  (Detect Gmail)  │
└────────┬─────────┘
         │
         │ 6. Invoca send-email-gmail
         ↓
┌────────────────────────┐
│  Edge Function Gmail   │
│  (Gmail API)           │
│ 1. Busca tokens        │
│ 2. Verifica expiração  │
│ 3. Refresh se necessário│
│ 4. Envia via Gmail API │
│ 5. Salva atividade     │
└────────────────────────┘
         │
         │ 7. Email enviado!
         ↓
┌──────────────────┐
│  Destinatário    │
│  (Gmail Inbox)   │
└──────────────────┘
```

---

## 🔒 Segurança

### ✅ Implementado
- Tokens armazenados no Supabase (PostgreSQL criptografado)
- RLS (Row Level Security) habilitado
- Tokens nunca expostos ao frontend
- Edge Functions com autenticação obrigatória
- CORS configurado corretamente

### 🔄 Recomendações Futuras
- [ ] Criptografar tokens com KMS (Key Management Service)
- [ ] Implementar rotação automática de tokens
- [ ] Adicionar 2FA opcional
- [ ] Monitorar uso de API (rate limiting)
- [ ] Logs de auditoria para envios

---

## 📈 Próximos Passos (Pós-MVP)

### 1. **Suporte a Microsoft Outlook/365**
- Implementar OAuth2 para Microsoft
- Edge Function `send-email-outlook`
- Suporte a Exchange Online

### 2. **Melhorias UI**
- Status de conexão em tempo real
- Botão "Reconectar" se token inválido
- Indicador de quota Gmail (limite diário)
- Preview de email antes de enviar

### 3. **Recursos Avançados**
- Agendamento de emails
- Templates personalizados
- Assinaturas de email
- Tracking de aberturas/cliques
- Anexos (arquivos)

### 4. **Automações**
- Sequências de follow-up
- Respostas automáticas
- IA para sugestões de assunto
- Auto-resposta para leads quentes

---

## 🆘 Troubleshooting

### Erro: "Gmail não conectado"
- Verifique se a integração está ativa: `SELECT * FROM email_integrations WHERE user_id = auth.uid()`
- Refaça o login com Google

### Erro: "Token expirado"
- Verifique se `GOOGLE_CLIENT_SECRET` está configurado nas Edge Functions
- Tente reconectar a conta do Google

### Erro: "API não habilitada"
- Verifique se Gmail API está habilitada no Google Cloud Console
- Aguarde até 5 minutos para propagação

### Email não chega
- Verifique pasta de spam
- Confirme que o Gmail tem permissões corretas
- Verifique logs da Edge Function: Supabase Dashboard → Edge Functions → Logs

---

## 📚 Documentação Relacionada

- `docs/GOOGLE_OAUTH_SETUP.md` - Setup completo Google Cloud
- `docs/OAUTH_MIGRATION_MANUAL.md` - Instruções de migração
- `docs/CREDIT_SYSTEM_GUIDE.md` - Sistema de créditos
- `docs/LEAD_ENRICHMENT_GUIDE.md` - Enriquecimento de leads

---

## ✅ Checklist de Implementação

- [x] Migração OAuth2 criada
- [x] Hook useOAuthCallback implementado
- [x] Login.tsx atualizado com escopos
- [x] Edge Function send-email-gmail criada
- [x] EmailComposer com detecção automática
- [x] App.tsx com hook global
- [ ] **Migração aplicada no banco** 🔴 PENDENTE
- [ ] **Google Cloud configurado** 🔴 PENDENTE
- [ ] **Supabase Auth habilitado** 🔴 PENDENTE
- [ ] **Variáveis de ambiente configuradas** 🔴 PENDENTE
- [ ] **Edge Function deployed** 🔴 PENDENTE
- [ ] **Teste completo realizado** 🔴 PENDENTE

---

**Status Geral**: ⚠️ **80% Completo - Aguardando Configurações Externas**

Todos os componentes de código estão prontos. As etapas pendentes são apenas configurações em serviços externos (Google Cloud e Supabase Dashboard).
