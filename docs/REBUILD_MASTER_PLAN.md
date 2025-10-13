# 🚀 PLANO MESTRE DE RECONSTRUÇÃO - SNAPDOOR CRM

**Data**: 13 de outubro de 2025  
**Objetivo**: Transformar SnapDoor em SaaS comercial completo e funcional  
**Status**: EM PLANEJAMENTO

---

## 📊 ANÁLISE DO ESTADO ATUAL

### ✅ O QUE JÁ TEMOS (INFRAESTRUTURA)

#### Backend & Database (Supabase)
- ✅ 16 migrations aplicadas (schema completo)
- ✅ Autenticação configurada (auth.users)
- ✅ Tabelas principais:
  - `profiles` - Perfis de usuários
  - `companies` - Empresas
  - `leads` - Leads/contatos
  - `deals` - Oportunidades de venda
  - `pipelines` - Funis de vendas
  - `stages` - Etapas dos funis
  - `activities` - Atividades/interações
  - `notes` - Notas
  - `subscriptions` - Assinaturas/planos
  - `user_credits` - Sistema de créditos
  - `credit_usage_history` - Histórico de uso
  - `credit_packages` - Pacotes disponíveis
  - `credit_purchases` - Compras realizadas
  - `lead_contacts` - Contatos múltiplos
  - `scraper_logs` - Logs de scraping

- ✅ RLS (Row Level Security) configurado
- ✅ Edge Functions deployadas:
  - `linkedin-scraper` - Extração de perfis LinkedIn

#### Frontend (React + TypeScript)
- ✅ Páginas existentes:
  - Login / Signup
  - Dashboard
  - Leads (lista)
  - LeadProfile (detalhe)
  - Deals (lista)
  - DealDetail
  - Activities
  - Reports
  - Settings
  - Pricing
  
- ✅ Componentes UI (shadcn/ui)
- ✅ Hooks customizados (useLeads, useDeals, useAuth, etc)
- ✅ Tema claro/escuro
- ✅ Integração Hunter.io (email finder)

### ❌ O QUE FALTA IMPLEMENTAR (GAPS)

#### 1. Autenticação & Onboarding
- ❌ Conta master/admin automática no primeiro deploy
- ❌ Fluxo de confirmação de email
- ❌ Recuperação de senha funcional
- ❌ Perfil de usuário completo (foto, idioma, fuso)
- ❌ Onboarding guiado para novos usuários

#### 2. Empresas (Companies)
- ❌ Página de listagem de empresas
- ❌ CRUD completo de empresas
- ❌ Página de detalhe da empresa
- ❌ Relacionamento empresa → leads
- ❌ Relacionamento empresa → deals

#### 3. Pipeline Kanban
- ❌ Drag & drop funcional entre estágios
- ❌ Persistência de mudanças no banco
- ❌ Ações rápidas nos cards (won/lost/delete)
- ❌ Filtros avançados
- ❌ Agrupamentos customizados

#### 4. Timeline & Histórico
- ❌ Timeline cronológica completa
- ❌ Registro de todas interações
- ❌ Histórico de mudanças de estágio
- ❌ Histórico de emails vinculados

#### 5. Email & Integração
- ❌ Envio de email direto do CRM
- ❌ Templates de email com merge fields
- ❌ Agendamento de envio
- ❌ Sincronização IMAP/OAuth
- ❌ Rastreamento de aberturas/cliques
- ❌ Registro automático de emails no CRM

#### 6. Calendário & Reuniões
- ❌ Agendamento de reuniões
- ❌ Integração Google Calendar
- ❌ Integração Office 365
- ❌ Lembretes automáticos
- ❌ Sincronização bidirecional

#### 7. Importação / Exportação
- ❌ Interface de importação CSV/Excel
- ❌ Mapeamento de campos
- ❌ Validação de dados
- ❌ Exportação filtrada
- ❌ Relatórios em PDF

#### 8. Automação / Workflows
- ❌ Editor visual de automações
- ❌ Gatilhos configuráveis
- ❌ Ações automáticas
- ❌ Condições lógicas
- ❌ Templates de workflows

#### 9. Dashboards & Relatórios
- ❌ Métricas em tempo real
- ❌ Gráficos interativos (recharts/victory)
- ❌ Funil de vendas visual
- ❌ Taxa de conversão por estágio
- ❌ Tempo médio de ciclo
- ❌ Receita prevista vs realizada
- ❌ Relatórios exportáveis

#### 10. Multiusuário & Permissões
- ❌ Sistema de times/equipes
- ❌ Papéis (admin, manager, user)
- ❌ Permissões granulares
- ❌ Visibilidade de dados
- ❌ Transferência de propriedade

#### 11. Scraper & Enriquecimento
- ✅ LinkedIn scraper (básico)
- ❌ Criação automática de empresa
- ❌ Logs detalhados
- ❌ Limites por usuário
- ❌ Queue de processamento
- ❌ API premium integrada

---

## 🎯 PLANO DE EXECUÇÃO (15 FASES)

### FASE 1: Fundação & Setup (DIA 1)
**Objetivo**: Preparar ambiente e criar conta master

**Tarefas**:
1. ✅ Criar migration para admin user
2. ✅ Script de bootstrap (create-admin.ts)
3. ✅ Variáveis de ambiente completas
4. ✅ README atualizado com instruções
5. ✅ Verificar todas migrations aplicadas

**Arquivos**:
- `supabase/migrations/20251013000001_create_admin_user.sql`
- `scripts/bootstrap-admin.ts`
- `.env.example` (atualizado)
- `README.md` (setup completo)

---

### FASE 2: Autenticação Completa (DIA 1-2)
**Objetivo**: Sistema de auth robusto e profissional

**Tarefas**:
1. ✅ Confirmação de email funcional
2. ✅ Recuperação de senha
3. ✅ Página de perfil completa
4. ✅ Upload de avatar
5. ✅ Configurações de idioma/tema/fuso

**Arquivos**:
- `src/pages/Profile.tsx` (novo)
- `src/hooks/useProfile.ts` (melhorado)
- `src/components/ProfileSettings.tsx` (novo)
- `src/components/AvatarUpload.tsx` (novo)

---

### FASE 3: Gestão de Empresas (DIA 2-3)
**Objetivo**: CRUD completo de empresas

**Tarefas**:
1. ✅ Página de listagem
2. ✅ Formulário de criação/edição
3. ✅ Página de detalhe
4. ✅ Busca e filtros
5. ✅ Paginação
6. ✅ Relacionamentos com leads/deals

**Arquivos**:
- `src/pages/Companies.tsx` (novo)
- `src/pages/CompanyDetail.tsx` (novo)
- `src/components/CompanyForm.tsx` (novo)
- `src/components/CompanyCard.tsx` (novo)
- `src/hooks/useCompanies.ts` (novo)
- `src/services/companyService.ts` (melhorado)

---

### FASE 4: Pipeline Kanban Avançado (DIA 3-4)
**Objetivo**: Kanban completo com drag & drop

**Tarefas**:
1. ✅ Instalar @dnd-kit/core
2. ✅ Implementar drag & drop
3. ✅ Persistência no banco
4. ✅ Animações suaves
5. ✅ Ações rápidas (won/lost)
6. ✅ Filtros e agrupamentos

**Arquivos**:
- `src/components/KanbanBoard.tsx` (melhorado)
- `src/components/DealCard.tsx` (melhorado)
- `src/components/DealFilters.tsx` (novo)
- `src/hooks/useDeals.ts` (melhorado)

---

### FASE 5: Timeline & Histórico (DIA 4-5)
**Objetivo**: Registro completo de interações

**Tarefas**:
1. ✅ Componente Timeline
2. ✅ Tipos de atividade (email, call, meeting, note)
3. ✅ Filtros por tipo/data
4. ✅ Registro automático de mudanças
5. ✅ Histórico de estágios

**Arquivos**:
- `src/components/Timeline.tsx` (novo)
- `src/components/TimelineItem.tsx` (novo)
- `src/components/ActivityForm.tsx` (novo)
- `src/hooks/useActivities.ts` (melhorado)
- `supabase/migrations/20251013000002_activity_logs.sql`

---

### FASE 6: Sistema de Email (DIA 5-7)
**Objetivo**: Envio e rastreamento de emails

**Tarefas**:
1. ✅ Integração SendGrid/Resend
2. ✅ Componente de composição
3. ✅ Templates com variáveis
4. ✅ Agendamento de envio
5. ✅ Rastreamento de aberturas
6. ✅ Sincronização IMAP (básico)

**Arquivos**:
- `supabase/functions/send-email/index.ts` (novo)
- `supabase/functions/track-email/index.ts` (novo)
- `supabase/migrations/20251013000003_email_system.sql`
- `src/components/EmailComposer.tsx` (novo)
- `src/components/EmailTemplates.tsx` (novo)
- `src/hooks/useEmails.ts` (novo)

---

### FASE 7: Calendário & Reuniões (DIA 7-8)
**Objetivo**: Integração com calendários externos

**Tarefas**:
1. ✅ Componente de calendário (react-big-calendar)
2. ✅ Agendamento de reuniões
3. ✅ Integração Google Calendar (OAuth)
4. ✅ Sincronização bidirecional
5. ✅ Lembretes por email

**Arquivos**:
- `supabase/migrations/20251013000004_meetings_calendar.sql`
- `src/components/Calendar.tsx` (novo)
- `src/components/MeetingScheduler.tsx` (novo)
- `src/hooks/useMeetings.ts` (novo)
- `src/services/calendarService.ts` (novo)

---

### FASE 8: Importação/Exportação (DIA 8-9)
**Objetivo**: Interface para CSV/Excel

**Tarefas**:
1. ✅ Upload de arquivos
2. ✅ Parser CSV/Excel (papaparse/xlsx)
3. ✅ Mapeamento de colunas
4. ✅ Validação de dados
5. ✅ Exportação filtrada
6. ✅ Relatórios PDF (jsPDF)

**Arquivos**:
- `src/components/ImportWizard.tsx` (novo)
- `src/components/ExportDialog.tsx` (novo)
- `src/services/importService.ts` (novo)
- `src/services/exportService.ts` (novo)

---

### FASE 9: Automação & Workflows (DIA 9-11)
**Objetivo**: Editor visual de automações

**Tarefas**:
1. ✅ Migration para workflows
2. ✅ Editor de regras
3. ✅ Gatilhos (stage change, time-based)
4. ✅ Ações (email, task, notification)
5. ✅ Processador de workflows (Edge Function)

**Arquivos**:
- `supabase/migrations/20251013000005_workflows.sql`
- `supabase/functions/process-workflow/index.ts` (novo)
- `src/pages/Automations.tsx` (novo)
- `src/components/WorkflowEditor.tsx` (novo)
- `src/components/TriggerConfig.tsx` (novo)
- `src/components/ActionConfig.tsx` (novo)

---

### FASE 10: Dashboards Avançados (DIA 11-12)
**Objetivo**: Analytics e métricas em tempo real

**Tarefas**:
1. ✅ Dashboard com widgets
2. ✅ Gráficos (recharts)
3. ✅ Métricas de conversão
4. ✅ Funil de vendas
5. ✅ Previsão de receita
6. ✅ Filtros por período

**Arquivos**:
- `src/pages/Dashboard.tsx` (melhorado)
- `src/components/DashboardWidgets/` (novos)
- `src/components/charts/` (novos)
- `src/hooks/useAnalytics.ts` (melhorado)

---

### FASE 11: Multiusuário & Permissões (DIA 12-13)
**Objetivo**: Sistema de times e papéis

**Tarefas**:
1. ✅ Migration para teams e roles
2. ✅ Convite de usuários
3. ✅ Gerenciamento de permissões
4. ✅ Visibilidade de dados
5. ✅ Transferência de propriedade

**Arquivos**:
- `supabase/migrations/20251013000006_teams_roles.sql`
- `src/pages/TeamSettings.tsx` (novo)
- `src/components/InviteUser.tsx` (novo)
- `src/components/RoleManager.tsx` (novo)
- `src/hooks/useTeam.ts` (novo)

---

### FASE 12: Scraper Avançado (DIA 13-14)
**Objetivo**: Sistema robusto de enriquecimento

**Tarefas**:
1. ✅ Queue de processamento
2. ✅ Criação automática de empresa
3. ✅ Logs detalhados
4. ✅ Rate limiting
5. ✅ Retry logic
6. ✅ Interface de monitoramento

**Arquivos**:
- `supabase/functions/linkedin-scraper/index.ts` (melhorado)
- `supabase/functions/process-scraper-queue/index.ts` (novo)
- `supabase/migrations/20251013000007_scraper_queue.sql`
- `src/pages/ScraperLogs.tsx` (novo)

---

### FASE 13: Otimização & Performance (DIA 14)
**Objetivo**: App rápido e responsivo

**Tarefas**:
1. ✅ Lazy loading de rotas
2. ✅ Code splitting
3. ✅ Otimização de imagens
4. ✅ Caching estratégico
5. ✅ Paginação virtual
6. ✅ Debouncing de buscas

**Arquivos**:
- `vite.config.ts` (otimizado)
- `src/lib/imageOptimizer.ts` (novo)
- `src/hooks/useVirtualList.ts` (novo)

---

### FASE 14: Testes & Qualidade (DIA 14-15)
**Objetivo**: Cobertura de testes

**Tarefas**:
1. ✅ Testes unitários (vitest)
2. ✅ Testes de integração
3. ✅ Testes E2E (playwright)
4. ✅ Cobertura > 70%

**Arquivos**:
- `src/**/*.test.tsx` (novos)
- `playwright.config.ts` (novo)

---

### FASE 15: Deploy & Documentação (DIA 15)
**Objetivo**: Pronto para produção

**Tarefas**:
1. ✅ Setup CI/CD (GitHub Actions)
2. ✅ Deploy Vercel/Netlify
3. ✅ Monitoramento (Sentry)
4. ✅ Documentação completa
5. ✅ Videos tutoriais

**Arquivos**:
- `.github/workflows/deploy.yml` (novo)
- `docs/USER_GUIDE.md` (novo)
- `docs/API_REFERENCE.md` (novo)

---

## 📦 STACK TECNOLÓGICO FINAL

### Frontend
- React 18 + TypeScript
- Vite (build)
- TanStack Query (state)
- React Router v6 (routing)
- shadcn/ui (components)
- Tailwind CSS (styling)
- @dnd-kit (drag & drop)
- recharts (gráficos)
- react-big-calendar (calendário)
- papaparse + xlsx (CSV/Excel)
- jsPDF (PDFs)

### Backend & Database
- Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- Deno (Edge Functions runtime)
- SendGrid/Resend (emails)
- Stripe (pagamentos)

### DevOps & Tools
- Git + GitHub
- Vercel/Netlify (hosting)
- Sentry (monitoring)
- Vitest (testes)
- Playwright (E2E)
- ESLint + Prettier (linting)

---

## 🎯 CREDENCIAIS MASTER/ADMIN

**Email**: admin@snapdoor.com  
**Senha**: SnapDoor2025!Admin  
**Role**: super_admin

Criado automaticamente no primeiro deploy via script `bootstrap-admin.ts`

---

## 📋 CHECKLIST FINAL

Antes de considerar o app "pronto para comercialização":

- [ ] Todas as 15 fases completas
- [ ] 100% das funcionalidades funcionando
- [ ] 70%+ de cobertura de testes
- [ ] Performance > 90 no Lighthouse
- [ ] Documentação completa
- [ ] Deploy em produção funcional
- [ ] Conta admin criada e testada
- [ ] Onboarding guiado funcionando
- [ ] Sistema de pagamento testado
- [ ] Emails transacionais funcionando

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

1. **Confirmar aprovação do plano**
2. **Iniciar FASE 1** (Fundação & Setup)
3. **Criar conta admin automaticamente**
4. **Implementar fases sequencialmente**

**Estimativa total**: 15 dias úteis de desenvolvimento intensivo

---

**PERGUNTAS ANTES DE COMEÇAR**:

1. ✅ Aprovação do plano geral?
2. ✅ Prioridade de funcionalidades (alguma mais urgente)?
3. ✅ Preferência de integração de email (SendGrid vs Resend)?
4. ✅ Preferência de hosting (Vercel vs Netlify)?
5. ✅ Alguma funcionalidade adicional crítica não listada?

