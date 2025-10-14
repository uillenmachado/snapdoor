# 🔍 Sentry Setup Guide - SnapDoor CRM

> Guia completo para configurar o Sentry para monitoramento de erros em produção

## 📑 Índice

1. [O que é Sentry?](#o-que-é-sentry)
2. [Criar Conta e Projeto](#criar-conta-e-projeto)
3. [Configurar Variáveis de Ambiente](#configurar-variáveis-de-ambiente)
4. [Configurar GitHub Secrets](#configurar-github-secrets)
5. [Testar Integração](#testar-integração)
6. [Usar no Código](#usar-no-código)
7. [Dashboards e Alertas](#dashboards-e-alertas)

---

## 🤔 O que é Sentry?

**Sentry** é uma plataforma de monitoramento de erros que captura, rastreia e alerta sobre problemas em produção em tempo real.

### Recursos do SnapDoor + Sentry

✅ **Error Tracking**: Captura exceções JavaScript automaticamente  
✅ **Performance Monitoring**: Mede tempo de carregamento de páginas e APIs  
✅ **Session Replay**: Grava sessões de usuários que encontraram erros (vídeo)  
✅ **Breadcrumbs**: Histórico de ações do usuário antes do erro  
✅ **Source Maps**: Exibe código original (TypeScript) em vez de minificado  
✅ **Alerts**: Notificações por email/Slack quando erros ocorrem  
✅ **Release Tracking**: Compara erros entre versões do app

---

## 🆕 Criar Conta e Projeto

### 1. Criar Conta no Sentry

1. Acesse [sentry.io](https://sentry.io/signup/)
2. Clique em **"Sign Up"**
3. Escolha plano:
   - **Developer** (Free): 5K eventos/mês, 1 projeto
   - **Team** ($26/mês): 50K eventos/mês, 10 projetos
   - **Business** (custom): Ilimitado

> **Recomendação**: Comece com o plano **Free** (suficiente para desenvolvimento)

### 2. Criar Organização

1. Após login, clique em **"Create Organization"**
2. Preencha:
   - **Organization Name**: `SnapDoor` (ou seu nome)
   - **Slug**: `snapdoor` (será usado nas URLs)
3. Clique em **"Create Organization"**

### 3. Criar Projeto

1. No dashboard, clique em **"Create Project"**
2. Selecione plataforma: **React**
3. Preencha:
   - **Project Name**: `snapdoor-crm`
   - **Set Alert**: Marque "Alert me on every new issue"
4. Clique em **"Create Project"**

### 4. Copiar DSN

Após criar o projeto, você verá a tela de configuração com o **DSN** (Data Source Name):

```
https://abc123def456@o123456.ingest.sentry.io/7654321
```

📋 **Copie esse DSN** - você precisará dele no `.env`

---

## ⚙️ Configurar Variáveis de Ambiente

### 1. Criar arquivo `.env`

Copie o template:

```bash
cp .env.example .env
```

### 2. Adicionar credenciais do Sentry

Edite o `.env` e adicione:

```bash
# ============================================
# SENTRY MONITORING (OPTIONAL - PRODUCTION)
# ============================================
VITE_SENTRY_DSN="https://abc123def456@o123456.ingest.sentry.io/7654321"
SENTRY_ORG="snapdoor"
SENTRY_PROJECT="snapdoor-crm"
SENTRY_AUTH_TOKEN="seu-auth-token-aqui"
```

### 3. Obter Auth Token (para upload de source maps)

1. Vá para [sentry.io/settings/auth-tokens/](https://sentry.io/settings/auth-tokens/)
2. Clique em **"Create New Token"**
3. Preencha:
   - **Name**: `SnapDoor CI/CD`
   - **Scopes**: Marque:
     - ✅ `project:releases`
     - ✅ `project:write`
     - ✅ `org:read`
4. Clique em **"Create Token"**
5. 📋 **Copie o token** e adicione ao `.env`:

```bash
SENTRY_AUTH_TOKEN="sntrys_abc123def456..."
```

---

## 🔒 Configurar GitHub Secrets

Para que o CI/CD faça upload de source maps automaticamente, adicione os secrets no GitHub.

### 1. Acessar Configurações do Repositório

1. Vá para seu repositório: `https://github.com/uillenmachado/snapdoor`
2. Clique em **"Settings"** (aba superior)
3. No menu lateral, clique em **"Secrets and variables" > "Actions"**

### 2. Adicionar Secrets

Clique em **"New repository secret"** e adicione cada um:

#### Secret 1: SENTRY_DSN

```
Name: SENTRY_DSN
Value: https://abc123def456@o123456.ingest.sentry.io/7654321
```

#### Secret 2: SENTRY_ORG

```
Name: SENTRY_ORG
Value: snapdoor
```

#### Secret 3: SENTRY_PROJECT

```
Name: SENTRY_PROJECT
Value: snapdoor-crm
```

#### Secret 4: SENTRY_AUTH_TOKEN

```
Name: SENTRY_AUTH_TOKEN
Value: sntrys_abc123def456...
```

### 3. Verificar Secrets

No final, você deve ter **4 secrets** relacionados ao Sentry:

- ✅ `SENTRY_DSN`
- ✅ `SENTRY_ORG`
- ✅ `SENTRY_PROJECT`
- ✅ `SENTRY_AUTH_TOKEN`

---

## ✅ Testar Integração

### 1. Testar Localmente

Execute o projeto em modo de desenvolvimento:

```bash
npm run dev
```

Abra o console do navegador e procure:

```
[Sentry] Inicializado em ambiente: development
```

### 2. Forçar um Erro de Teste

Adicione temporariamente em qualquer componente:

```tsx
// Apenas para teste - REMOVER depois
useEffect(() => {
  throw new Error('Teste Sentry - Erro intencional');
}, []);
```

Recarregue a página. O erro deve aparecer no dashboard do Sentry em ~30 segundos.

### 3. Verificar no Dashboard

1. Vá para [sentry.io](https://sentry.io)
2. Selecione seu projeto **snapdoor-crm**
3. Clique em **"Issues"**
4. Você deve ver o erro `Teste Sentry - Erro intencional`

### 4. Limpar Teste

Remova o código de teste e marque o erro como **Resolved** no Sentry.

---

## 💻 Usar no Código

### 1. Capturar Erro Manualmente

```typescript
import { captureError } from '@/lib/sentry';

try {
  await enrichLead(leadId);
} catch (error) {
  captureError(error as Error, {
    leadId,
    action: 'enrich_lead',
  });
  toast.error('Erro ao enriquecer lead');
}
```

### 2. Definir Usuário (após login)

```typescript
import { setSentryUser } from '@/lib/sentry';

const handleLogin = async (email: string, password: string) => {
  const { user } = await signIn(email, password);
  
  setSentryUser({
    id: user.id,
    email: user.email,
    username: user.full_name,
  });
};
```

### 3. Limpar Usuário (logout)

```typescript
import { clearSentryUser } from '@/lib/sentry';

const handleLogout = async () => {
  await signOut();
  clearSentryUser();
};
```

### 4. Adicionar Contexto Customizado

```typescript
import { setSentryContext } from '@/lib/sentry';

// Antes de operação crítica
setSentryContext('lead_enrichment', {
  provider: 'hunter.io',
  credits_available: 50,
  plan: 'pro',
});

await enrichLead(leadId);
```

### 5. Adicionar Tags para Filtros

```typescript
import { setSentryTag } from '@/lib/sentry';

setSentryTag('feature', 'lead_enrichment');
setSentryTag('user_plan', 'pro');
```

### 6. Capturar Mensagem (não erro)

```typescript
import { captureMessage } from '@/lib/sentry';

// Evento importante mas não erro
captureMessage('Usuário atingiu limite de créditos', 'warning');
```

### 7. Performance Monitoring

```typescript
import { startTransaction } from '@/lib/sentry';

const transaction = startTransaction('load_dashboard', 'pageload');

// Operação pesada
await loadLeads();
await loadDeals();
await loadActivities();

transaction.finish();
```

---

## 📊 Dashboards e Alertas

### 1. Visualizar Erros

**Issues Dashboard**:
1. Vá para **Issues** no menu lateral
2. Filtros úteis:
   - **Status**: Unresolved, Ignored, Resolved
   - **Level**: Error, Warning, Info
   - **Environment**: production, development
   - **Release**: Compare versões

**Detalhes de um Erro**:
- **Stack Trace**: Linha exata do código com source map
- **Breadcrumbs**: Ações do usuário antes do erro
- **User Context**: Email, ID do usuário
- **Session Replay**: Vídeo da sessão (se habilitado)
- **Similar Issues**: Erros relacionados

### 2. Performance Dashboard

1. Vá para **Performance** no menu lateral
2. Métricas exibidas:
   - **Throughput**: Transações/minuto
   - **Latency**: P50, P75, P95, P99
   - **Apdex Score**: 0-1 (qualidade geral)
   - **Failure Rate**: % de transações com erro

### 3. Configurar Alertas

#### Email Alerts (automático)
- Ativado por padrão quando criar projeto
- Você recebe email toda vez que um novo erro ocorre

#### Slack Alerts (recomendado)
1. Vá para **Settings > Integrations**
2. Busque **Slack**
3. Clique em **"Add to Slack"**
4. Autorize o Sentry
5. Configure canal: `#dev-alerts`
6. Selecione eventos:
   - ✅ New Issue
   - ✅ Resolved Issue
   - ✅ Regression (erro que voltou)

#### Custom Alert Rules
1. Vá para **Alerts > Create Alert**
2. Exemplo: "Alerta se > 10 erros em 1 minuto"
   - **Metric**: `Event count`
   - **Threshold**: `10`
   - **Time Window**: `1 minute`
   - **Actions**: Email + Slack
3. Salve

### 4. Releases (Tracking de Versões)

O CI/CD já faz isso automaticamente via `sentryVitePlugin`, mas você pode ver:

1. Vá para **Releases**
2. Cada deploy cria uma release (git commit hash)
3. Compare erros entre releases:
   - **New Issues**: Erros que surgiram nesta versão
   - **Regressions**: Erros que foram resolvidos mas voltaram
   - **Crash Free Sessions**: % de sessões sem crashes

---

## 🔧 Configurações Avançadas

### 1. Filtrar Erros de Terceiros

Edite `src/lib/sentry.ts` e adicione ao `ignoreErrors`:

```typescript
ignoreErrors: [
  // ... erros existentes
  
  // Seu filtro customizado
  /Error from Google Analytics/,
  /Facebook SDK error/,
],
```

### 2. Sampling (Economizar Quota)

Se estiver ultrapassando o limite de eventos:

```typescript
// Em src/lib/sentry.ts
tracesSampleRate: 0.1, // 10% de transações
replaysSessionSampleRate: 0.05, // 5% de sessões
```

### 3. Desabilitar em Desenvolvimento

```typescript
// Em src/lib/sentry.ts
if (!dsn || environment === 'development') {
  console.log('[Sentry] Desabilitado em desenvolvimento');
  return;
}
```

### 4. Performance Budget

Configure alertas se bundle ficar muito grande:

```typescript
// Em vite.config.ts
build: {
  chunkSizeWarningLimit: 500, // Avisa se chunk > 500KB
}
```

---

## 🆘 Troubleshooting

### Erro: "DSN não configurado"

**Solução**: Verifique se `VITE_SENTRY_DSN` está no `.env` e reinicie o servidor:

```bash
npm run dev
```

### Source Maps não aparecem

**Solução**: 
1. Verifique se `SENTRY_AUTH_TOKEN` está nos GitHub Secrets
2. Confirme que `sourcemap: true` em `vite.config.ts`
3. Aguarde 1-2 minutos após deploy (processamento)

### Muitos Eventos (quota estourada)

**Solução**: Reduza sampling em `src/lib/sentry.ts`:

```typescript
tracesSampleRate: 0.05, // 5% em vez de 10%
replaysSessionSampleRate: 0.01, // 1% em vez de 10%
```

### Erros duplicados

**Solução**: Configure **fingerprinting** em `beforeSend`:

```typescript
beforeSend(event) {
  // Agrupar erros similares
  if (event.exception?.values?.[0]?.value) {
    event.fingerprint = [event.exception.values[0].value];
  }
  return event;
}
```

---

## 📚 Links Úteis

- [Sentry React Docs](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)
- [Alerts](https://docs.sentry.io/product/alerts/)
- [Releases](https://docs.sentry.io/product/releases/)

---

## ✅ Checklist de Setup

- [ ] Criar conta no Sentry
- [ ] Criar organização e projeto
- [ ] Copiar DSN
- [ ] Gerar Auth Token
- [ ] Adicionar variáveis ao `.env`
- [ ] Adicionar secrets no GitHub
- [ ] Testar localmente (forçar erro)
- [ ] Verificar erro no dashboard
- [ ] Configurar alertas (Email + Slack)
- [ ] Fazer primeiro deploy e verificar release

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0
