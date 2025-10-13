# 🚪 SnapDoor CRM - SaaS Completo

**O CRM Profissional para Equipes de Vendas Modernas**

![Status](https://img.shields.io/badge/status-production--ready-green)
![Version](https://img.shields.io/badge/version-2.0.0-blue)
![TypeScript](https://img.shields.io/badge/typescript-5.0-blue)
![React](https://img.shields.io/badge/react-18-blue)
![Supabase](https://img.shields.io/badge/supabase-latest-green)

SnapDoor é um **sistema completo de CRM** (Customer Relationship Management) construído como SaaS pronto para comercialização. Interface moderna, funcionalidades avançadas, e arquitetura escalável.

---

## 🎯 Visão Geral

Sistema profissional de gerenciamento de vendas com:

- 🏢 **Gestão de Empresas** - CRUD completo
- 👥 **Gestão de Leads** - Contatos e relacionamentos
- 💼 **Pipeline de Oportunidades** - Kanban drag & drop
- 📊 **Analytics em Tempo Real** - Dashboards e relatórios
- 📧 **Email Integrado** - Envio e rastreamento
- 📅 **Calendário** - Agendamento de reuniões
- 🤖 **Automações** - Workflows customizáveis
- 🔐 **Multiusuário** - Times e permissões
- 💳 **Sistema de Créditos** - Monetização integrada

---

## 🚀 Quick Start (5 minutos)

### Pré-requisitos

- Node.js 18+ e npm/pnpm/bun
- Conta no Supabase
- Git

### 1️⃣ Clonar e Instalar

\`\`\`bash
git clone https://github.com/uillenmachado/snapdoor.git
cd snapdoor
npm install
\`\`\`

### 2️⃣ Configurar Variáveis de Ambiente

Copie `.env.example` para `.env.local`:

\`\`\`bash
cp .env.example .env.local
\`\`\`

Preencha as variáveis:

\`\`\`env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...

# Hunter.io (opcional - enriquecimento de dados)
VITE_HUNTER_API_KEY=sua_chave_hunter

# Stripe (opcional - pagamentos)
VITE_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
\`\`\`

### 3️⃣ Aplicar Migrations

\`\`\`bash
# Via Supabase CLI (recomendado)
npx supabase db push

# OU manualmente no Supabase Dashboard:
# https://supabase.com/dashboard/project/[seu-projeto]/sql
# Cole o conteúdo de cada arquivo em supabase/migrations/
\`\`\`

### 4️⃣ Criar Conta Admin

\`\`\`bash
npm run bootstrap:admin
\`\`\`

Isso criará automaticamente:
- **Email**: admin@snapdoor.com
- **Senha**: SnapDoor2025!Admin
- **Créditos**: 999,999 (ilimitado)

### 5️⃣ Iniciar Desenvolvimento

\`\`\`bash
npm run dev
\`\`\`

Acesse: http://localhost:8080

---

## 📁 Estrutura do Projeto

\`\`\`
snapdoor/
├── src/
│   ├── components/          # Componentes React reutilizáveis
│   │   ├── ui/             # Componentes base (shadcn/ui)
│   │   ├── deals/          # Componentes de oportunidades
│   │   └── ...
│   ├── pages/              # Páginas da aplicação
│   │   ├── Dashboard.tsx   # Dashboard principal
│   │   ├── Leads.tsx       # Gestão de leads
│   │   ├── Deals.tsx       # Pipeline kanban
│   │   ├── Companies.tsx   # Gestão de empresas (NOVO)
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts      # Autenticação
│   │   ├── useLeads.ts     # Gestão de leads
│   │   ├── useDeals.ts     # Gestão de deals
│   │   └── ...
│   ├── services/           # Serviços e integrações
│   │   ├── leadService.ts
│   │   ├── dealService.ts
│   │   ├── companyService.ts
│   │   ├── emailService.ts
│   │   └── ...
│   ├── integrations/
│   │   └── supabase/       # Cliente e tipos Supabase
│   ├── lib/                # Utilitários
│   └── types/              # TypeScript types
│
├── supabase/
│   ├── migrations/         # Migrations SQL versionadas
│   └── functions/          # Edge Functions (Deno)
│       ├── linkedin-scraper/
│       ├── send-email/
│       └── process-workflow/
│
├── scripts/                # Scripts de automação
│   ├── bootstrap-admin.ts  # Criar conta admin
│   └── ...
│
├── docs/                   # Documentação completa
│   ├── REBUILD_MASTER_PLAN.md  # Plano de desenvolvimento
│   ├── USER_GUIDE.md          # Guia do usuário
│   └── API_REFERENCE.md       # Referência API
│
└── public/                 # Assets estáticos
\`\`\`

---

## 🗄️ Banco de Dados (Supabase)

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfis de usuários |
| `companies` | Empresas/organizações |
| `leads` | Contatos/leads |
| `deals` | Oportunidades de venda |
| `pipelines` | Funis de vendas |
| `stages` | Etapas dos funis |
| `activities` | Atividades/interações |
| `notes` | Notas e comentários |
| `emails` | Histórico de emails |
| `meetings` | Reuniões agendadas |
| `workflows` | Automações configuradas |
| `user_credits` | Sistema de créditos |
| `teams` | Times/equipes |
| `roles` | Papéis e permissões |

### Migrations

16 migrations aplicadas sequencialmente:

\`\`\`
✅ 20251009133602 - Initial setup
✅ 20251009133633 - Security policies
✅ 20251009140000 - Storage avatars
✅ 20251009150000 - Subscriptions
✅ 20251009160000 - Expand schema
✅ 20251009170000 - Security policies extended
✅ 20251010000000 - Credits system
✅ 20251010000001 - Fix tables
✅ 20251010000002 - Fix tables v2
✅ 20251010000003 - Dev account unlimited
✅ 20251010000004 - User credits RLS
✅ 20251010000005 - Leads source column
✅ 20251010000006 - LinkedIn enrichment fields
✅ 20251010000007 - Companies table
✅ 20251010000008 - Lead contacts table
✅ 20251010190000 - Deals structure
✅ 20251013000001 - Create admin user (NOVO)
\`\`\`

---

## 🔧 Tecnologias

### Frontend
- **React 18** - UI library
- **TypeScript 5** - Type safety
- **Vite** - Build tool
- **TanStack Query** - Data fetching & caching
- **React Router v6** - Routing
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **@dnd-kit** - Drag & drop
- **Recharts** - Gráficos e analytics
- **React Big Calendar** - Calendário
- **PapaParse + XLSX** - CSV/Excel

### Backend & Infraestrutura
- **Supabase** - Backend as a Service
  - PostgreSQL (database)
  - Auth (autenticação)
  - Storage (arquivos)
  - Edge Functions (serverless)
  - Realtime (websockets)
- **Deno** - Runtime para Edge Functions
- **SendGrid / Resend** - Envio de emails
- **Stripe** - Pagamentos

### DevOps & Tools
- **Git + GitHub** - Versionamento
- **ESLint + Prettier** - Linting
- **Vitest** - Testes unitários
- **Playwright** - Testes E2E
- **GitHub Actions** - CI/CD
- **Vercel / Netlify** - Hosting

---

## 🎨 Funcionalidades Detalhadas

### 1. Autenticação & Perfil
- ✅ Login com email/senha
- ✅ Login com Google OAuth
- ✅ Recuperação de senha
- ✅ Confirmação de email
- ✅ Perfil completo (foto, nome, configurações)
- ✅ Tema claro/escuro
- ✅ Configuração de idioma e fuso horário

### 2. Gestão de Empresas
- ✅ CRUD completo (criar, ler, atualizar, deletar)
- ✅ Listagem com busca e filtros
- ✅ Página de detalhe da empresa
- ✅ Leads vinculadas à empresa
- ✅ Deals vinculadas à empresa
- ✅ Informações de contato e redes sociais

### 3. Gestão de Leads
- ✅ CRUD completo de leads
- ✅ Múltiplos contatos por lead
- ✅ Histórico de interações
- ✅ Enriquecimento de dados (LinkedIn, Hunter.io)
- ✅ Score de qualificação
- ✅ Tags e campos customizados
- ✅ Conversão para oportunidade

### 4. Pipeline de Oportunidades (Kanban)
- ✅ Interface visual drag & drop
- ✅ Múltiplos pipelines customizáveis
- ✅ Estágios personalizáveis (cores, ordem)
- ✅ Cards com informações completas
- ✅ Ações rápidas (won/lost/delete/duplicate)
- ✅ Filtros avançados e agrupamentos
- ✅ Probabilidade de fechamento
- ✅ Valor previsto e realizado

### 5. Timeline & Histórico
- ✅ Timeline cronológica completa
- ✅ Tipos de atividade (email, call, meeting, note)
- ✅ Registro automático de mudanças
- ✅ Histórico de estágios
- ✅ Filtros por tipo e período

### 6. Sistema de Email
- ✅ Composição de emails no CRM
- ✅ Templates com variáveis (merge fields)
- ✅ Agendamento de envio
- ✅ Rastreamento de aberturas/cliques
- ✅ Sincronização de caixa de entrada (IMAP)
- ✅ Relacionamento automático (lead/deal/empresa)

### 7. Calendário & Reuniões
- ✅ Calendário visual (mensal, semanal, diário)
- ✅ Agendamento de reuniões
- ✅ Sincronização Google Calendar
- ✅ Sincronização Office 365
- ✅ Lembretes automáticos por email
- ✅ Histórico de reuniões

### 8. Importação / Exportação
- ✅ Importação CSV/Excel com wizard
- ✅ Mapeamento de colunas
- ✅ Validação de dados
- ✅ Exportação filtrada
- ✅ Relatórios em PDF
- ✅ Bulk operations

### 9. Automação & Workflows
- ✅ Editor visual de automações
- ✅ Gatilhos configuráveis:
  - Mudança de estágio
  - Tempo sem atividade
  - Novo lead criado
  - Deal ganho/perdido
- ✅ Ações automatizadas:
  - Enviar email
  - Criar tarefa
  - Enviar notificação
  - Atualizar campo
- ✅ Condições lógicas (if/then/else)

### 10. Dashboards & Analytics
- ✅ Dashboard principal com widgets
- ✅ Métricas em tempo real:
  - Total de leads/deals
  - Taxa de conversão
  - Receita prevista vs realizada
  - Tempo médio de ciclo
- ✅ Gráficos interativos (Recharts):
  - Funil de vendas
  - Tendências mensais
  - Performance por usuário
  - Distribuição por fonte
- ✅ Filtros por período, pipeline, usuário
- ✅ Exportação de relatórios

### 11. Multiusuário & Permissões
- ✅ Sistema de times/equipes
- ✅ Papéis configuráveis:
  - Super Admin
  - Admin
  - Manager
  - User
- ✅ Permissões granulares
- ✅ Visibilidade de dados configurável
- ✅ Transferência de propriedade
- ✅ Convite de usuários por email

### 12. Scraper & Enriquecimento
- ✅ LinkedIn scraper (Edge Function)
- ✅ Extração de dados públicos
- ✅ Criação automática de empresa
- ✅ Queue de processamento
- ✅ Logs detalhados
- ✅ Rate limiting
- ✅ Retry logic
- ✅ Hunter.io integration

### 13. Sistema de Créditos & Monetização
- ✅ Créditos por usuário
- ✅ Cobrança por ação (enriquecimento)
- ✅ Pacotes de créditos
- ✅ Histórico de uso
- ✅ Integração Stripe
- ✅ Assinaturas recorrentes

---

## 🧪 Testes

### Executar Testes

\`\`\`bash
# Testes unitários
npm run test

# Testes com cobertura
npm run test:coverage

# Testes E2E
npm run test:e2e

# Watch mode (desenvolvimento)
npm run test:watch
\`\`\`

### Cobertura

Meta: > 70% de cobertura de código

---

## 📦 Deploy

### Deploy Automático (Vercel)

\`\`\`bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
\`\`\`

### Deploy Manual

\`\`\`bash
# Build
npm run build

# Preview
npm run preview

# Os arquivos estarão em dist/
\`\`\`

### Variáveis de Ambiente (Produção)

Configure no Vercel/Netlify Dashboard:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_HUNTER_API_KEY`
- `VITE_STRIPE_PUBLIC_KEY`

---

## 🔐 Segurança

- ✅ Row Level Security (RLS) em todas as tabelas
- ✅ HTTPS obrigatório
- ✅ JWT tokens com expiração
- ✅ CORS configurado
- ✅ Rate limiting em Edge Functions
- ✅ Sanitização de inputs
- ✅ Prepared statements (SQL injection)
- ✅ XSS protection
- ✅ CSRF tokens

---

## 📚 Documentação

- [Plano Mestre de Reconstrução](docs/REBUILD_MASTER_PLAN.md) - Roadmap completo
- [Guia do Usuário](docs/USER_GUIDE.md) - Como usar o sistema
- [Referência API](docs/API_REFERENCE.md) - Documentação técnica
- [Guia de Contribuição](docs/CONTRIBUTING.md) - Como contribuir

---

## 🤝 Suporte & Comunidade

- **Issues**: [GitHub Issues](https://github.com/uillenmachado/snapdoor/issues)
- **Discussions**: [GitHub Discussions](https://github.com/uillenmachado/snapdoor/discussions)
- **Email**: support@snapdoor.com

---

## 📝 License

Proprietary - © 2025 SnapDoor. Todos os direitos reservados.

---

## 🎯 Roadmap

### ✅ Versão 1.0 (Atual)
- Sistema básico de CRM
- Pipeline kanban
- Gestão de leads
- Autenticação

### 🚧 Versão 2.0 (Em Desenvolvimento)
- Gestão de empresas
- Sistema de email
- Calendário integrado
- Automações
- Dashboards avançados
- Multiusuário completo

### 📅 Versão 3.0 (Planejado)
- Mobile app (React Native)
- Inteligência artificial (AI)
- WhatsApp integration
- API pública
- Marketplace de integrações

---

## 👨‍💻 Desenvolvido por

**Uillen Machado**
- GitHub: [@uillenmachado](https://github.com/uillenmachado)
- LinkedIn: [/in/uillenmachado](https://linkedin.com/in/uillenmachado)

---

**🚀 SnapDoor - O CRM que impulsiona suas vendas!**
