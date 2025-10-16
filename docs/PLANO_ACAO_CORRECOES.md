# 🔍 PLANO DE AÇÃO - Correções Finais

**Data**: 15 de outubro de 2025  
**Status**: 🚧 EM ANDAMENTO  

---

## ✅ Correções APLICADAS (Aguardando Reload)

### 1. **Tabela de Leads - Contraste de Cores** ✅
**Problema**: Texto cinza (`text-neutral-700`) sobre fundo cinza (`bg-neutral-50`) - ilegível  

**Solução Aplicada**:
```tsx
// Header da tabela
bg-neutral-100 dark:bg-neutral-900
text-neutral-900 dark:text-neutral-100  // PRETO FORTE

// Linhas da tabela
bg-white dark:bg-neutral-950
text-neutral-900 dark:text-neutral-100  // PRETO FORTE

// Hover
bg-neutral-100 dark:bg-neutral-900  // CINZA LEVE NO HOVER
```

**Resultado Esperado**:
- Headers com fundo cinza claro e texto preto forte
- Linhas com fundo branco e texto preto forte
- Contraste máximo para legibilidade

**Ação**: Recarregue `http://localhost:8080/leads` (Ctrl+F5)

---

## 🔴 Problemas PENDENTES (Necessitam Investigação)

### 2. **Empresa Não Aparece nos Leads** ⚠️

**Sintoma**: Ícone de prédio aparece mas sem texto da empresa  

**Código Atual**:
```tsx
{lead.companies?.name || "-"}
```

**Hipótese 1**: `company_id` dos leads está NULL (não populado)  
**Hipótese 2**: JOIN não está funcionando  
**Hipótese 3**: Tabela companies não tem dados  

**Script de Diagnóstico**:
```sql
-- Execute no Supabase SQL Editor
SELECT 
  l.id,
  l.first_name || ' ' || l.last_name as nome_lead,
  l.company_id,
  c.id as company_real_id,
  c.name as company_nome,
  CASE 
    WHEN l.company_id IS NULL THEN '⚠️ COMPANY_ID NULL'
    WHEN c.id IS NULL THEN '❌ EMPRESA NÃO EXISTE'
    ELSE '✅ OK'
  END as status
FROM leads l
LEFT JOIN companies c ON l.company_id = c.id
WHERE l.user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1)
ORDER BY l.first_name;
```

**Possíveis Soluções**:
1. Se `company_id` NULL → Popular company_id com script SQL
2. Se companies vazia → Inserir empresas na tabela
3. Se JOIN quebrado → Verificar schema e permissões RLS

---

### 3. **Pipeline Kanban Vazio** ⚠️

**Sintoma**: Métricas mostram "10 negócios, R$ 2.995.000" mas Kanban mostra "Nenhum negócio"  

**Código de Agrupamento**:
```typescript
// src/pages/Pipelines.tsx linha 70-76
const stagesWithDeals = useMemo(() => {
  if (!stages || !deals) return [];
  
  return stages.map((stage) => ({
    ...stage,
    deals: deals.filter((deal) => deal.stage_id === stage.id),  // ← AQUI
  }));
}, [stages, deals]);
```

**Hipótese**: `deal.stage_id` não corresponde a `stage.id` real  

**Script de Diagnóstico** (`check-pipeline-deals.sql`):
```sql
-- Execute no Supabase SQL Editor

-- 1. Ver stage_id de todos os deals
SELECT 
  d.id,
  d.title,
  d.stage_id as deal_stage_id,
  d.pipeline_id
FROM deals d
WHERE d.user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1);

-- 2. Ver IDs reais dos stages
SELECT 
  s.id as stage_id,
  s.name as stage_nome,
  s.order_index,
  s.pipeline_id
FROM stages s
JOIN pipelines p ON s.pipeline_id = p.id
WHERE p.user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1);

-- 3. Verificar correspondência
SELECT 
  d.title as deal,
  d.stage_id as deal_stage_id,
  s.id as stage_real_id,
  s.name as stage_nome,
  CASE 
    WHEN d.stage_id = s.id THEN '✅ OK'
    ELSE '❌ QUEBRADO'
  END as status
FROM deals d
LEFT JOIN stages s ON d.stage_id = s.id
WHERE d.user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1);

-- 4. Contar deals por stage
SELECT 
  s.name,
  COUNT(d.id) as total_deals
FROM stages s
LEFT JOIN deals d ON s.id = d.stage_id
WHERE s.pipeline_id IN (
  SELECT id FROM pipelines WHERE user_id = (SELECT id FROM auth.users WHERE email = 'uillenmachado@gmail.com' LIMIT 1)
)
GROUP BY s.name, s.order_index
ORDER BY s.order_index;
```

**Possíveis Soluções**:
1. Se IDs não batem → UPDATE deals SET stage_id = (primeiro stage) WHERE stage_id IS NULL
2. Se pipeline_id diferente → Corrigir relacionamento de pipeline
3. Se stages não existem → Recriar stages do pipeline

---

## 📋 CHECKLIST DE TESTES

### Teste 1: Contraste de Cores ✅
- [ ] Recarregar http://localhost:8080/leads com Ctrl+F5
- [ ] Verificar se header da tabela tem fundo cinza claro
- [ ] Verificar se texto do header é preto forte (legível)
- [ ] Verificar se linhas têm fundo branco
- [ ] Verificar se texto das linhas é preto forte (legível)
- [ ] Testar hover (deve ficar cinza leve)

### Teste 2: Dados de Empresa 🔍
- [ ] Na tabela de leads, verificar se coluna "Empresa" mostra nomes
- [ ] Se mostra "-", executar script SQL de diagnóstico
- [ ] Enviar resultado do script SQL
- [ ] Aguardar script de correção baseado no diagnóstico

### Teste 3: Pipeline Kanban 🔍
- [ ] Ir para http://localhost:8080/pipelines
- [ ] Verificar se métrica mostra "10 negócios"
- [ ] Verificar se Kanban mostra cards ou "Nenhum negócio"
- [ ] Se vazio, executar `check-pipeline-deals.sql` no Supabase
- [ ] Enviar resultado do script SQL
- [ ] Aguardar script de correção baseado no diagnóstico

---

## 🎯 PRÓXIMAS AÇÕES

1. **VOCÊ**: Recarregue página Leads (Ctrl+F5) e valide contraste
2. **VOCÊ**: Execute scripts SQL de diagnóstico no Supabase
3. **VOCÊ**: Envie resultados dos scripts
4. **EU**: Analiso resultados e crio scripts de correção
5. **VOCÊ**: Executa scripts de correção
6. **TESTE FINAL**: Validação visual completa

---

## 📝 ARQUIVOS CRIADOS

1. `scripts/check-pipeline-deals.sql` - Diagnóstico de deals vazios no Kanban
2. `docs/TESTE_VISUAL_REPORT.md` - Relatório completo de testes
3. `scripts/check-leads-schema.sql` - Diagnóstico de schema de leads
4. `scripts/fix-leads-company-data.sql` - Correção de dados (já executado)

---

## 🚨 IMPORTANTE

**NÃO fazer commits ainda** - Aguardar resolução completa dos 3 problemas:
1. ✅ Contraste (corrigido - aguardando validação)
2. ⚠️ Empresa vazia (precisa diagnóstico)
3. ⚠️ Kanban vazio (precisa diagnóstico)

Após resolver TUDO, fazer commit final com mensagem completa.

---

**Última Atualização**: 15/10/2025 19:12  
**Próxima Ação**: Usuário executar testes e scripts SQL
