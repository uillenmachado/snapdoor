# 🎯 ESTRATÉGIA DE CORREÇÃO - Dashboard com NEGÓCIOS

**Data:** 10 de outubro de 2025  
**Objetivo:** Corrigir conceito de Leads vs Negócios no Dashboard

---

## ❌ PROBLEMA ATUAL

O Dashboard mostra **PESSOAS** (leads) no Kanban:
```
┌─────────────────────┐
│ Uillen Machado     │ ← ERRADO! Pessoa não é negócio
│ Elecio Consulting   │
│ CEO                 │
└─────────────────────┘
```

## ✅ SOLUÇÃO CORRETA

O Dashboard deve mostrar **NEGÓCIOS** (deals):
```
┌─────────────────────────────┐
│ Venda Consultoria Elecio   │ ← Nome do NEGÓCIO
│ R$ 50.000                   │
│ 👤 Uillen Machado (decisor)│ ← Lead que PARTICIPA
└─────────────────────────────┘
```

---

## 📊 ESTRUTURA DE DADOS

### Lead (Pessoa)
```typescript
{
  id: "uuid",
  name: "Uillen Machado",
  email: "uillen@example.com",
  company: "Elecio Consulting",
  position: "CEO"
}
```

### Deal (Negócio)
```typescript
{
  id: "uuid",
  title: "Venda Consultoria Estratégica", // ← DESTAQUE
  value: 50000,
  company_name: "Elecio Consulting",
  status: "open", // open | won | lost
  stage_id: "uuid"
}
```

### DealParticipant (Relacionamento)
```typescript
{
  deal_id: "deal-uuid",
  lead_id: "lead-uuid", // Uillen Machado
  role: "decision_maker", // decisor
  is_primary: true
}
```

---

## 🔧 MUDANÇAS NECESSÁRIAS

### 1. Dashboard.tsx
- ❌ Remover: `useLeads()`, `stagesWithLeads`
- ✅ Adicionar: `useDeals()`, `stagesWithDeals`
- ✅ Filtrar apenas deals com `status === 'open'`

### 2. Card no Kanban
- ❌ Não usar: `LeadCard` (foca em pessoa)
- ✅ Usar: `DealCard` (foca em negócio)
- ✅ Mostrar:
  - **Título do negócio** (grande, negrito)
  - Valor em R$
  - Empresa
  - Participantes (avatares pequenos)

### 3. Histórico de Negócios
- Nova rota: `/deals/history`
- Mostra deals com `status === 'won'` ou `status === 'lost'`
- Permite reabrir negócio (muda status para 'open')

### 4. "Meu Negócio" (Catálogo)
- Nova rota: `/my-business`
- Tabela `service_templates`:
```sql
CREATE TABLE service_templates (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL, -- "Consultoria Estratégica"
  type TEXT NOT NULL, -- "service" | "product"
  category TEXT, -- "consultoria", "mentoria"
  default_value DECIMAL, -- 15000
  description TEXT,
  created_at TIMESTAMP
);
```

---

## 📝 PLANO DE EXECUÇÃO

### Fase 1: Dashboard com Negócios ✅
1. ✅ Menu: "Meu Pipeline" → "Dashboard"
2. 🔄 Dashboard: usar `useDeals()` em vez de `useLeads()`
3. 🔄 Card: `DealCard` mostrando título do negócio
4. 🔄 Filtro: apenas `status === 'open'`

### Fase 2: Histórico de Negócios
5. Criar `/deals/history`
6. Listar deals ganhos/perdidos
7. Botão "Reabrir Negócio"

### Fase 3: Catálogo de Serviços
8. Migration: tabela `service_templates`
9. Página `/my-business`
10. CRUD de templates
11. Dialog "Criar Negócio": selecionar template

---

## 🎯 RESULTADO ESPERADO

### Dashboard (Kanban)
```
┌──────────────────────────────────┐
│ 📊 Dashboard                     │
├──────────────────────────────────┤
│                                  │
│ ┌─ Novo Lead ───────────────┐  │
│ │ Venda Consultoria Elecio  │  │
│ │ R$ 50.000                 │  │
│ │ 👤 Uillen M. (decisor)    │  │
│ └───────────────────────────┘  │
│                                  │
│ ┌─ Contato Inicial ─────────┐  │
│ │ Projeto Marketing Olive   │  │
│ │ R$ 30.000                 │  │
│ │ 👤 André O. (decisor)     │  │
│ └───────────────────────────┘  │
└──────────────────────────────────┘
```

### Histórico
```
┌──────────────────────────────────┐
│ 📜 Histórico de Negócios         │
├──────────────────────────────────┤
│ ✅ Ganhos (3) | ❌ Perdidos (2)  │
│                                  │
│ ✅ Venda Tech Solutions          │
│    R$ 80.000 | Ganho em 15/09   │
│    [Reabrir]                     │
│                                  │
│ ❌ Proposta Startup ABC          │
│    R$ 25.000 | Perdido em 10/09 │
│    [Reabrir]                     │
└──────────────────────────────────┘
```

---

**Próximo passo:** Implementar Fase 1 item por item.
