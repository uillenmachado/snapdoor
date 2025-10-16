# 🔍 GUIA DE TESTES - Diagnóstico de Dados

## 📋 RESUMO DA SITUAÇÃO

✅ **Dados confirmados no banco:**
- 10 leads COM company_id
- 10 deals COM stage_id
- 10 empresas cadastradas
- 9 stages cadastrados

❌ **Problema:** Empresas e deals não aparecem na interface React

## 🎯 EXECUTE ESTES 3 TESTES NO SUPABASE

### 1️⃣ TESTE 1: Verificar JOIN Leads ↔ Companies

**Arquivo:** `scripts/teste-1-join-leads-companies.sql`

**Como executar:**
1. Abra https://supabase.com/dashboard/project/knxprkuftbjqcdhwatso/sql
2. Copie TODO o conteúdo do arquivo `teste-1-join-leads-companies.sql`
3. Cole no SQL Editor
4. Clique em "Run"
5. **COPIE e COLE o resultado COMPLETO aqui**

**O que estamos testando:**
- Se o JOIN entre `leads` e `companies` funciona
- Se o RLS permite buscar dados de companies
- Se todos os 10 leads têm company_nome preenchido

### 2️⃣ TESTE 2: Verificar Políticas RLS

**Arquivo:** `scripts/teste-2-verificar-rls.sql`

**Como executar:**
1. Mesma tela do Supabase SQL Editor
2. Copie TODO o conteúdo do arquivo `teste-2-verificar-rls.sql`
3. Cole no SQL Editor
4. Clique em "Run"
5. **COPIE e COLE o resultado COMPLETO aqui**

**O que estamos testando:**
- Se existem políticas RLS para SELECT em companies
- Se as políticas permitem JOIN com outras tabelas
- Se há restrições que podem bloquear os dados

### 3️⃣ TESTE 3: Verificar JOIN Deals ↔ Stages

**Arquivo:** `scripts/teste-3-join-deals-stages.sql`

**Como executar:**
1. Mesma tela do Supabase SQL Editor
2. Copie TODO o conteúdo do arquivo `teste-3-join-deals-stages.sql`
3. Cole no SQL Editor
4. Clique em "Run"
5. **COPIE e COLE o resultado COMPLETO aqui**

**O que estamos testando:**
- Se o JOIN entre `deals` e `stages` funciona
- Se o RLS permite buscar dados de stages
- Se todos os 10 deals têm stage_nome preenchido

## 📊 INTERPRETAÇÃO DOS RESULTADOS

### ✅ Resultado BOM (esperado):

**Teste 1:**
```
| lead_nome        | company_nome     | status_join |
|------------------|------------------|-------------|
| Cristina Junqueira| Nubank          | ✅ JOIN OK  |
| Marcos Pinho     | Mercado Livre    | ✅ JOIN OK  |
...
```

**Teste 3:**
```
| deal_titulo              | stage_nome       | status_match |
|--------------------------|------------------|--------------|
| Integração Nubank CRM    | Qualificado      | ✅ MATCH OK  |
| Pipeline Mercado Livre   | Contato Feito    | ✅ MATCH OK  |
...
```

### ❌ Resultado RUIM (indica problema):

**Se aparecer:**
```
| lead_nome        | company_nome | status_join                  |
|------------------|--------------|------------------------------|
| Cristina Junqueira| NULL        | ❌ EMPRESA NÃO EXISTE (RLS?) |
```

**Significa:** RLS está bloqueando o JOIN → precisamos ajustar as políticas

## 🔧 PRÓXIMOS PASSOS APÓS OS TESTES

### Se os testes mostrarem ✅ (dados chegam corretos):
→ Problema está no **React** (useLeads.ts ou Leads.tsx)  
→ Vou debug o código TypeScript  
→ Vou adicionar console.logs para ver onde os dados se perdem

### Se os testes mostrarem ❌ (RLS bloqueando):
→ Problema está nas **políticas RLS**  
→ Vou criar migration para ajustar as policies  
→ Vou garantir que JOIN funcione corretamente

## 📝 IMPORTANTE

**Copie e cole os resultados COMPLETOS das 3 queries** para que eu possa:
1. Confirmar se o banco está retornando os dados corretos
2. Identificar exatamente onde está o problema
3. Criar a correção precisa (SQL ou TypeScript)

## 🚀 DEPOIS DOS TESTES

Também execute este comando no **Console do Browser** (F12) na página de Leads:

```javascript
// Ver dados que chegam do Supabase
const { data: testLeads } = await supabase
  .from('leads')
  .select(`
    *,
    companies:company_id (
      id, name
    )
  `)
  .limit(3);

console.log('Teste direto Supabase:', testLeads);
```

Isso vai mostrar se os dados chegam no frontend ou se o problema é no hook.
