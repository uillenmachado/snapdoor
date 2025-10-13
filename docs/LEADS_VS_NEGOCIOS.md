# 🎯 LEADS vs NEGÓCIOS - Nova Estrutura do SnapDoor CRM
## Inspirado no Pipedrive - Simplicidade e Clareza
**Data**: 10 de outubro de 2025  
**Versão**: 2.1.0

---

## 📊 ENTENDENDO A DIFERENÇA

### ❌ Antes (Estrutura Antiga)
- **Problema**: Leads representavam tanto pessoas quanto oportunidades
- **Confusão**: Card no pipeline era uma "pessoa", não um "negócio"
- **Limitação**: Difícil ter múltiplas pessoas em um mesmo negócio

### ✅ Agora (Nova Estrutura - Estilo Pipedrive)

```
NEGÓCIO (Deal)                    LEADS (Pessoas/Contatos)
├── Título                         ├── João Silva
├── Valor: R$ 50.000              │   ├── Cargo: CTO
├── Empresa: Acme Corp            │   ├── Email: joao@acme.com
├── Estágio: Proposta Enviada     │   └── Papel: Decision Maker
├── Participantes:                │
│   ├── João Silva (Decision Maker)   ├── Maria Santos
│   ├── Maria Santos (Influencer)     │   ├── Cargo: CEO
│   └── Pedro Costa (Technical)       │   ├── Email: maria@acme.com
└── Atividades, Notas, etc.          │   └── Papel: Influencer
                                      │
                                      └── Pedro Costa
                                          ├── Cargo: Desenvolvedor
                                          ├── Email: pedro@acme.com
                                          └── Papel: Technical
```

---

## 🏗️ ARQUITETURA DO BANCO DE DADOS

### 1. Tabela `deals` (Negócios)

**O que é**: Oportunidades de venda, projetos, contratos.

**Campos principais**:
- `title` - Nome do negócio (ex: "Projeto Marketing Digital - Acme")
- `value` - Valor em dinheiro (ex: R$ 50.000)
- `stage_id` - Etapa do pipeline (Qualificado, Proposta, Negociação, Fechado)
- `company_id` - Empresa relacionada
- `status` - `open`, `won`, `lost`
- `probability` - % de chance de fechar (0-100%)
- `expected_close_date` - Data prevista de fechamento

**Exemplo**:
```json
{
  "id": "uuid-123",
  "title": "Implementação CRM - Acme Corp",
  "value": 50000.00,
  "currency": "BRL",
  "company_name": "Acme Corp",
  "stage_id": "proposta-enviada",
  "status": "open",
  "probability": 75,
  "expected_close_date": "2025-11-15"
}
```

---

### 2. Tabela `leads` (Pessoas/Contatos)

**O que é**: Pessoas reais - contatos, prospects, clientes.

**Campos principais**:
- `first_name`, `last_name` - Nome da pessoa
- `job_title` - Cargo (ex: "CTO", "CEO")
- `company` - Empresa onde trabalha
- `email`, `phone` - Contatos
- `linkedin_url` - Perfil LinkedIn

**Exemplo**:
```json
{
  "id": "uuid-456",
  "first_name": "João",
  "last_name": "Silva",
  "job_title": "CTO",
  "company": "Acme Corp",
  "email": "joao.silva@acme.com",
  "phone": "+55 11 99999-9999",
  "linkedin_url": "linkedin.com/in/joaosilva"
}
```

---

### 3. Tabela `deal_participants` (Participantes do Negócio)

**O que é**: Relacionamento M:N entre Negócios e Pessoas.

**Papéis disponíveis**:
- `decision_maker` - **Tomador de Decisão** (quem assina/aprova)
- `influencer` - **Influenciador** (opinião conta muito)
- `user` - **Usuário Final** (vai usar o produto/serviço)
- `technical` - **Avaliador Técnico** (analisa aspectos técnicos)
- `champion` - **Defensor Interno** (advoga pela solução internamente)
- `participant` - **Participante Geral** (envolvido de alguma forma)

**Exemplo**:
```json
{
  "deal_id": "uuid-123",
  "lead_id": "uuid-456",
  "role": "decision_maker",
  "is_primary": true
}
```

---

## 🎨 INTERFACE DO USUÁRIO

### Página: Negócios (ex-Dashboard)

**O que mostra**: Kanban Board com NEGÓCIOS (não pessoas)

```
┌─────────────────────────────────────────┐
│         🎯 NEGÓCIOS (Pipeline)          │
├─────────────────────────────────────────┤
│                                         │
│ Qualificado    Proposta     Negociação │
│ ┌────────┐    ┌────────┐   ┌────────┐ │
│ │ CRM    │    │ ERP    │   │ Site   │ │
│ │ Acme   │    │ TechCo │   │ StartX │ │
│ │R$50k   │    │R$120k  │   │R$25k   │ │
│ │👤 3    │    │👤 2    │   │👤 1    │ │
│ └────────┘    └────────┘   └────────┘ │
└─────────────────────────────────────────┘
```

**Card do Negócio mostra**:
- 📝 Título do negócio
- 🏢 Nome da empresa
- 💰 Valor (R$)
- 👥 Número de participantes
- 📅 Data de fechamento prevista
- 📊 Probabilidade (%)

---

### Página: Leads (Database de Pessoas)

**O que mostra**: Tabela com TODAS as pessoas cadastradas

```
┌───────────────────────────────────────────────────────────┐
│              👥 LEADS (Pessoas/Contatos)                  │
├──────────┬──────────┬──────────────┬──────────┬──────────┤
│ Nome     │ Cargo    │ Empresa      │ Email    │ Negócios │
├──────────┼──────────┼──────────────┼──────────┼──────────┤
│ João     │ CTO      │ Acme Corp    │ joao@... │ 2 ativos │
│ Maria    │ CEO      │ TechCo       │ maria@...│ 1 ativo  │
│ Pedro    │ Dev      │ StartX       │ pedro@...│ 0 ativos │
└──────────┴──────────┴──────────────┴──────────┴──────────┘
```

**Funcionalidades**:
- ✅ Busca por nome, email, empresa
- ✅ Filtros por cargo, empresa, status
- ✅ Ver negócios associados
- ✅ Enriquecer dados (LinkedIn, Hunter.io)
- ✅ Adicionar a negócios existentes

---

### Página: Detalhes do Negócio

**URL**: `/deals/:id`

**Seções**:
1. **Resumo**
   - Valor, empresa, estágio
   - Responsável (owner)
   - Data de fechamento
   - Probabilidade

2. **Participantes** (Leads envolvidos)
   - Lista de pessoas
   - Papel de cada um
   - Contato principal marcado

3. **Atividades**
   - Ligações, reuniões, e-mails
   - Timeline cronológico

4. **Notas**
   - Observações internas
   - Histórico de mudanças

5. **Arquivos**
   - Propostas, contratos
   - Documentos anexos

---

## 🔄 FLUXOS DE TRABALHO

### Fluxo 1: Criar um Novo Negócio

```
1. Clicar em "+ Novo Negócio"
2. Preencher:
   - Título do negócio
   - Valor estimado
   - Empresa
   - Data prevista
3. Adicionar participantes (leads):
   - Buscar lead existente OU
   - Criar novo lead
   - Definir papel de cada um
4. Salvar
5. Negócio aparece no pipeline
```

### Fluxo 2: Adicionar Pessoa a Negócio Existente

```
1. Abrir detalhes do negócio
2. Seção "Participantes"
3. Clicar "+ Adicionar Pessoa"
4. Buscar lead existente OU criar novo
5. Definir papel (Decision Maker, Influencer, etc)
6. Salvar
7. Pessoa aparece na lista de participantes
```

### Fluxo 3: Ver Negócios de um Lead

```
1. Ir para página "Leads"
2. Clicar no nome da pessoa
3. Ver perfil completo
4. Seção "Negócios" mostra:
   - Negócios ativos
   - Negócios ganhos
   - Negócios perdidos
   - Papel em cada negócio
```

---

## 🎓 ONBOARDING (Primeira Utilização)

Inspirado no Pipedrive, capturamos informações do usuário:

### Etapa 1: Sobre Você
- Nome completo ✅ (já temos do cadastro)
- Cargo/Função (ex: Representante de Vendas, Gerente)
- Já usa CRM? (Sim/Não)
- Telefone (opcional)

### Etapa 2: Sua Empresa
- Nome da empresa
- Tamanho (1, 2-5, 6-10, 11-50, 50+)
- Setor/Indústria

### Etapa 3: Suas Metas
- O que você quer alcançar?
  - [ ] Organizar meu processo de vendas
  - [ ] Aumentar taxa de conversão
  - [ ] Acompanhar performance
  - [ ] Colaborar com o time
  - [ ] Obter mais leads

**Salvamento**:
```sql
UPDATE profiles SET
  job_role = 'Representante de Vendas',
  company_size = '11-50',
  industry = 'Tecnologia',
  goals = ARRAY['organize_sales', 'increase_conversion'],
  onboarding_completed = true,
  onboarding_completed_at = NOW()
WHERE user_id = '...';
```

---

## 📋 MENU ATUALIZADO

```
┌─────────────────────────┐
│  SnapDoor CRM          │
├─────────────────────────┤
│ 📊 Dashboard (Overview)│  ← KPIs e gráficos
│ 💼 Negócios (Pipeline) │  ← Kanban de deals
│ 👥 Leads (Pessoas)     │  ← Database de contatos
│ 📅 Atividades          │  ← Agenda e tarefas
│ 📈 Relatórios          │  ← Analytics
│ ⚙️  Configurações       │  ← Settings
│ ❓ Ajuda               │  ← Help
└─────────────────────────┘
```

---

## 🔄 MIGRAÇÃO DE DADOS EXISTENTES

Se você já tem leads no sistema antigo, não se preocupe!

**Estratégia**:
1. Leads existentes permanecem como PESSOAS
2. Criamos automaticamente um NEGÓCIO para cada lead com:
   - Título: "[Empresa] - [Nome do Lead]"
   - Valor: campo `revenue` do lead antigo
   - Status: baseado na `temperature`
3. Associamos o lead ao negócio criado

**Script de migração** (execução automática):
```sql
-- Será criado em migração futura se necessário
INSERT INTO deals (title, value, lead_id, ...)
SELECT 
  CONCAT(company, ' - ', first_name, ' ', last_name),
  revenue,
  id,
  ...
FROM leads
WHERE created_at < '2025-10-10'; -- dados antigos
```

---

## ✅ BENEFÍCIOS DA NOVA ESTRUTURA

### Para o Usuário
- ✅ **Clareza**: Separação óbvia entre pessoas e oportunidades
- ✅ **Múltiplos contatos**: Vários tomadores de decisão em um negócio
- ✅ **Organização**: Pipeline focado em NEGÓCIOS reais
- ✅ **Simplicidade**: Inspirado no Pipedrive, mas mais simples

### Para o Desenvolvimento
- ✅ **Escalabilidade**: Estrutura preparada para crescimento
- ✅ **Relacionamentos**: M:N entre deals e leads
- ✅ **Flexibilidade**: Papéis customizáveis
- ✅ **Performance**: Índices otimizados

---

## 🎯 PRÓXIMOS PASSOS

1. ✅ Migração criada (`20251010190000_create_deals_structure.sql`)
2. ⏳ Implementar componentes de Onboarding
3. ⏳ Refatorar página de Negócios (Kanban com deals)
4. ⏳ Refatorar página de Leads (database de pessoas)
5. ⏳ Criar hooks `useDeals`, `useCreateDeal`, etc
6. ⏳ Atualizar menu da sidebar
7. ⏳ Testar fluxos completos

---

**Estrutura criada por**: GitHub Copilot  
**Inspiração**: Pipedrive CRM  
**Filosofia**: Simplicidade > Complexidade  
**Status**: 🚀 Em implementação
