# 📚 SnapDoor CRM - Documentação Completa
**Atualizado:** 10 de outubro de 2025

## 🎯 Visão Geral

SnapDoor CRM é um sistema de gerenciamento de relacionamento com cliente (CRM) B2B moderno, construído com React, TypeScript e Supabase.

### Arquitetura Principal

**Frontend:**
- React 18.3.1 + TypeScript 5.8.3
- Vite 5.4.20 (build tool)
- TailwindCSS + shadcn/ui
- React Query (@tanstack/react-query) para gerenciamento de estado

**Backend:**
- Supabase PostgreSQL
- Row Level Security (RLS) habilitado
- Real-time subscriptions
- Storage para avatares

## 🏗️ Estrutura de Dados

### Conceitos Principais

**LEADS** = PESSOAS/CONTATOS
- Representam indivíduos (contatos, prospects)
- Campos: nome, email, telefone, cargo, empresa
- Podem estar associados a múltiplos deals

**DEALS** = NEGÓCIOS/OPORTUNIDADES
- Representam oportunidades de venda
- Campos: título, valor, probabilidade, data de fechamento
- Vinculados a um pipeline e stage
- Podem ter múltiplos participantes (leads)

**COMPANIES** = EMPRESAS
- Informações sobre organizações
- Vinculadas a deals e leads

### Tabelas Principais

```sql
-- Tabela de Deals (Negócios)
CREATE TABLE deals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  pipeline_id UUID REFERENCES pipelines(id),
  stage_id UUID REFERENCES stages(id),
  
  title TEXT NOT NULL,
  value DECIMAL(15, 2) DEFAULT 0,
  currency TEXT DEFAULT 'BRL',
  
  company_id UUID REFERENCES companies(id),
  company_name TEXT,
  
  status TEXT DEFAULT 'open', -- 'open', 'won', 'lost'
  probability INTEGER DEFAULT 50, -- 0-100
  
  expected_close_date DATE,
  closed_date TIMESTAMPTZ,
  
  description TEXT,
  tags TEXT[],
  
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Participantes (Relacionamento M:N)
CREATE TABLE deal_participants (
  id UUID PRIMARY KEY,
  deal_id UUID REFERENCES deals(id),
  lead_id UUID REFERENCES leads(id),
  user_id UUID REFERENCES auth.users(id),
  
  role TEXT, -- 'decision_maker', 'influencer', 'champion', etc
  is_primary BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(deal_id, lead_id)
);

-- Tabela de Leads (Contatos)
CREATE TABLE leads (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  
  position TEXT, -- cargo
  company TEXT, -- nome da empresa
  company_id UUID REFERENCES companies(id),
  
  linkedin_url TEXT,
  avatar_url TEXT,
  
  stage_id UUID REFERENCES stages(id),
  status TEXT DEFAULT 'active',
  
  enrichment_data JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 📊 Componentes Principais

### Dashboard
**Arquivo:** `src/pages/Dashboard.tsx`

Componente principal que exibe:
- Métricas de negócios (valor do pipeline, taxa de conversão, receita fechada, ticket médio)
- Kanban board de deals
- Sidebar com navegação

**Hooks utilizados:**
- `useDeals()` - Busca deals do usuário
- `usePipeline()` - Busca pipeline principal
- `useStages()` - Busca etapas do pipeline
- `useSubscription()` - Informações de assinatura

### DealKanbanBoard
**Arquivo:** `src/components/DealKanbanBoard.tsx`

Componente Kanban para visualização e movimentação de deals entre stages.

**Funcionalidades:**
- Drag and drop de deals entre colunas
- Exibição de valor total por coluna
- Contador de deals por stage
- Cores diferenciadas por stage

### DealCard
**Arquivo:** `src/components/DealCard.tsx`

Card individual de um deal exibido no Kanban.

**Exibe:**
- Logo da empresa
- Nome da empresa e título do deal
- Valor do negócio formatado
- Barra de probabilidade (0-100%)
- Data prevista de fechamento com indicador de urgência
- Tags e participantes

### DashboardMetrics
**Arquivo:** `src/components/DashboardMetrics.tsx`

Exibe métricas calculadas a partir dos deals.

**Métricas:**
1. **Valor do Pipeline**: Soma dos valores de todos os deals ativos
2. **Taxa de Conversão**: (Deals ganhos / Deals fechados) × 100
3. **Receita Fechada**: Soma dos valores dos deals ganhos
4. **Ticket Médio**: Valor médio dos deals ativos

## 🔧 Hooks Personalizados

### useDeals
**Arquivo:** `src/hooks/useDeals.ts`

Gerencia operações CRUD de deals.

```typescript
// Buscar deals do usuário
const { data: deals } = useDeals(userId);

// Buscar deals por stage
const { data: stageDeals } = useDealsByStage(stageId);

// Criar deal
const createDeal = useCreateDeal();
createDeal.mutate({ title, value, stage_id, ... });

// Atualizar deal
const updateDeal = useUpdateDeal();
updateDeal.mutate({ id, updates: { ... } });

// Mover deal entre stages
const moveDeal = useMoveDeal();
moveDeal.mutate({ dealId, fromStageId, toStageId, position });

// Deletar deal
const deleteDeal = useDeleteDeal();
deleteDeal.mutate(dealId);
```

### useLeads
**Arquivo:** `src/hooks/useLeads.ts`

Gerencia operações CRUD de leads (contatos).

```typescript
const { data: leads } = useLeads(userId);
const createLead = useCreateLead();
const updateLead = useUpdateLead();
const deleteLead = useDeleteLead();
```

### usePipelines
**Arquivo:** `src/hooks/usePipelines.ts`

Gerencia pipelines e stages.

```typescript
const { data: pipeline } = usePipeline(userId);
const { data: stages } = useStages(pipelineId);
const createStage = useCreateStage();
const updateStage = useUpdateStage();
```

## 🎨 Sistema de Créditos

Ver documentação detalhada em: `docs/CREDIT_SYSTEM_GUIDE.md`

**Tabelas:**
- `user_credits` - Saldo de créditos por usuário
- `credit_usage_history` - Histórico de uso
- `credit_packages` - Pacotes disponíveis
- `credit_purchases` - Histórico de compras

**Custos de Operações:**
- Enriquecer lead: 10 créditos
- Buscar empresa: 5 créditos
- Importar LinkedIn: 15 créditos

## 🔐 Autenticação e Segurança

### Row Level Security (RLS)

Todas as tabelas principais têm políticas RLS habilitadas:

```sql
-- Exemplo para deals
CREATE POLICY "Users can view their own deals"
  ON deals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own deals"
  ON deals FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Autenticação
**Arquivo:** `src/hooks/useAuth.ts`

```typescript
const { user, loading } = useAuth();
const { signIn } = useAuth();
const { signUp } = useAuth();
const { signOut } = useAuth();
```

## 🚀 Deployment

### Build de Produção

```bash
npm run build
```

Gera arquivos otimizados em `dist/`

### Variáveis de Ambiente

Criar arquivo `.env`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
VITE_SUPABASE_SERVICE_ROLE_KEY=sua-chave-service
VITE_HUNTER_API_KEY=sua-chave-hunter
```

## 📝 Migrations Importantes

### Migration Principal: create_deals_structure
**Arquivo:** `supabase/migrations/20251010190000_create_deals_structure.sql`

Cria a estrutura completa:
- Tabela `deals`
- Tabela `deal_participants`
- Índices de performance
- Triggers de updated_at
- Políticas RLS
- Comentários de documentação

**Executada:** ✅ Aplicada em produção

## 🧪 Testes

```bash
# Executar testes
npm run test

# Executar testes em watch mode
npm run test:watch
```

**Arquivos de teste:**
- `src/test/hooks.test.tsx` - Testes de hooks
- `src/test/services.test.ts` - Testes de serviços
- `src/test/setup.ts` - Configuração do Vitest

## 📦 Principais Dependências

```json
{
  "react": "^18.3.1",
  "react-query": "^5.83.0",
  "supabase-js": "^2.75.0",
  "tailwindcss": "^3.4.1",
  "typescript": "^5.8.3",
  "vite": "^5.4.20",
  "lucide-react": "^0.469.0",
  "date-fns": "^4.1.0"
}
```

## 🔍 Troubleshooting

### Erro: "deals is not a table"
**Solução:** Aplicar migration `20251010190000_create_deals_structure.sql`

### Erro: RLS Policy blocked
**Solução:** Verificar se o usuário está autenticado e as políticas RLS estão corretas

### Erro: Build failed
**Solução:** 
1. Limpar cache: `rm -rf node_modules/.vite`
2. Reinstalar dependências: `npm install`
3. Rebuild: `npm run build`

## 📚 Documentação Adicional

- `docs/SUPABASE_SETUP_GUIDE.md` - Setup do Supabase
- `docs/CREDIT_SYSTEM_GUIDE.md` - Sistema de créditos
- `docs/LEAD_ENRICHMENT_GUIDE.md` - Enriquecimento de leads
- `docs/USER_ENRICHMENT_GUIDE.md` - Enriquecimento de usuários
- `docs/CLEANUP_REPORT.md` - Relatório de limpeza anterior
- `docs/AUDITORIA_LIMPEZA_2025.md` - Auditoria atual

## 🎯 Roadmap Futuro

### Fase 2 - Automações
- [ ] Automação de follow-ups
- [ ] Alertas de deals parados
- [ ] Sugestões de próximas ações

### Fase 3 - Analytics Avançado
- [ ] Previsão de receita
- [ ] Análise de conversão por fonte
- [ ] Tempo médio por stage
- [ ] Relatórios personalizados

### Fase 4 - Integrações
- [ ] Integração com Gmail/Outlook
- [ ] Sincronização com calendário
- [ ] Webhooks para terceiros
- [ ] API pública

## 📞 Suporte

Para questões ou problemas, consulte:
1. Esta documentação
2. Logs do console do navegador
3. Logs do Supabase Dashboard
4. Issues no repositório

---

**Última atualização:** 10 de outubro de 2025
**Versão:** 2.0.0 (Arquitetura Deals)
