# 🔐 Configuração OAuth2 do Google

## Objetivo
Permitir login com Google e envio de emails via Gmail API

---

## 📋 Passo a Passo

### 1. Criar Projeto no Google Cloud Console

1. Acesse: https://console.cloud.google.com/
2. Clique em **"Create Project"** (ou selecione projeto existente)
3. Nome do projeto: **SnapDoor CRM**
4. Clique em **"Create"**

---

### 2. Ativar APIs Necessárias

#### 2.1 Google+ API (para login)
1. No menu lateral, vá em **"APIs & Services"** → **"Library"**
2. Procure por: **"Google+ API"**
3. Clique em **"Enable"**

#### 2.2 Gmail API (para envio de emails)
1. Na mesma biblioteca, procure por: **"Gmail API"**
2. Clique em **"Enable"**

---

### 3. Criar OAuth2 Client ID

1. No menu lateral, vá em **"APIs & Services"** → **"Credentials"**
2. Clique em **"+ Create Credentials"** → **"OAuth client ID"**
3. Se aparecer aviso sobre OAuth consent screen, clique em **"Configure Consent Screen"**

#### 3.1 Configurar OAuth Consent Screen
1. User Type: **External** (para permitir qualquer usuário Google)
2. Clique em **"Create"**
3. Preencha:
   - **App name**: SnapDoor CRM
   - **User support email**: uillenmachado@gmail.com
   - **Developer contact**: uillenmachado@gmail.com
4. Clique em **"Save and Continue"**

#### 3.2 Adicionar Scopes
1. Clique em **"Add or Remove Scopes"**
2. Adicione os seguintes scopes:
   ```
   https://www.googleapis.com/auth/userinfo.email
   https://www.googleapis.com/auth/userinfo.profile
   https://www.googleapis.com/auth/gmail.send
   https://www.googleapis.com/auth/gmail.compose
   ```
3. Clique em **"Update"** e depois **"Save and Continue"**

#### 3.3 Adicionar Test Users (Modo Development)
1. Clique em **"Add Users"**
2. Adicione: `uillenmachado@gmail.com`
3. Clique em **"Save and Continue"**

#### 3.4 Criar Client ID
1. Volte para **"Credentials"**
2. Clique em **"+ Create Credentials"** → **"OAuth client ID"**
3. Application type: **Web application**
4. Name: **SnapDoor CRM Web**
5. **Authorized JavaScript origins**:
   ```
   http://localhost:8080
   http://localhost:5173
   https://seu-dominio.com
   ```
6. **Authorized redirect URIs**:
   ```
   http://localhost:8080/auth/callback
   http://localhost:5173/auth/callback
   https://seu-dominio.com/auth/callback
   ```
7. Clique em **"Create"**

#### 3.5 Copiar Credenciais
1. Após criar, aparecerá um modal com:
   - **Client ID**: `123456789-abcdefg.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxxxxxxxxxxxxxxx`
2. **COPIE AMBOS** - vamos usar nas próximas etapas

---

### 4. Configurar Variáveis de Ambiente

Adicione ao `.env.local`:

```env
# Google OAuth2
VITE_GOOGLE_CLIENT_ID=seu-client-id-aqui.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret-aqui
```

E no Supabase (Secrets):
```bash
npx supabase secrets set GOOGLE_CLIENT_ID="seu-client-id-aqui.apps.googleusercontent.com"
npx supabase secrets set GOOGLE_CLIENT_SECRET="seu-client-secret-aqui"
```

---

### 5. Publicar App (Quando Estiver Pronto)

Quando o app estiver em produção:

1. Volte ao **OAuth consent screen**
2. Clique em **"Publish App"**
3. Aguarde aprovação do Google (pode levar alguns dias)

**Até lá**, funciona em modo teste com até 100 usuários.

---

## 🎯 Próximos Passos

Depois de configurar:
1. ✅ Implemente o botão "Login com Google"
2. ✅ Configure integração de email com Gmail
3. ✅ Teste com sua conta
4. ✅ Adicione mais test users conforme necessário

---

## 📚 Links Úteis

- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth2 Playground](https://developers.google.com/oauthplayground/)
- [Gmail API Documentation](https://developers.google.com/gmail/api)
- [Google Sign-In Guide](https://developers.google.com/identity/sign-in/web)
