# 🎯 REESTRUTURAÇÃO: LEADS VS NEGÓCIOS
## Inspirado no Pipedrive - Implementação em Andamento
**Data**: 10 de outubro de 2025 - 19:45  
**Status**: 🔄 **EM PROGRESSO** (40% concluído)

---

## 📊 RESUMO DA MUDANÇA

### Problema Identificado
Analisando os prints do **Pipedrive**, identificamos que a estrutura atual do SnapDoor mistura conceitos:
- ❌ Cards no pipeline representavam "leads" (pessoas)
- ❌ Difícil ter múltiplas pessoas em um negócio
- ❌ Confusão entre contato (pessoa) e oportunidade (negócio)

### Solução Implementada
Separação clara inspirada no Pipedrive:
- ✅ **NEGÓCIOS** (Deals) = Oportunidades de venda, projetos, contratos
- ✅ **LEADS** (Leads) = Pessoas reais, contatos, prospects
- ✅ Relacionamento M:N entre negócios e pessoas

---

## ✅ JÁ IMPLEMENTADO (40%)

### 1. 🗄️ Estrutura do Banco de Dados

**Arquivo**: `supabase/migrations/20251010190000_create_deals_structure.sql`

#### Tabela `deals` (Negócios)
```sql
- title (nome do negócio)
- value (valor em R$)
- company_id/company_name
- stage_id (etapa do pipeline)
- status (open, won, lost)
- probability (0-100%)
- expected_close_date
- owner_id (responsável)
+ 15 outros campos
```

#### Tabela `deal_participants` (Participantes)
```sql
- deal_id → deals
- lead_id → leads
- role (decision_maker, influencer, user, technical, champion)
- is_primary (contato principal?)
```

#### Campos Adicionados em `profiles`
```sql
- job_role (cargo do usuário)
- company_size (tamanho da empresa)
- industry (setor)
- goals (metas/objetivos)
- onboarding_completed (se completou boas-vindas)
```

**Status**: ✅ Migração criada e pronta para aplicar

---

### 2. 📚 Documentação Completa

#### `docs/LEADS_VS_NEGOCIOS.md`
- ✅ Explicação detalhada da diferença
- ✅ Arquitetura do banco
- ✅ Fluxos de trabalho
- ✅ Exemplos práticos
- ✅ Guia de onboarding

#### `README.md` Simplificado
- ✅ README raiz agora tem apenas Quick Start
- ✅ Link para documentação completa em `docs/`
- ✅ README antigo salvo em `docs/README_COMPLETO.md`

**Status**: ✅ Documentação completa criada

---

## 🔄 EM DESENVOLVIMENTO (60% restante)

### 3. 🎨 Componente de Onboarding (Etapa 1)

**Inspiração**: Prints do Pipedrive

**Fluxo de 3 Etapas**:
1. **Sobre Você**
   - Nome ✅ (já temos)
   - Cargo/Função
   - Usa CRM? (Sim/Não)
   - Telefone (opcional)

2. **Sua Empresa**
   - Nome da empresa
   - Tamanho (1, 2-5, 6-10, 11-50, 50+)
   - Setor/Indústria

3. **Suas Metas**
   - Checkboxes com objetivos:
     - Organizar processo de vendas
     - Aumentar conversão
     - Acompanhar performance
     - Colaborar com time
     - Obter mais leads

**Arquivos a Criar**:
- [ ] `src/components/OnboardingDialog.tsx`
- [ ] `src/hooks/useOnboarding.ts`
- [ ] `src/pages/Welcome.tsx`

**Status**: ⏳ Próximo item

---

### 4. 💼 Página de Negócios (ex-Dashboard)

**Mudanças**:
- Renomear "Dashboard" → "Negócios"
- Kanban agora mostra DEALS, não leads
- Card do negócio mostra:
  - 📝 Título do negócio
  - 🏢 Nome da empresa
  - 💰 Valor (R$)
  - 👥 Número de participantes
  - 📅 Data prevista
  - 📊 Probabilidade

**Arquivos a Modificar**:
- [ ] `src/pages/Dashboard.tsx` → `src/pages/Deals.tsx`
- [ ] `src/components/DealCard.tsx` (novo)
- [ ] `src/components/KanbanBoard.tsx` (adaptar para deals)

**Status**: ⏳ Aguardando

---

### 5. 👥 Página de Leads Refatorada

**Mudanças**:
- Leads agora são apenas PESSOAS
- Tabela mostra: nome, cargo, empresa, email, negócios associados
- Ao clicar, abre perfil da pessoa
- Perfil mostra negócios onde a pessoa está envolvida

**Arquivos a Modificar**:
- [ ] `src/pages/Leads.tsx` (refatorar)
- [ ] `src/pages/LeadProfile.tsx` → `src/pages/PersonProfile.tsx`
- [ ] `src/components/LeadCard.tsx` → `src/components/PersonCard.tsx`

**Status**: ⏳ Aguardando

---

### 6. 🔧 Hooks para Deals

**Hooks a Criar**:
- [ ] `src/hooks/useDeals.ts` - Listar negócios
- [ ] `src/hooks/useDeal.ts` - Buscar um negócio
- [ ] `src/hooks/useCreateDeal.ts` - Criar negócio
- [ ] `src/hooks/useUpdateDeal.ts` - Atualizar negócio
- [ ] `src/hooks/useDeleteDeal.ts` - Deletar negócio
- [ ] `src/hooks/useMoveDeal.ts` - Mover entre etapas
- [ ] `src/hooks/useDealParticipants.ts` - Gerenciar participantes

**Status**: ⏳ Aguardando

---

### 7. 📱 Menu Atualizado

**Nova Estrutura**:
```
📊 Dashboard (Overview com KPIs)
💼 Negócios (Pipeline Kanban)
👥 Leads (Database de Pessoas)
📅 Atividades
📈 Relatórios
⚙️ Configurações
❓ Ajuda
```

**Arquivo a Modificar**:
- [ ] `src/components/AppSidebar.tsx`

**Status**: ⏳ Aguardando

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Banco de Dados
- [x] Criar tabela `deals`
- [x] Criar tabela `deal_participants`
- [x] Adicionar campos de onboarding em `profiles`
- [x] Índices e RLS configurados
- [ ] Aplicar migração no Supabase

### Frontend - Onboarding
- [ ] Componente `OnboardingDialog`
- [ ] Hook `useOnboarding`
- [ ] Integração com `profiles`
- [ ] Salvar dados no banco
- [ ] Marcar como concluído

### Frontend - Negócios
- [ ] Renomear Dashboard → Deals
- [ ] Criar `DealCard` component
- [ ] Adaptar `KanbanBoard` para deals
- [ ] Página de detalhes do negócio
- [ ] Gerenciar participantes

### Frontend - Leads
- [ ] Refatorar página Leads (só pessoas)
- [ ] Atualizar perfil de pessoa
- [ ] Mostrar negócios associados
- [ ] Relacionar pessoa a negócio

### Frontend - Hooks
- [ ] useDeals (CRUD completo)
- [ ] useDealParticipants
- [ ] Integrar com react-query

### Documentação
- [x] LEADS_VS_NEGOCIOS.md
- [x] README simplificado
- [ ] Guia de migração de dados
- [ ] Tutorial em vídeo

---

## 🎯 PRÓXIMOS PASSOS

### Hoje (Noite)
1. ✅ Aplicar migração no Supabase
2. ⏳ Criar componente de Onboarding
3. ⏳ Criar hooks useDeals

### Amanhã
4. Refatorar página Dashboard → Deals
5. Adaptar KanbanBoard para negócios
6. Criar DealCard component

### Esta Semana
7. Refatorar página Leads
8. Atualizar menu da sidebar
9. Testes end-to-end
10. Deploy em produção

---

## 📊 PROGRESSO ATUAL

```
████████████░░░░░░░░░░░░░░░░░░░░ 40%

Concluído:
✅ Estrutura do banco (deals + participants)
✅ Documentação completa
✅ README simplificado
✅ Migração SQL pronta

Em Andamento:
🔄 Onboarding component
🔄 Hooks para deals

Aguardando:
⏳ Refatoração das páginas
⏳ Atualização do menu
⏳ Testes
```

---

## 💡 DECISÕES DE DESIGN

### Por que separar Leads e Negócios?
1. **Clareza**: Usuário entende que negócio ≠ pessoa
2. **Flexibilidade**: Múltiplas pessoas em um negócio
3. **Escalabilidade**: Estrutura preparada para crescimento
4. **Pipedrive**: Segue o padrão do líder de mercado

### Por que Onboarding?
1. **Personalização**: Adaptar CRM ao perfil do usuário
2. **Engajamento**: Aumentar taxa de ativação
3. **Dados**: Informações valiosas para analytics
4. **UX**: Usuário se sente acolhido

---

## 🚀 BENEFÍCIOS ESPERADOS

### Para o Usuário
- ✅ Interface mais intuitiva
- ✅ Múltiplos contatos por negócio
- ✅ Pipeline focado em NEGÓCIOS reais
- ✅ Onboarding personalizado

### Para o Negócio
- ✅ Maior taxa de conversão (onboarding)
- ✅ Usuários mais engajados
- ✅ Dados mais ricos (perfis completos)
- ✅ Diferencial competitivo

---

**Status**: 🔄 EM PROGRESSO  
**Última Atualização**: 10/10/2025 - 19:45  
**Próxima Ação**: Aplicar migração + Criar Onboarding
