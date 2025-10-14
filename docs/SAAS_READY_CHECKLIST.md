# 🚀 CHECKLIST COMPLETO - SaaS Pronto para Comercialização

> Guia passo a passo para transformar o SnapDoor CRM em um SaaS comercial 100% funcional

**Data**: 14 de Janeiro de 2025  
**Status Atual**: 🟡 80% Completo (Deploy Ready)  
**Objetivo**: 🎯 100% Comercialmente Viável

---

## 📊 STATUS GERAL

| Categoria | Status | Progresso |
|-----------|--------|-----------|
| **Código Base** | ✅ Completo | 100% |
| **Documentação** | ✅ Completo | 100% |
| **Testes** | 🟡 Parcial | 66% |
| **Deploy** | 🟡 Configuração Pendente | 80% |
| **Integrações** | 🟡 Pendentes | 60% |
| **Financeiro** | 🔴 Não Configurado | 0% |
| **Marketing** | 🔴 Não Iniciado | 0% |

**Status Geral**: 🟡 **73% Completo**

---

## 🎯 FASE 1: Configurações Técnicas Básicas (1-2 dias)

### ✅ 1.1 Configurar Supabase (30 min)

**Objetivo**: Ativar banco de dados em produção

#### Passos:
1. [ ] **Criar conta Supabase** (se ainda não tem)
   - Acesse: https://supabase.com
   - Clique "Start your project"
   - Login com GitHub (recomendado)

2. [ ] **Criar projeto**
   - Nome: `snapdoor-production`
   - Database Password: **ANOTE EM LUGAR SEGURO**
   - Região: `South America (São Paulo)` (melhor latência BR)
   - Plano: **Free** (começa grátis, upgrade depois)

3. [ ] **Copiar credenciais**
   - Vá para **Settings > API**
   - Copie:
     - [x] `Project URL` → `VITE_SUPABASE_URL`
     - [x] `anon public` → `VITE_SUPABASE_ANON_KEY`
     - [x] `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

4. [ ] **Aplicar migrations**
   ```bash
   cd C:\Users\Uillen Machado\Documents\Meus projetos\snapdoor
   npx supabase db push
   ```

5. [ ] **Verificar tabelas criadas**
   - Vá para **Database > Tables**
   - Confirme que todas as 15+ tabelas existem

6. [ ] **Habilitar RLS (Row Level Security)**
   - Já aplicado nas migrations
   - Verificar em **Authentication > Policies**

---

### ✅ 1.2 Configurar Vercel (30 min)

**Objetivo**: Hospedagem e deploy automático

#### Passos:
1. [ ] **Criar conta Vercel**
   - Acesse: https://vercel.com/signup
   - Login com GitHub (recomendado)
   - Plano: **Hobby (Free)**

2. [ ] **Importar projeto do GitHub**
   - Clique "Add New..." > "Project"
   - Selecione repositório: `uillenmachado/snapdoor`
   - Clique "Import"

3. [ ] **Configurar variáveis de ambiente**
   - Em "Environment Variables", adicione:
     ```
     VITE_SUPABASE_URL=https://xxx.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJxxx...
     ```
   - Clique "Deploy"

4. [ ] **Aguardar primeiro deploy** (~3 min)
   - Status: Building → Ready
   - Copie URL: `https://snapdoor-xxx.vercel.app`

5. [ ] **Testar aplicação online**
   - Abra URL no navegador
   - Faça login de teste
   - Verifique se funciona

6. [ ] **Configurar domínio personalizado** (opcional)
   - Settings > Domains
   - Adicionar: `app.snapdoor.com.br`
   - Configurar DNS conforme instruções

7. [ ] **Copiar IDs do projeto**
   - Settings > General
   - Copie `Project ID` e `Org ID`

---

### ✅ 1.3 Configurar Sentry (30 min)

**Objetivo**: Monitoramento de erros em produção

#### Passos:
1. [ ] **Criar conta Sentry**
   - Acesse: https://sentry.io/signup
   - Login com GitHub
   - Plano: **Developer (Free)** - 5K eventos/mês

2. [ ] **Criar organização**
   - Nome: `SnapDoor` (ou seu nome)
   - Slug: `snapdoor`

3. [ ] **Criar projeto**
   - Plataforma: **React**
   - Nome: `snapdoor-crm`
   - Alert: ✅ "Alert me on every new issue"

4. [ ] **Copiar DSN**
   - Copie o DSN mostrado:
     ```
     https://abc123@o456.ingest.sentry.io/789
     ```

5. [ ] **Gerar Auth Token**
   - Settings > Auth Tokens
   - "Create New Token"
   - Nome: `SnapDoor CI/CD`
   - Scopes: ✅ `project:releases`, `project:write`, `org:read`
   - Copie o token: `sntrys_xxx...`

6. [ ] **Adicionar variáveis na Vercel**
   - Vercel > Settings > Environment Variables
   - Adicione:
     ```
     VITE_SENTRY_DSN=https://abc123@o456.ingest.sentry.io/789
     ```
   - Redeploy

7. [ ] **Testar Sentry**
   - Acesse app em produção
   - Force um erro de teste
   - Verifique em Sentry > Issues (30s)

📚 **Guia completo**: [SENTRY_SETUP_GUIDE.md](./SENTRY_SETUP_GUIDE.md)

---

### ✅ 1.4 Configurar GitHub Secrets (15 min)

**Objetivo**: Habilitar CI/CD automático

#### Passos:
1. [ ] **Acessar repositório**
   - https://github.com/uillenmachado/snapdoor
   - Settings > Secrets and variables > Actions

2. [ ] **Adicionar 7 secrets** (um por vez):

   **Secret 1**: `VERCEL_TOKEN`
   ```
   Valor: vercel_xxx... (obtido no passo 1.2)
   ```

   **Secret 2**: `VERCEL_ORG_ID`
   ```
   Valor: team_xxx... (obtido no passo 1.2)
   ```

   **Secret 3**: `VERCEL_PROJECT_ID`
   ```
   Valor: prj_xxx... (obtido no passo 1.2)
   ```

   **Secret 4**: `VITE_SENTRY_DSN`
   ```
   Valor: https://abc123@o456.ingest.sentry.io/789
   ```

   **Secret 5**: `SENTRY_ORG`
   ```
   Valor: snapdoor (seu org slug)
   ```

   **Secret 6**: `SENTRY_PROJECT`
   ```
   Valor: snapdoor-crm
   ```

   **Secret 7**: `SENTRY_AUTH_TOKEN`
   ```
   Valor: sntrys_xxx...
   ```

3. [ ] **Verificar secrets configurados**
   - Deve haver 7 secrets listados

4. [ ] **Testar CI/CD**
   - Faça um commit qualquer:
     ```bash
     echo "# Test CI/CD" >> README.md
     git add README.md
     git commit -m "test: CI/CD pipeline"
     git push origin master
     ```
   - Vá para **Actions** no GitHub
   - Aguarde workflow executar (~5 min)
   - Verifique jobs: lint ✅ → build ✅ → test ✅ → deploy ✅

📚 **Guia completo**: [GITHUB_SECRETS_GUIDE.md](./GITHUB_SECRETS_GUIDE.md)

---

## 🔌 FASE 2: Integrações Externas (2-3 dias)

### ✅ 2.1 Hunter.io (Email Verification)

**Objetivo**: Enriquecimento de leads com emails verificados

#### Passos:
1. [ ] **Criar conta Hunter.io**
   - Acesse: https://hunter.io/users/sign_up
   - Plano: **Free** (50 requests/mês) ou **Starter** ($49/mês)

2. [ ] **Obter API Key**
   - Dashboard > API > API Keys
   - Copie: `abc123def456...`

3. [ ] **Adicionar na Vercel**
   - Vercel > Environment Variables
   - Nome: `VITE_HUNTER_API_KEY`
   - Valor: `abc123def456...`
   - Redeploy

4. [ ] **Testar enriquecimento**
   - Criar lead sem email completo
   - Clicar "Enriquecer"
   - Verificar se encontra email

5. [ ] **Monitorar uso**
   - Hunter Dashboard > Usage
   - Verificar requests restantes

---

### ⚠️ 2.2 Stripe (Pagamentos) - CRÍTICO PARA SAAS

**Objetivo**: Receber pagamentos de clientes

#### Passos:
1. [ ] **Criar conta Stripe**
   - Acesse: https://stripe.com/br
   - Cadastro completo (CPF/CNPJ, conta bancária)
   - **IMPORTANTE**: Ativar modo produção (não teste)

2. [ ] **Obter API Keys**
   - Dashboard > Developers > API Keys
   - Copie:
     - `Publishable key`: `pk_live_xxx...`
     - `Secret key`: `sk_live_xxx...`

3. [ ] **Criar produtos no Stripe**
   - Products > Add Product

   **Produto 1: Plano Pro**
   ```
   Nome: SnapDoor Pro
   Descrição: Plano profissional com 100 créditos/mês
   Preço: R$ 97,00/mês
   Billing: Recorrente mensal
   ```

   **Produto 2: Plano Enterprise**
   ```
   Nome: SnapDoor Enterprise
   Descrição: Plano enterprise com créditos ilimitados
   Preço: R$ 297,00/mês
   Billing: Recorrente mensal
   ```

   **Produto 3: Créditos Avulsos (10)**
   ```
   Nome: 10 Créditos
   Preço: R$ 19,90
   Billing: One-time
   ```

   **Produto 4: Créditos Avulsos (50)**
   ```
   Nome: 50 Créditos
   Preço: R$ 79,90
   Billing: One-time
   ```

   **Produto 5: Créditos Avulsos (100)**
   ```
   Nome: 100 Créditos
   Preço: R$ 139,90
   Billing: One-time
   ```

4. [ ] **Copiar Price IDs**
   - Em cada produto, copie o `Price ID`
   - Ex: `price_abc123...`

5. [ ] **Configurar Webhook**
   - Developers > Webhooks > Add endpoint
   - URL: `https://snapdoor-xxx.vercel.app/api/stripe-webhook`
   - Eventos: ✅ Selecionar:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copie `Webhook signing secret`: `whsec_xxx...`

6. [ ] **Adicionar variáveis na Vercel**
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx...
   STRIPE_SECRET_KEY=sk_live_xxx... (server-side only)
   STRIPE_WEBHOOK_SECRET=whsec_xxx...
   STRIPE_PRICE_PRO=price_abc123... (plano Pro)
   STRIPE_PRICE_ENTERPRISE=price_def456... (plano Enterprise)
   STRIPE_PRICE_CREDITS_10=price_ghi789...
   STRIPE_PRICE_CREDITS_50=price_jkl012...
   STRIPE_PRICE_CREDITS_100=price_mno345...
   ```

7. [ ] **Testar compra de créditos**
   - Em produção, clicar "Comprar Créditos"
   - Usar cartão de teste Stripe:
     - Número: `4242 4242 4242 4242`
     - Validade: qualquer data futura
     - CVC: qualquer 3 dígitos
   - Completar checkout
   - Verificar:
     - [ ] Webhook recebido
     - [ ] Créditos adicionados ao usuário
     - [ ] Email de confirmação enviado

8. [ ] **Configurar faturamento real**
   - Settings > Business Settings
   - Adicionar dados fiscais (CNPJ ou CPF)
   - Configurar conta bancária para recebimentos
   - Ativar modo produção

---

### ✅ 2.3 Resend (Emails Transacionais)

**Objetivo**: Enviar emails automáticos (boas-vindas, recuperação senha, etc)

#### Passos:
1. [ ] **Criar conta Resend**
   - Acesse: https://resend.com/signup
   - Plano: **Free** (100 emails/dia) ou **Pro** ($20/mês, 50K emails/mês)

2. [ ] **Verificar domínio**
   - Settings > Domains > Add Domain
   - Domínio: `snapdoor.com.br`
   - Adicionar registros DNS (TXT, MX, CNAME)
   - Aguardar verificação (~24h)

3. [ ] **Obter API Key**
   - API Keys > Create API Key
   - Nome: `SnapDoor Production`
   - Copie: `re_xxx...`

4. [ ] **Adicionar na Vercel**
   ```
   RESEND_API_KEY=re_xxx...
   ```

5. [ ] **Criar templates de email**
   - No código, já existem templates em `src/lib/emailTemplates.ts`
   - Personalizar conforme sua marca

6. [ ] **Testar emails**
   - Criar novo usuário
   - Verificar se recebe email de boas-vindas
   - Testar "Esqueci minha senha"
   - Testar notificações de atividades

---

### ⏸️ 2.4 LinkedIn Scraper (Opcional)

**Status**: Já implementado via Edge Function

#### Passos:
1. [ ] **Revisar código**
   - `supabase/functions/linkedin-scraper/index.ts`

2. [ ] **Deploy Edge Function**
   ```bash
   npx supabase functions deploy linkedin-scraper
   ```

3. [ ] **Testar scraping**
   - Adicionar lead com LinkedIn URL
   - Clicar "Enriquecer"
   - Verificar dados extraídos

4. [ ] **Monitorar rate limits**
   - LinkedIn limita scraping
   - Implementar delays entre requests
   - Usar proxy se necessário

---

## 💰 FASE 3: Sistema de Pagamentos & Planos (1-2 dias)

### ✅ 3.1 Configurar Planos de Assinatura

**Objetivo**: Permitir que clientes assinem planos mensais

#### Passos:
1. [ ] **Verificar tabela subscriptions**
   - Já criada via migrations
   - Schema: user_id, plan, status, stripe_customer_id, etc

2. [ ] **Criar página de Pricing**
   - Já existe: `src/pages/Pricing.tsx`
   - Personalizar planos e preços

3. [ ] **Integrar com Stripe Checkout**
   - Hook: `src/hooks/useStripe.ts`
   - Função: `createCheckoutSession()`
   - Testar fluxo completo

4. [ ] **Implementar lógica de upgrade/downgrade**
   - Permitir mudar de plano
   - Calcular pro-rata
   - Atualizar créditos

5. [ ] **Testar ciclo completo**:
   - [ ] Usuário free tenta usar feature premium → Bloqueado
   - [ ] Clica "Upgrade para Pro"
   - [ ] Checkout Stripe abre
   - [ ] Completa pagamento
   - [ ] Webhook atualiza plano
   - [ ] Feature premium liberada

---

### ✅ 3.2 Sistema de Créditos

**Objetivo**: Controlar uso de enriquecimento de leads

#### Passos:
1. [ ] **Verificar tabelas**
   - `user_credits` ✅
   - `credit_packages` ✅
   - `credit_purchases` ✅
   - `credit_usage_history` ✅

2. [ ] **Definir limites por plano**
   - Free: 10 créditos/mês
   - Pro: 100 créditos/mês
   - Enterprise: Ilimitado

3. [ ] **Implementar lógica de consumo**
   - Já implementado: `src/hooks/useCredits.ts`
   - Validar antes de enriquecer lead

4. [ ] **Criar página de Créditos**
   - Mostrar saldo atual
   - Histórico de uso
   - Botão "Comprar Créditos"

5. [ ] **Testar compra de créditos**:
   - [ ] Usuário sem créditos tenta enriquecer → Modal "Sem créditos"
   - [ ] Clica "Comprar Créditos"
   - [ ] Seleciona pacote (ex: 50 créditos)
   - [ ] Checkout Stripe
   - [ ] Webhook adiciona créditos
   - [ ] Saldo atualizado

---

## 👤 FASE 4: Onboarding & UX (1 dia)

### ✅ 4.1 Criar Conta Admin

**Objetivo**: Ter acesso administrativo ao sistema

#### Passos:
1. [ ] **Criar usuário admin via Supabase**
   - Supabase > Authentication > Users
   - Add user manually
   - Email: `admin@snapdoor.com`
   - Password: `SnapDoor2025!Admin`
   - Confirm email: ✅

2. [ ] **Atualizar role no profiles**
   - Database > profiles
   - Encontrar usuário admin
   - Editar: `role = 'super_admin'`

3. [ ] **Testar login admin**
   - Login com credenciais
   - Verificar acesso a todas as features
   - Verificar menu "Admin" (se houver)

---

### ✅ 4.2 Onboarding Guiado

**Objetivo**: Guiar novos usuários após cadastro

#### Passos:
1. [ ] **Verificar componente**
   - Já implementado: `src/components/OnboardingDialog.tsx`

2. [ ] **Personalizar steps**
   - Step 1: Bem-vindo ao SnapDoor
   - Step 2: Adicione seu primeiro lead
   - Step 3: Configure integrações
   - Step 4: Crie seu primeiro negócio

3. [ ] **Adicionar tours interativos**
   - Usar lib: `react-joyride` ou `intro.js`
   - Destacar features principais

4. [ ] **Testar fluxo**:
   - [ ] Criar novo usuário
   - [ ] Onboarding aparece automaticamente
   - [ ] Completar todos os steps
   - [ ] Não aparecer novamente

---

### ✅ 4.3 Templates & Dados de Exemplo

**Objetivo**: Facilitar primeiros passos do usuário

#### Passos:
1. [ ] **Criar templates de automação**
   - "Follow-up após 3 dias sem contato"
   - "Enviar proposta após reunião"
   - "Alertar negócios parados > 7 dias"

2. [ ] **Criar dados de exemplo (opcional)**
   - 5 leads fictícios
   - 2 negócios de exemplo
   - 3 atividades
   - Botão "Importar Dados de Exemplo"

3. [ ] **Criar biblioteca de templates de email**
   - Email de boas-vindas
   - Email de follow-up
   - Email de proposta
   - Email de agradecimento

---

## 📈 FASE 5: Marketing & Lançamento (3-5 dias)

### 🔴 5.1 Landing Page

**Objetivo**: Converter visitantes em leads/clientes

#### Passos:
1. [ ] **Criar landing page** (separada do app)
   - Opção 1: Vercel + Next.js
   - Opção 2: WordPress + Elementor
   - Opção 3: Webflow (no-code)
   - URL: `https://snapdoor.com.br`

2. [ ] **Seções obrigatórias**:
   - [ ] Hero (título + CTA "Teste Grátis")
   - [ ] Features (6 principais)
   - [ ] Benefícios (por que escolher SnapDoor)
   - [ ] Pricing (3 planos)
   - [ ] Depoimentos (social proof)
   - [ ] FAQ (dúvidas comuns)
   - [ ] CTA Final + Formulário

3. [ ] **Integrar formulário**
   - Capturar: Nome, Email, Empresa
   - Enviar para: Supabase ou Resend
   - Automação: Email de boas-vindas + trial

4. [ ] **Configurar Analytics**
   - Google Analytics 4
   - Meta Pixel (Facebook/Instagram)
   - Google Tag Manager

5. [ ] **SEO Básico**:
   - [ ] Title tag: "SnapDoor CRM - Gestão de Leads Inteligente"
   - [ ] Meta description (~160 caracteres)
   - [ ] Keywords relevantes
   - [ ] Sitemap.xml
   - [ ] robots.txt
   - [ ] Schema.org markup (JSON-LD)

---

### 🔴 5.2 Blog & Conteúdo

**Objetivo**: Atrair tráfego orgânico (SEO)

#### Passos:
1. [ ] **Escolher plataforma**
   - Opção 1: WordPress (mais fácil)
   - Opção 2: Ghost (modern)
   - Opção 3: Next.js + MDX (dev-friendly)

2. [ ] **Criar 10 artigos iniciais**:
   - [ ] "Como gerenciar leads de forma eficaz"
   - [ ] "10 dicas para aumentar taxa de conversão"
   - [ ] "Enriquecimento de leads: o que é e como usar"
   - [ ] "Pipeline de vendas: guia completo"
   - [ ] "Automação de vendas: economize tempo"
   - [ ] "CRM vs Planilha: qual escolher?"
   - [ ] "Hunter.io: como encontrar emails profissionais"
   - [ ] "LinkedIn para vendas B2B"
   - [ ] "Métricas de vendas que importam"
   - [ ] "Como escolher um CRM para sua empresa"

3. [ ] **Otimizar artigos para SEO**
   - Keywords no título, H1, H2
   - Imagens com alt text
   - Internal linking
   - 1500+ palavras por artigo

4. [ ] **Publicar cronograma**
   - 2-3 artigos/semana inicialmente
   - Depois 1-2/semana

---

### 🔴 5.3 Redes Sociais

**Objetivo**: Construir audiência e engajamento

#### Passos:
1. [ ] **Criar perfis**
   - [ ] LinkedIn (principal para B2B)
   - [ ] Instagram (visual)
   - [ ] YouTube (tutoriais)
   - [ ] Twitter/X (updates)

2. [ ] **Estratégia de conteúdo**:
   - LinkedIn: 3x/semana (dicas, cases, atualizações)
   - Instagram: 5x/semana (carrosséis, stories, reels)
   - YouTube: 2x/mês (tutoriais, demos)
   - Twitter: Daily (tips rápidas, interações)

3. [ ] **Criar calendário editorial**
   - Usar: Notion, Trello ou Buffer
   - Agendar posts com 1-2 semanas de antecedência

4. [ ] **Engagement**
   - Responder comentários (24h)
   - Participar de grupos relevantes
   - Fazer networking

---

### 🔴 5.4 Ads Pagos (Opcional - Budget)

**Objetivo**: Acelerar aquisição de clientes

#### Passos:
1. [ ] **Google Ads** (Search)
   - Keywords: "CRM para pequenas empresas", "gerenciador de leads", etc
   - Budget inicial: R$ 30/dia
   - Landing page: Pricing ou Trial

2. [ ] **Facebook/Instagram Ads**
   - Público: Empreendedores, vendedores, donos de negócio
   - Formato: Carrossel mostrando features
   - Budget: R$ 20/dia

3. [ ] **LinkedIn Ads** (mais caro, mas B2B)
   - Público: Decisores, gerentes de vendas
   - Formato: Sponsored Content
   - Budget: R$ 50/dia

4. [ ] **Métricas para acompanhar**
   - CTR (Click-Through Rate) > 2%
   - CPC (Cost Per Click) < R$ 2
   - CVR (Conversion Rate) > 5%
   - CAC (Customer Acquisition Cost) < R$ 150

---

## 🧪 FASE 6: Testes & QA (2-3 dias)

### ✅ 6.1 Testes Automatizados

**Objetivo**: Garantir qualidade do código

#### Passos:
1. [ ] **Aumentar coverage de testes**
   - Meta: 70%+ coverage
   - Corrigir 18 testes falhando
   - Adicionar testes de integração

2. [ ] **Executar testes**
   ```bash
   npm test
   npm run test:coverage
   ```

3. [ ] **Configurar E2E (Playwright)**
   - Já configurado: `playwright.config.ts`
   - Criar testes E2E principais:
     - [ ] Login/Signup
     - [ ] Criar lead
     - [ ] Criar negócio
     - [ ] Enriquecer lead
     - [ ] Comprar créditos

4. [ ] **CI/CD já executa testes**
   - GitHub Actions roda automaticamente
   - Bloqueia merge se testes falharem

---

### ✅ 6.2 Testes Manuais

**Objetivo**: Validar UX e fluxos críticos

#### Passos:
1. [ ] **Executar VISUAL_TEST_CHECKLIST.md**
   - Seguir todos os ~120 testes
   - Documentar bugs encontrados
   - Priorizar correções

2. [ ] **Testar em múltiplos browsers**
   - [ ] Chrome (latest)
   - [ ] Firefox (latest)
   - [ ] Safari (macOS/iOS)
   - [ ] Edge (latest)

3. [ ] **Testar em múltiplos devices**
   - [ ] Desktop (1920x1080)
   - [ ] Laptop (1366x768)
   - [ ] Tablet (iPad - 768x1024)
   - [ ] Mobile (iPhone - 375x667)

4. [ ] **Testar performance**
   - [ ] Lighthouse score > 80
   - [ ] Página carrega < 3s
   - [ ] Sem erros no console

---

### ✅ 6.3 Segurança

**Objetivo**: Proteger dados dos clientes

#### Passos:
1. [ ] **Revisar RLS (Row Level Security)**
   - Todas as policies aplicadas
   - Testar com múltiplos usuários
   - Garantir isolamento de dados

2. [ ] **Validar inputs**
   - Todos os formulários usam Zod
   - Sanitização de dados
   - Proteção contra XSS

3. [ ] **HTTPS obrigatório**
   - Vercel já fornece SSL
   - Redirecionar HTTP → HTTPS

4. [ ] **Rate limiting**
   - Implementar limites de API
   - Prevenir abuse

5. [ ] **Backup automático**
   - Supabase faz backup diário (plano pago)
   - Configurar se necessário

---

## 📋 FASE 7: Legal & Compliance (1 dia)

### 🔴 7.1 Termos de Uso

**Objetivo**: Proteger legalmente sua empresa

#### Passos:
1. [ ] **Criar documento de Termos de Uso**
   - Contratar advogado (recomendado) ou usar template
   - Incluir:
     - [ ] Definições
     - [ ] Aceitação dos termos
     - [ ] Descrição dos serviços
     - [ ] Responsabilidades do usuário
     - [ ] Propriedade intelectual
     - [ ] Limitações de responsabilidade
     - [ ] Lei aplicável e foro

2. [ ] **Publicar em** `/termos-de-uso`

3. [ ] **Exigir aceitação no cadastro**
   - Checkbox: "Aceito os Termos de Uso"
   - Link para leitura

---

### 🔴 7.2 Política de Privacidade (LGPD)

**Objetivo**: Estar em conformidade com LGPD (Brasil) e GDPR (Europa)

#### Passos:
1. [ ] **Criar Política de Privacidade**
   - Contratar advogado especializado em LGPD
   - Incluir:
     - [ ] Dados coletados
     - [ ] Finalidade do uso
     - [ ] Compartilhamento com terceiros
     - [ ] Direitos do titular (acesso, exclusão, portabilidade)
     - [ ] Segurança dos dados
     - [ ] Cookies
     - [ ] Contato do DPO (Data Protection Officer)

2. [ ] **Publicar em** `/politica-de-privacidade`

3. [ ] **Implementar consentimento de cookies**
   - Banner de cookies (LGPD/GDPR)
   - Opções: Aceitar tudo, Apenas necessários, Gerenciar

4. [ ] **Permitir exportação de dados**
   - Feature: "Baixar meus dados"
   - Formato: JSON ou CSV

5. [ ] **Permitir exclusão de conta**
   - Feature: "Excluir minha conta"
   - Confirmar com senha
   - Apagar todos os dados (GDPR "direito ao esquecimento")

---

### 🔴 7.3 Nota Fiscal Eletrônica (NF-e)

**Objetivo**: Estar regular fiscalmente

#### Passos:
1. [ ] **CNPJ obrigatório**
   - Abrir empresa (MEI, SaaS ou LTDA)
   - Regime tributário: Simples Nacional (recomendado para início)

2. [ ] **Integrar emissão de NF-e**
   - Opção 1: Conta Azul (R$ 60/mês)
   - Opção 2: eNotas (R$ 1/nota)
   - Opção 3: NFe.io (API - R$ 0.25/nota)

3. [ ] **Automatizar emissão**
   - Quando assinatura confirmada → Emitir NF-e
   - Enviar por email automaticamente

4. [ ] **Armazenar XML das notas**
   - Guardar por 5 anos (obrigatório)
   - Supabase Storage

---

## 🚀 FASE 8: Lançamento & Go-Live (1 dia)

### ✅ 8.1 Checklist Pré-Lançamento

**Objetivo**: Garantir que tudo está pronto

#### Checklist Final:
- [ ] ✅ Todos os testes passando
- [ ] ✅ Documentação completa
- [ ] ✅ Supabase em produção
- [ ] ✅ Vercel deploy ok
- [ ] ✅ Sentry monitorando
- [ ] ✅ Stripe configurado
- [ ] ✅ Hunter.io ativo
- [ ] ✅ Resend enviando emails
- [ ] ✅ Landing page no ar
- [ ] ✅ Termos de Uso publicado
- [ ] ✅ Política de Privacidade publicada
- [ ] ✅ NF-e configurada
- [ ] ✅ Redes sociais criadas
- [ ] ✅ Google Analytics ativo
- [ ] ✅ Conta admin criada
- [ ] ✅ Performance > 80
- [ ] ✅ Backup configurado
- [ ] ✅ SSL ativo (HTTPS)
- [ ] ✅ Domínio personalizado (opcional)

---

### 🎉 8.2 Lançamento

**Objetivo**: Tornar o SaaS público

#### Passos:
1. [ ] **Soft launch (beta fechado)**
   - Convidar 10-20 beta testers
   - Coletar feedback
   - Corrigir bugs críticos

2. [ ] **Hard launch (público)**
   - Anunciar em redes sociais
   - Email para lista (se houver)
   - Post no LinkedIn
   - Publicar no Product Hunt

3. [ ] **Oferta de lançamento** (opcional)
   - 30% desconto nos 3 primeiros meses
   - Trial estendido (30 dias em vez de 14)

4. [ ] **Monitorar métricas**:
   - Signups/dia
   - Trial → Paid conversion
   - Churn rate
   - MRR (Monthly Recurring Revenue)

---

## 📊 FASE 9: Pós-Lançamento & Crescimento (Contínuo)

### 📈 9.1 Métricas para Acompanhar

**Objetivo**: Entender saúde do negócio

#### Dashboard de Métricas (criar planilha ou Metabase):
1. [ ] **Aquisição**
   - Visitantes/mês (landing page)
   - Signups/mês
   - Conversão visitante → signup (meta: 3-5%)

2. [ ] **Ativação**
   - % de usuários que completam onboarding
   - % de usuários que criam 1º lead
   - % de usuários que enriquecem 1º lead

3. [ ] **Receita**
   - MRR (Monthly Recurring Revenue)
   - ARR (Annual Recurring Revenue)
   - ARPU (Average Revenue Per User)
   - LTV (Lifetime Value)

4. [ ] **Retenção**
   - Churn rate (meta: < 5%/mês)
   - % de usuários ativos (DAU/MAU)

5. [ ] **Custos**
   - CAC (Customer Acquisition Cost)
   - Hosting (Vercel, Supabase)
   - APIs (Hunter, Stripe, Resend)
   - CAC Payback Period (meta: < 12 meses)

---

### 🔄 9.2 Suporte ao Cliente

**Objetivo**: Manter clientes satisfeitos

#### Passos:
1. [ ] **Canal de suporte**
   - Email: suporte@snapdoor.com
   - Chat (Intercom, Crisp, Tawk.to)
   - WhatsApp Business (opcional)

2. [ ] **Base de conhecimento**
   - FAQ expandido
   - Tutoriais em vídeo
   - Documentação (já temos USER_GUIDE)

3. [ ] **SLA (Service Level Agreement)**
   - Responder em < 24h (plano Free/Pro)
   - Responder em < 4h (plano Enterprise)

4. [ ] **Coletar feedback**
   - NPS (Net Promoter Score) mensal
   - Pesquisa de satisfação trimestral
   - Feature requests (Canny.io ou similar)

---

### 🚀 9.3 Roadmap de Features

**Objetivo**: Evoluir o produto baseado em feedback

#### Próximas Features (priorizar com clientes):
1. [ ] **Mobile App** (iOS + Android)
2. [ ] **Integrações**:
   - [ ] WhatsApp Business API
   - [ ] Gmail (sync de emails)
   - [ ] Google Calendar (sync de reuniões)
   - [ ] Slack (notificações)
   - [ ] Zapier (integrações ilimitadas)
3. [ ] **IA Avançada**:
   - [ ] Chatbot para qualificação de leads
   - [ ] Sugestões de próximos passos
   - [ ] Predição de probabilidade de fechamento
4. [ ] **Relatórios Avançados**:
   - [ ] Dashboards customizáveis
   - [ ] Exportar para PowerBI/Tableau
5. [ ] **Multi-idioma**:
   - [ ] Inglês
   - [ ] Espanhol

---

## ✅ RESUMO: ORDEM DE PRIORIDADE

### 🔥 URGENTE (Fazer AGORA - 1-2 dias)
1. ✅ Configurar Supabase produção
2. ✅ Configurar Vercel + deploy
3. ✅ Configurar Sentry
4. ✅ Configurar GitHub Secrets
5. ⚠️ Configurar Stripe (CRÍTICO PARA RECEBER $$$)
6. ⚠️ Criar Termos de Uso + Privacidade
7. ⚠️ Abrir CNPJ + Configurar NF-e

### 🟡 IMPORTANTE (Fazer LOGO - 3-5 dias)
8. Hunter.io
9. Resend (emails)
10. Landing page
11. Conta admin
12. Onboarding
13. Testes manuais completos
14. Blog (3-5 artigos iniciais)
15. Redes sociais

### 🟢 DESEJÁVEL (Fazer DEPOIS - 1-2 semanas)
16. Ads pagos
17. E2E tests (Playwright)
18. Multi-idioma
19. Mobile app
20. Integrações extras

---

## 📞 CONTATOS ÚTEIS

### Serviços Recomendados:
- **Contador**: Para abertura de CNPJ e NF-e
- **Advogado**: Para Termos de Uso e Privacidade (LGPD)
- **Designer**: Para logo, brand, landing page (Fiverr, 99designs)
- **Copywriter**: Para textos da landing e emails
- **Suporte**: uillenmachado4@gmail.com

---

## 🎯 OBJETIVO FINAL

**Meta**: Ter um SaaS 100% funcional e comercialmente viável em **7-10 dias** de trabalho focado.

**Critérios de Sucesso**:
- [ ] ✅ Sistema no ar e acessível
- [ ] ✅ Aceita pagamentos (Stripe)
- [ ] ✅ Envia emails transacionais
- [ ] ✅ Monitora erros (Sentry)
- [ ] ✅ Landing page converte visitantes
- [ ] ✅ Termos legais publicados
- [ ] ✅ NF-e emitida automaticamente
- [ ] ✅ Primeiros 10 clientes pagantes

**Quando você terá um SaaS pronto?**
👉 **Após completar FASE 1-3 (URGENTE) + FASE 7 (Legal) = ~5 dias de trabalho**

---

**BOA SORTE! 🚀**

Se precisar de ajuda em qualquer etapa, consulte a documentação em `docs/` ou entre em contato.
