# 🔐 GitHub Secrets Configuration Guide

> Guia rápido para configurar secrets do GitHub para CI/CD automático

## 📋 Secrets Necessários

Para que o pipeline de CI/CD funcione completamente, você precisa configurar **7 secrets** no GitHub:

### 1. Vercel (Deploy) - 3 secrets

| Secret | Descrição | Onde obter |
|--------|-----------|-----------|
| `VERCEL_TOKEN` | Token de autenticação da Vercel | [vercel.com/account/tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | ID da organização Vercel | Projeto > Settings > General |
| `VERCEL_PROJECT_ID` | ID do projeto Vercel | Projeto > Settings > General |

### 2. Sentry (Monitoring) - 4 secrets

| Secret | Descrição | Onde obter |
|--------|-----------|-----------|
| `VITE_SENTRY_DSN` | DSN do projeto Sentry | [sentry.io/settings/projects/](https://sentry.io/settings/projects/) |
| `SENTRY_ORG` | Slug da organização Sentry | Geralmente seu nome de usuário |
| `SENTRY_PROJECT` | Nome do projeto Sentry | Ex: `snapdoor-crm` |
| `SENTRY_AUTH_TOKEN` | Token de autenticação | [sentry.io/settings/auth-tokens/](https://sentry.io/settings/auth-tokens/) |

### 3. Codecov (Coverage) - 1 secret (opcional)

| Secret | Descrição | Onde obter |
|--------|-----------|-----------|
| `CODECOV_TOKEN` | Token do Codecov | [codecov.io](https://codecov.io) após vincular repo |

---

## 🚀 Passo a Passo

### 1. Obter Token da Vercel

1. Acesse [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Clique em **"Create Token"**
3. Preencha:
   - **Token Name**: `SnapDoor CI/CD`
   - **Scope**: `Full Account`
   - **Expiration**: `No Expiration` (ou 1 ano)
4. Clique em **"Create"**
5. 📋 **Copie o token** (começa com `vercel_...`)

### 2. Obter IDs do Projeto Vercel

#### Opção A: Via Dashboard (Recomendado)

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto **snapdoor**
3. Vá para **Settings > General**
4. Role até **"Project ID"** e copie
5. Role até **"Organization ID"** e copie

#### Opção B: Via CLI

```bash
# Instale Vercel CLI (se ainda não tem)
npm i -g vercel

# Faça login
vercel login

# Vá para a pasta do projeto
cd C:\Users\Uillen Machado\Documents\Meus projetos\snapdoor

# Link o projeto
vercel link

# Copie os IDs do arquivo .vercel/project.json
cat .vercel/project.json
```

### 3. Obter Credenciais do Sentry

1. **DSN**:
   - Vá para [sentry.io](https://sentry.io)
   - Selecione seu projeto
   - Clique em **Settings > Client Keys (DSN)**
   - Copie o DSN (formato: `https://...@o123456.ingest.sentry.io/7654321`)

2. **Organization Slug**:
   - Na URL do Sentry: `https://sentry.io/organizations/SEU-ORG-SLUG/`
   - Copie o valor entre `/organizations/` e o próximo `/`

3. **Project Name**:
   - O nome que você deu ao criar o projeto (ex: `snapdoor-crm`)

4. **Auth Token**:
   - Vá para [sentry.io/settings/auth-tokens/](https://sentry.io/settings/auth-tokens/)
   - Clique em **"Create New Token"**
   - Preencha:
     - **Name**: `SnapDoor CI/CD`
     - **Scopes**: Marque `project:releases`, `project:write`, `org:read`
   - Clique em **"Create Token"**
   - 📋 **Copie o token** (começa com `sntrys_...`)

### 4. Adicionar Secrets no GitHub

1. Acesse seu repositório: `https://github.com/uillenmachado/snapdoor`
2. Clique em **"Settings"** (aba superior direita)
3. No menu lateral esquerdo, clique em **"Secrets and variables" > "Actions"**
4. Clique em **"New repository secret"**

**Adicione cada secret individualmente**:

#### Secret 1: VERCEL_TOKEN
```
Name: VERCEL_TOKEN
Secret: vercel_abc123def456...
```

#### Secret 2: VERCEL_ORG_ID
```
Name: VERCEL_ORG_ID
Secret: team_abc123def456
```

#### Secret 3: VERCEL_PROJECT_ID
```
Name: VERCEL_PROJECT_ID
Secret: prj_abc123def456
```

#### Secret 4: VITE_SENTRY_DSN
```
Name: VITE_SENTRY_DSN
Secret: https://abc123@o456.ingest.sentry.io/789
```

#### Secret 5: SENTRY_ORG
```
Name: SENTRY_ORG
Secret: uillenmachado
```

#### Secret 6: SENTRY_PROJECT
```
Name: SENTRY_PROJECT
Secret: snapdoor-crm
```

#### Secret 7: SENTRY_AUTH_TOKEN
```
Name: SENTRY_AUTH_TOKEN
Secret: sntrys_abc123def456...
```

#### Secret 8: CODECOV_TOKEN (opcional)
```
Name: CODECOV_TOKEN
Secret: abc123-def456-ghi789
```

### 5. Verificar Secrets

Após adicionar todos, você deve ver **7-8 secrets** na lista:

- ✅ `CODECOV_TOKEN` (opcional)
- ✅ `SENTRY_AUTH_TOKEN`
- ✅ `SENTRY_ORG`
- ✅ `SENTRY_PROJECT`
- ✅ `VERCEL_ORG_ID`
- ✅ `VERCEL_PROJECT_ID`
- ✅ `VERCEL_TOKEN`
- ✅ `VITE_SENTRY_DSN`

---

## ✅ Testar CI/CD

### 1. Fazer um Commit

```bash
# Edite qualquer arquivo (ex: README.md)
echo "# Teste CI/CD" >> README.md

# Commit e push
git add README.md
git commit -m "test: testar pipeline CI/CD"
git push origin master
```

### 2. Verificar GitHub Actions

1. Vá para seu repositório no GitHub
2. Clique na aba **"Actions"**
3. Você verá o workflow **"CI/CD Pipeline"** rodando
4. Aguarde os 4 jobs:
   - ✅ **lint**: ~30 segundos
   - ✅ **build**: ~1 minuto
   - ✅ **test**: ~1 minuto
   - ✅ **deploy**: ~2 minutos

### 3. Verificar Deploy na Vercel

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto **snapdoor**
3. Veja a lista de deployments
4. O último deploy deve estar com status **"Ready"** ✅
5. Clique no deploy e depois em **"Visit"** para testar

### 4. Verificar Sentry

1. Acesse [sentry.io](https://sentry.io)
2. Selecione seu projeto **snapdoor-crm**
3. Vá para **Releases**
4. Você deve ver a release com o hash do commit
5. Source maps devem estar uploaded ✅

---

## 🔧 Troubleshooting

### Erro: "Invalid Vercel token"

**Solução**: Token expirou ou foi revogado. Gere um novo em [vercel.com/account/tokens](https://vercel.com/account/tokens) e atualize o secret.

### Erro: "Project not found"

**Solução**: `VERCEL_PROJECT_ID` ou `VERCEL_ORG_ID` incorretos. Verifique em **Vercel > Settings > General**.

### Erro: "Sentry auth failed"

**Solução**: 
1. Verifique se `SENTRY_AUTH_TOKEN` está correto
2. Confirme que o token tem os scopes: `project:releases`, `project:write`, `org:read`
3. Gere novo token se necessário: [sentry.io/settings/auth-tokens/](https://sentry.io/settings/auth-tokens/)

### Source maps não aparecem no Sentry

**Solução**:
1. Aguarde 1-2 minutos (processamento)
2. Verifique se `SENTRY_AUTH_TOKEN` está configurado
3. Confirme que `sourcemap: true` está em `vite.config.ts`
4. Veja logs do GitHub Actions job "deploy" para erros

### Deploy funciona mas Sentry não rastreia erros

**Solução**:
1. Verifique se `VITE_SENTRY_DSN` está configurado como **Environment Variable** na Vercel:
   - Vá para **Vercel > Settings > Environment Variables**
   - Adicione: `VITE_SENTRY_DSN` = `https://...`
   - Redeploy: `vercel --prod`
2. Abra console do navegador e procure por `[Sentry] Inicializado`
3. Force um erro de teste e aguarde 30 segundos

---

## 🔒 Segurança

### ⚠️ Nunca commite secrets no código!

- ❌ **Errado**: `VITE_SENTRY_DSN="https://..." # no código`
- ✅ **Certo**: `VITE_SENTRY_DSN="https://..." # no GitHub Secrets`

### 🔄 Rotacionar secrets regularmente

- Tokens de API devem ser rotacionados a cada 3-6 meses
- Se um token vazar, revogue imediatamente e gere novo

### 👁️ Revisar permissões

- Tokens devem ter apenas as permissões necessárias
- Ex: Vercel token pode ser `Deploy` em vez de `Full Account`

---

## 📚 Referências

- [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel CLI](https://vercel.com/docs/cli)
- [Sentry Auth Tokens](https://docs.sentry.io/api/auth/)
- [Codecov GitHub Action](https://github.com/codecov/codecov-action)

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0
