# 📦 Inventário do Frontend Atual - SnapDoor CRM

**Data:** 15 de outubro de 2025  
**Objetivo:** Documentar estado atual do frontend antes das modificações  
**Projeto:** SnapDoor CRM

---

## 🏗️ Arquitetura e Stack Tecnológico

### Tecnologias Core
- **Framework:** React 18.3.1
- **Build Tool:** Vite 7.1.10
- **Linguagem:** TypeScript 5.5
- **Roteamento:** React Router DOM 6.30.1
- **State Management:** TanStack Query (React Query) 5.83.0
- **Estilização:** TailwindCSS 3 + tailwindcss-animate
- **Biblioteca UI:** Shadcn/UI (componentes Radix UI)
- **Ícones:** Lucide React 0.462.0
- **Drag & Drop:** @dnd-kit 6.3.1
- **Backend:** Supabase (PostgreSQL + Auth + Storage)

### Bibliotecas de Componentes
- **@radix-ui/react-*** - 27 componentes primitivos
- **cmdk** - Command palette
- **sonner** - Toast notifications
- **vaul** - Drawer component
- **react-hook-form** + **@hookform/resolvers** - Formulários
- **date-fns** - Manipulação de datas
- **recharts** - Gráficos e charts
- **react-big-calendar** - Calendário

---

## 🎨 Design System Atual

### Cores (src/index.css)

**Light Mode:**
```css
--background: 0 0% 98%           /* Cinza muito claro */
--foreground: 210 11% 15%        /* Texto escuro */
--card: 0 0% 100%                /* Branco */
--primary: 157 100% 33%          /* Verde SnapDoor */
--secondary: 257 82% 61%         /* Roxo SnapDoor */
--muted: 210 40% 96.1%           /* Cinza claro */
--accent: 157 76% 91%            /* Verde claro */
--destructive: 0 84.2% 60.2%     /* Vermelho */
--border: 214.3 31.8% 91.4%      /* Bordas */
--sidebar-background: 210 11% 10% /* Sidebar escura */
```

**Dark Mode:**
```css
--background: 210 11% 10%        /* Quase preto */
--foreground: 0 0% 98%           /* Texto claro */
--card: 210 11% 15%              /* Cinza escuro */
--primary: 157 100% 33%          /* Verde (mesmo) */
--secondary: 257 82% 61%         /* Roxo (mesmo) */
```

**Análise:**
- ✅ Sistema HSL completo
- ✅ Dark mode implementado
- ✅ Cores de marca definidas (Verde + Roxo)
- ⚠️ Falta paleta expandida de neutros
- ⚠️ Falta cores de status diversificadas

### Tipografia

**Font Family:** System fonts (não definida explicitamente)
**Tamanhos:** Padrões do Tailwind (text-xs a text-3xl)
**Pesos:** Padrões do Tailwind (font-normal, font-medium, font-semibold, font-bold)

**Análise:**
- ✅ Usa system fonts (performance)
- ⚠️ Não há escala tipográfica customizada documentada
- ⚠️ Falta definição explícita de line-heights

### Espaçamentos

**Raios:** 
```css
--radius: 0.5rem /* 8px - valor base */
/* Derivados: lg, md, sm calculados a partir da base */
```

**Análise:**
- ✅ Usa escala de espaçamento do Tailwind (padrão 4px)
- ⚠️ Não há customização específica de spacing

### Sombras

**Análise:**
- ⚠️ Não há customização de sombras
- ✅ Usa sombras padrão do Tailwind

---

## 📁 Estrutura de Componentes

### Componentes UI Base (src/components/ui/)
48 arquivos de componentes primitivos baseados em Radix UI:

**Navegação e Layout:**
- accordion, breadcrumb, menubar, navigation-menu, sidebar, tabs, resizable

**Formulários:**
- button, input, textarea, select, checkbox, radio-group, switch, slider
- label, form, input-otp, calendar, command

**Feedback:**
- alert, alert-dialog, toast, toaster, sonner, progress, skeleton

**Overlay:**
- dialog, drawer, sheet, popover, hover-card, tooltip, context-menu, dropdown-menu

**Dados:**
- table, card, avatar, badge, separator, scroll-area

**Outros:**
- aspect-ratio, carousel, chart, collapsible, pagination, toggle, toggle-group

**Análise:**
- ✅ Biblioteca completa de componentes primitivos
- ✅ Baseado em Radix UI (acessível por padrão)
- ✅ Styled com Tailwind
- ⚠️ Componentes usam padrão atual, precisam ajuste visual Pipedrive

### Componentes de Domínio (src/components/)

**Visualizações:**
- DealKanbanBoard.tsx - Board kanban de negócios
- KanbanBoard.tsx - Board kanban genérico
- DealCard.tsx - Card de negócio
- LeadCard.tsx - Card de lead
- TaskCard.tsx - Card de tarefa
- AnalyticsDashboard.tsx - Dashboard de analytics
- DashboardMetrics.tsx - Métricas do dashboard

**Navegação:**
- AppSidebar.tsx - Sidebar principal (11 itens de menu)
- GlobalSearch.tsx - Busca global (Cmd+K)
- NotificationBell.tsx - Sino de notificações

**Dialogs/Modais:**
- AddLeadDialog.tsx - Adicionar lead
- CreditPurchaseDialog.tsx - Comprar créditos
- InsufficientCreditsDialog.tsx - Créditos insuficientes
- SnapDoorAIDialog.tsx - IA assistente
- OnboardingDialog.tsx - Onboarding
- CompanyFormDialog.tsx - Formulário de empresa
- TaskFormDialog.tsx - Formulário de tarefa
- ExportDialog.tsx - Exportar dados
- ImportWizard.tsx - Importar dados

**Detalhes:**
- LeadDetails.tsx - Detalhes de lead
- LeadHistorySection.tsx - Histórico de lead
- MultipleContacts.tsx - Múltiplos contatos
- RelatedTasksSection.tsx - Tarefas relacionadas

**Widgets:**
- DashboardWidgets/ (pasta)
- TasksWidget.tsx - Widget de tarefas
- MeetingsWidget.tsx - Widget de reuniões
- ActivityFeed.tsx - Feed de atividades
- Calendar.tsx - Calendário
- MeetingScheduler.tsx - Agendador de reuniões

**Listas:**
- TaskList.tsx - Lista de tarefas

**Configurações:**
- InviteUser.tsx - Convidar usuário
- RoleManager.tsx - Gerenciar roles

**Automações:**
- WorkflowEditor.tsx - Editor de workflows
- TriggerConfig.tsx - Configuração de triggers
- ActionConfig.tsx - Configuração de ações

**Outros:**
- EditableField.tsx - Campo editável inline
- LoadingSkeleton.tsx - Skeleton loader
- UsageLimits.tsx - Limites de uso
- ProtectedRoute.tsx - Rota protegida
- ErrorBoundary.tsx - Error boundary
- theme-provider.tsx - Provider de tema

**Análise:**
- ✅ Componentes bem organizados por domínio
- ✅ Separação clara entre UI base e domínio
- ⚠️ Alguns componentes precisam ajuste visual
- ⚠️ Falta padronização de layout em detalhes

---

## 📄 Páginas (src/pages/)

### Páginas Principais
- **Index.tsx** - Landing page
- **Dashboard.tsx** - Dashboard principal (simplificado)
- **Pipelines.tsx** - Página dedicada de pipelines (nova)
- **Deals.tsx** - Lista de negócios
- **DealDetail.tsx** - Detalhe de negócio
- **Leads.tsx** - Lista de leads
- **LeadProfile.tsx** - Perfil de lead
- **Companies.tsx** - Lista de empresas
- **CompanyDetail.tsx** - Detalhe de empresa
- **Activities.tsx** - Atividades
- **Meetings.tsx** - Reuniões
- **Reports.tsx** - Relatórios
- **Automations.tsx** - Automações
- **ScraperLogs.tsx** - Logs do scraper
- **Settings.tsx** - Configurações
- **TeamSettings.tsx** - Configurações de equipe
- **Profile.tsx** - Perfil do usuário
- **Help.tsx** - Ajuda
- **Pricing.tsx** - Preços

### Páginas de Autenticação
- **Login.tsx** - Login
- **Signup.tsx** - Cadastro
- **ConfirmEmail.tsx** - Confirmação de email

### Páginas de Erro
- **NotFound.tsx** - 404

### Arquivos Legados
- **Activities_OLD.tsx.bak** - Backup
- **DealDetail_OLD.tsx** - Versão antiga

**Análise:**
- ✅ 24 páginas ativas
- ✅ Rotas bem organizadas
- ✅ Separação clara de concerns
- ⚠️ Algumas páginas precisam layout padronizado
- ⚠️ Falta consistência visual entre páginas

---

## 🎯 Estado Atual do UI/UX

### Pontos Fortes
✅ **Design system base** - Cores e componentes definidos  
✅ **Dark mode** - Implementado e funcional  
✅ **Componentização** - Boa separação de componentes  
✅ **Acessibilidade base** - Radix UI é acessível por padrão  
✅ **Responsividade** - Tailwind facilita layouts responsivos  
✅ **Performance** - Vite + lazy loading  

### Áreas de Melhoria
⚠️ **Hierarquia visual** - Falta clareza em alguns elementos  
⚠️ **Consistência** - Variações de padrão entre páginas  
⚠️ **Espaçamentos** - Algumas áreas muito densas  
⚠️ **Contraste** - Alguns elementos podem não atingir AA  
⚠️ **Feedbacks visuais** - Estados de loading/erro inconsistentes  
⚠️ **Navegação** - Sidebar e topbar podem ser melhorados  
⚠️ **Pipeline board** - Pode seguir mais de perto padrão Pipedrive  
⚠️ **Listas/tabelas** - Falta filtros avançados padronizados  
⚠️ **Detail views** - Layout pode ser mais estruturado em painéis  

---

## 🔌 Integrações e Hooks

### Hooks Customizados (src/hooks/)
- useAuth.ts - Autenticação
- useLeads.ts - Leads
- useDeals.ts - Negócios
- usePipelines.ts - Pipelines
- useActivities.ts - Atividades
- useNotes.ts - Notas
- useCredits.ts - Créditos
- useSubscription.ts - Assinatura
- useProfile.ts - Perfil
- useAnalytics.ts - Analytics
- useAutomations.ts - Automações
- useStripe.ts - Stripe
- useLeadHistory.ts - Histórico de lead
- useEnrichLead.ts - Enriquecimento de lead
- use-toast.ts - Toast
- use-mobile.tsx - Mobile detection

**Análise:**
- ✅ Hooks bem organizados
- ✅ Separação de concerns
- ✅ Uso de React Query para cache
- ⚠️ Não devem ser alterados (regra do projeto)

### Serviços (src/services/)
- companyService.ts - Serviço de empresas
- hunterClient.ts - Cliente Hunter.io
- leadDiscoveryService.ts - Descoberta de leads
- leadEnrichmentService.ts - Enriquecimento de leads
- linkedinScraperService.ts - Scraper LinkedIn
- smartProspectionService.ts - Prospecção inteligente

**Análise:**
- ✅ Serviços bem separados
- ✅ Integrações com APIs externas
- ⚠️ Não devem ser alterados (regra do projeto)

---

## 📊 Análise de Bundle Atual

**Build de Produção (último):**
- Tempo de build: 1m 5s
- Módulos transformados: 4.052
- Chunks gerados: 46
- Bundle total: ~2.7 MB
- Bundle gzipped: 814 KB

**Principais Bundles:**
- vendor-*.js: 2.375 MB (735 KB gzip) - React, Supabase, Radix
- vendor-charts-*.js: 267 KB (58 KB gzip) - Recharts
- Pipelines-*.js: 11.6 KB (4.0 KB gzip)
- Dashboard-*.js: 14.5 KB (4.5 KB gzip)
- AppSidebar-*.js: 26.1 KB (7.3 KB gzip)

**Análise:**
- ✅ Code splitting ativo
- ✅ Lazy loading de rotas
- ✅ Tamanho aceitável para CRM
- ⚠️ Vendor bundle grande (normal para CRM complexo)

---

## 🎯 Gap Analysis (Atual vs Pipedrive)

### O Que Já Temos
✅ Sidebar recolhível  
✅ Pipeline board com kanban  
✅ Drag & drop funcional  
✅ Cards de negócios  
✅ Dark mode  
✅ Busca global (Cmd+K)  
✅ Notificações  
✅ Modais e dialogs  
✅ Toast notifications  
✅ Formulários com validação  
✅ Tabelas básicas  

### O Que Precisa Melhorar
⚠️ **Topbar** - Precisa ser fixa e mais proeminente  
⚠️ **Pipeline headers** - Falta contagem e valor total  
⚠️ **Deal cards** - Precisam ser mais informativas  
⚠️ **Listas** - Falta filtros salvos e ações em lote  
⚠️ **Detail panels** - Layout precisa ser em painéis 70/30  
⚠️ **Empty states** - Precisam ser mais amigáveis  
⚠️ **Loading states** - Precisam skeleton loaders  
⚠️ **Modais** - Padronizar footer e validação  
⚠️ **Contraste** - Validar WCAG AA em todos os elementos  
⚠️ **Focus states** - Melhorar visibilidade do foco  

---

## 🚀 Recomendações para Implementação

### Fase 1: Tokens e Base (Prioridade Alta)
1. Expandir paleta de cores neutras (gray-50 a gray-900)
2. Definir cores de status (blue, green, yellow, red, purple)
3. Customizar tipografia (font sizes, weights, line heights)
4. Definir sombras (sm, md, lg, xl)
5. Documentar espaçamentos customizados

### Fase 2: Componentes UI (Prioridade Alta)
1. Ajustar Button - Estados hover/active/disabled
2. Ajustar Card - Sombras e bordas
3. Ajustar Table - Headers, bordas, hover
4. Ajustar Modal - Footer padronizado
5. Ajustar Toast - Posicionamento e cores
6. Criar Skeleton - Para loading states
7. Criar EmptyState - Componente reutilizável

### Fase 3: AppShell (Prioridade Alta)
1. Topbar fixa com sombra
2. Breadcrumb/título de página
3. Ações rápidas (+ Novo)
4. Busca global proeminente
5. Notificações + avatar
6. Sidebar com seções visuais
7. Ícones + labels claros

### Fase 4: Pipeline Board (Prioridade Alta)
1. Headers com contagem + valor
2. Cards mais informativos
3. Quick actions ao hover
4. Cores de etapa sutis
5. Espaçamento generoso
6. Drag feedback visual

### Fase 5: Listas e Filtros (Prioridade Média)
1. Filtros salvos
2. Busca em tempo real
3. Ordenação por coluna
4. Seleção em lote
5. Ações contextuais
6. Paginação

### Fase 6: Detail Views (Prioridade Média)
1. Layout 70/30
2. Tabs para seções
3. Timeline lateral
4. Edição inline
5. Quick actions no topo

### Fase 7: Acessibilidade (Prioridade Alta)
1. Validar contraste de todos os textos
2. Estados de foco visíveis
3. Navegação por teclado
4. ARIA labels
5. Screen reader testing

### Fase 8: Documentação (Prioridade Média)
1. STYLEGUIDE.md
2. UI_UPGRADE_REPORT.md
3. Atualizar README.md
4. CHANGELOG.md

---

## ✅ Checklist de Preservação

### Não Alterar (Crítico)
- [ ] Hooks de dados (useLeads, useDeals, etc)
- [ ] Serviços de integração (Hunter, LinkedIn scraper)
- [ ] Schemas do Supabase
- [ ] Lógica de autenticação
- [ ] Lógica de negócio nos componentes
- [ ] Endpoints e queries
- [ ] Estrutura de dados
- [ ] Permissões e roles

### Preservar Funcionalidades (Crítico)
- [ ] Drag & drop no kanban
- [ ] CRUD de negócios/leads
- [ ] Busca global (Cmd+K)
- [ ] Filtros existentes
- [ ] Notificações
- [ ] Dark mode
- [ ] Autenticação
- [ ] Integração Stripe
- [ ] Enriquecimento de leads
- [ ] Automações
- [ ] Calendário
- [ ] Exportação de dados

---

## 📊 Métricas Baseline (Antes das Mudanças)

### Performance
- **Build Time:** 1m 5s
- **Bundle Size:** 814 KB gzipped
- **Chunks:** 46
- **TTI:** Não medido (estimar depois)

### Qualidade
- **TypeScript Errors:** 0 críticos
- **Lint Errors:** 0 críticos
- **Warnings:** 54 aceitáveis
- **Tests:** Configurado (vitest)

### Acessibilidade
- **Contraste:** Não validado sistematicamente
- **Navegação Teclado:** Parcial
- **ARIA:** Básico (via Radix)
- **Screen Reader:** Não testado

---

## 🎯 Objetivos de Melhoria

### Visuais
- [ ] Aparência profissional equivalente ao Pipedrive
- [ ] Hierarquia visual clara e consistente
- [ ] Espaçamentos generosos e respiração
- [ ] Cores e contrastes profissionais
- [ ] Estados visuais claros (hover, active, disabled)

### Funcionais
- [ ] Zero regressões
- [ ] Todas as funcionalidades preservadas
- [ ] Performance mantida ou melhorada
- [ ] Build passando sem erros

### Acessibilidade
- [ ] 100% contraste WCAG 2.2 AA
- [ ] Navegação por teclado completa
- [ ] Estados de foco visíveis
- [ ] ARIA apropriado
- [ ] Screen reader friendly

### Documentação
- [ ] Styleguide completo
- [ ] Tokens documentados
- [ ] Componentes com exemplos
- [ ] Diretrizes de uso
- [ ] Changelog detalhado

---

**Documento criado por:** GitHub Copilot AI Engineer  
**Data:** 15 de outubro de 2025  
**Versão:** 1.0  
**Status:** ✅ Inventário Completo
