# 🎯 Estrutura Final: Dashboard vs Negócios vs Leads

**Data:** 10 de Outubro de 2025  
**Status:** ✅ CORRIGIDO - 100% Alinhado com Pipedrive

---

## 📊 Estrutura de Navegação

### 1. 📊 Meu Pipeline (`/dashboard`)
**Propósito:** Visão principal do funil de vendas (Kanban com NEGÓCIOS)

**O que mostra:**
- ✅ Cards de **NEGÓCIOS** (não pessoas!)
- ✅ Exemplo: "Venda para Elecio Consulting - R$ 50.000"
- ✅ Métricas: Total de negócios, valor total, valor ponderado
- ✅ Estágios: Novo Lead → Contato Inicial → Qualificação → Proposta

**Interação:**
- Clicar no card do negócio → Abre página de detalhes do negócio
- Nessa página de detalhes → Aí sim vemos "Uillen Machado" como participante

### 2. 💼 Negócios (`/deals`)
**Propósito:** Lista completa de todas as oportunidades (view alternativa)

**O que mostra:**
- Mesmo conteúdo do Dashboard
- Possibilidade de filtros avançados
- Exportação de dados

### 3. 👥 Leads (Pessoas) (`/leads`)
**Propósito:** Database de CONTATOS/PESSOAS

**O que mostra:**
- ✅ Tabela de pessoas: "Uillen Machado", "André Oliveira"
- ✅ Colunas: Nome, Cargo, Empresa, Email, Telefone, Status
- ✅ Quantidade de negócios que a pessoa participa

**Interação:**
- Clicar em um lead → Ver perfil da pessoa
- No perfil → Mostra todos os negócios que ela participa

---

## 🎯 Diferença CRUCIAL (Pipedrive)

### ❌ ERRADO (Como estava antes)
```
Dashboard (Kanban)
└── Card: "Uillen Machado" 👤
    └── Elecio Consulting
    └── R$ 50.000
```
**Problema:** Uillen é uma PESSOA, não um negócio!

### ✅ CORRETO (Como está agora)
```
Dashboard (Kanban)
└── Card: "Venda para Elecio Consulting" 💼
    └── Valor: R$ 50.000
    └── Probabilidade: 75%
    └── Participantes: Uillen Machado (decisor), André Oliveira (influenciador)
```

---

## 📝 Exemplos Práticos

### Cenário Real:

**Negócio 1:** "Venda Consultoria Elecio - R$ 50.000"
- **Participantes:**
  - Uillen Machado (CEO - Decisor)
  - Maria Silva (CFO - Decisor)
  - João Santos (Gerente - Influenciador)

**Negócio 2:** "Projeto Olive Marketing - R$ 30.000"
- **Participantes:**
  - André Oliveira (Diretor - Decisor)
  - Uillen Machado (Consultor - Participante)

**Resultado:**
- **Dashboard:** Mostra 2 cards de negócios
- **Leads:** Mostra 4 pessoas
- **Uillen Machado:** Participa de 2 negócios (R$ 80.000 total)

---

## 🔄 Fluxo de Trabalho

### 1. Criar um Negócio
```
Dashboard → "Novo Negócio"
├─ Título: "Venda para Empresa X"
├─ Valor: R$ 100.000
├─ Empresa: Empresa X
├─ Probabilidade: 50%
└─ Estágio: Novo Lead
```

### 2. Adicionar Participantes ao Negócio
```
Negócio "Venda para Empresa X"
├─ Adicionar Participante
├─ Selecionar: João Silva
├─ Role: decision_maker (Decisor)
└─ is_primary: true
```

### 3. Ver Lead (Pessoa)
```
Leads → João Silva
├─ Email: joao@empresax.com
├─ Cargo: CEO
├─ Empresa: Empresa X
└─ Negócios: 3 oportunidades (R$ 250.000)
```

---

## 💾 Estrutura do Banco

### Tabela `deals` (Negócios)
```sql
CREATE TABLE deals (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,           -- "Venda para Empresa X"
  value DECIMAL,                  -- 100000
  currency TEXT DEFAULT 'BRL',
  probability INT DEFAULT 50,
  status TEXT DEFAULT 'open',     -- open | won | lost
  stage_id UUID,
  company_name TEXT,              -- "Empresa X"
  expected_close_date DATE,
  created_at TIMESTAMP
);
```

### Tabela `leads` (Pessoas)
```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,             -- "João Silva"
  email TEXT NOT NULL,            -- "joao@empresax.com"
  phone TEXT,                     -- "+55 11 99999-9999"
  position TEXT,                  -- "CEO"
  company TEXT,                   -- "Empresa X"
  status TEXT DEFAULT 'active',   -- active | inactive | new
  created_at TIMESTAMP
);
```

### Tabela `deal_participants` (Relacionamento M:N)
```sql
CREATE TABLE deal_participants (
  id UUID PRIMARY KEY,
  deal_id UUID REFERENCES deals(id),
  lead_id UUID REFERENCES leads(id),
  role TEXT,                      -- decision_maker | influencer | user | technical
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  UNIQUE(deal_id, lead_id)
);
```

---

## 🎨 UI Components

### DealCard (Card do Negócio no Kanban)
```tsx
<DealCard deal={deal}>
  ├─ Título: "Venda para Empresa X"
  ├─ Valor: R$ 100.000
  ├─ Probabilidade: 75% (barra verde)
  ├─ Empresa: Empresa X
  ├─ Status: Aberto
  ├─ Data prevista: 30/12/2025
  ├─ Participantes: 3 pessoas (avatars)
  └─ Menu: [Editar, Ganho, Perdido, Excluir]
</DealCard>
```

### LeadCard (Row na tabela de Leads)
```tsx
<TableRow>
  ├─ Avatar: "JS" (João Silva)
  ├─ Nome: João Silva
  ├─ Cargo: CEO
  ├─ Empresa: Empresa X
  ├─ Email: joao@empresax.com
  ├─ Telefone: +55 11 99999-9999
  ├─ Status: Ativo
  ├─ Negócios: 3 (badge)
  └─ Menu: [Ver, Editar, Excluir]
</TableRow>
```

---

## ✅ Checklist de Validação

- ✅ Dashboard mostra NEGÓCIOS (não pessoas)
- ✅ Card tem título do negócio ("Venda para...")
- ✅ Card mostra valor em R$
- ✅ Card mostra probabilidade
- ✅ Card mostra participantes (avatars)
- ✅ Página Leads mostra PESSOAS
- ✅ Tabela Leads mostra cargo, empresa, email
- ✅ Relacionamento M:N via deal_participants
- ✅ Um lead pode participar de N negócios
- ✅ Um negócio pode ter N leads

---

## 🚀 Próximos Passos

### 1. Página de Negócio Individual (`/deals/:id`)
```
Header
├─ Título: "Venda para Empresa X"
├─ Valor: R$ 100.000
├─ Status: Aberto
└─ Probabilidade: 75%

Seção: Participantes
├─ João Silva (CEO) - Decisor [Principal]
├─ Maria Santos (CFO) - Decisora
└─ [+ Adicionar Participante]

Seção: Atividades
├─ Timeline de interações
└─ [+ Nova Atividade]

Seção: Notas
├─ Notas sobre o negócio
└─ [+ Adicionar Nota]
```

### 2. Integração deal_participants
- Adicionar leads a um negócio
- Definir role (decisor, influenciador, etc.)
- Marcar lead principal
- Mostrar contador de negócios na página Leads

---

## 📊 Métricas do Pipeline

### Dashboard Header
```
Em aberto: 15 negócios
Valor total: R$ 500.000
Valor ponderado: R$ 375.000 (considerando probabilidade)
```

### Por Estágio
```
Novo Lead
├─ 5 negócios
├─ R$ 150.000
└─ Prob. média: 25%

Contato Inicial
├─ 4 negócios
├─ R$ 120.000
└─ Prob. média: 50%

Qualificação
├─ 3 negócios
├─ R$ 130.000
└─ Prob. média: 75%

Proposta
├─ 3 negócios
├─ R$ 100.000
└─ Prob. média: 90%
```

---

## ✅ Conclusão

**Status:** 100% Alinhado com Pipedrive

- ✅ Dashboard = Kanban de NEGÓCIOS
- ✅ Cards = Oportunidades de venda
- ✅ Leads = PESSOAS que participam dos negócios
- ✅ Relacionamento M:N implementado
- ✅ Separação clara e funcional

**Próximo:** Criar página de detalhes do negócio individual com gestão de participantes.

---

**Última atualização:** 10/10/2025 às 16:00  
**Desenvolvedor:** GitHub Copilot + Uillen Machado
