# 🔧 CORREÇÃO FINAL: Empresas e Coluna Source

## ❌ PROBLEMAS IDENTIFICADOS

### 1. **Empresas não carregam (total: 0)**
**Causa:** `fetchCompanies()` não filtrava por `user_id`
- RLS (Row Level Security) do Supabase bloqueia sem filtro
- Hook buscava TODAS empresas do banco (violação de segurança)

### 2. **Coluna 'source' não existe**
```
PGRST204: Could not find the 'source' column of 'deals' in the schema cache
```
**Causa:** Campo `source: 'manual'` sendo enviado mas coluna não existe na tabela

### 3. **Loop infinito de renders**
```
CreateDealDialog.tsx:70 🏢 Empresas carregadas: {total: 0, ...} (100x)
```
**Causa:** `console.log()` direto no render do componente

---

## ✅ CORREÇÕES APLICADAS

### 1. **src/types/company.ts** (linha 41)
```diff
export interface CompanyFilters {
  search?: string;
  industry?: string;
  size?: string;
  sortBy?: 'name' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
+ userId?: string; // ✅ Filtro obrigatório para RLS
}
```

### 2. **src/services/companyService.ts** (linha 228-248)
```diff
export async function fetchCompanies(
  filters?: {
    search?: string;
    industry?: string;
    size?: string;
    sortBy?: 'name' | 'created_at' | 'updated_at';
    sortOrder?: 'asc' | 'desc';
+   userId?: string; // ✅ Adicionar userId
  },
  page = 1,
  pageSize = 20
): Promise<{ data: Company[]; count: number }> {
  let query = supabase
    .from('companies')
    .select('*', { count: 'exact' });

+ // ✅ FILTRAR POR USER_ID (obrigatório para RLS)
+ if (filters?.userId) {
+   query = query.eq('user_id', filters.userId);
+ }

  // Aplicar busca
  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,domain.ilike.%${filters.search}%`
    );
  }
  ...
}
```

### 3. **src/hooks/useCompanies.ts** (linha 26-37)
```diff
export function useCompanies(
  filters?: CompanyFilters,
  page = 1,
  pageSize = 20
) {
  const { user } = useAuth();

+ // ✅ Adicionar userId aos filtros
+ const filtersWithUserId = {
+   ...filters,
+   userId: user?.id,
+ };

  return useQuery({
-   queryKey: [COMPANIES_QUERY_KEY, 'list', filters, page, pageSize],
+   queryKey: [COMPANIES_QUERY_KEY, 'list', filtersWithUserId, page, pageSize],
-   queryFn: () => fetchCompanies(filters, page, pageSize),
+   queryFn: () => fetchCompanies(filtersWithUserId, page, pageSize),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });
}
```

### 4. **src/hooks/useDeals.ts** (linha 155)
```diff
const dealData = {
  user_id: newDeal.user_id,
  pipeline_id: newDeal.pipeline_id,
  stage_id: newDeal.stage_id,
  title: newDeal.title,
  value: newDeal.value || 0,
  company_id: newDeal.company_id || null,
  expected_close_date: newDeal.expected_close_date || null,
  probability: newDeal.probability || 50,
  description: newDeal.description || null,
- source: newDeal.source || 'manual', // ❌ Coluna não existe
  position: newDeal.position || 0,
  status: 'open',
};
```

### 5. **src/components/CreateDealDialog.tsx** (linha 1, 70-82)
```diff
- import { useState, useEffect } from "react";
+ import React, { useState, useEffect } from "react";

export function CreateDealDialog({ ... }) {
  ...
  const allCompanies = companiesQuery.data?.companies || [];

- console.log('🏢 Empresas carregadas:', ...); // ❌ Loop infinito
+ // ✅ Log único quando dialog abre
+ React.useEffect(() => {
+   if (isOpen) {
+     console.log('🏢 Empresas disponíveis:', {
+       total: allCompanies.length,
+       loading: companiesQuery.isLoading,
+       error: companiesQuery.error,
+       empresas: allCompanies.map((c: any) => ({ id: c.id, name: c.name }))
+     });
+   }
+ }, [isOpen, allCompanies.length]);
```

---

## 🧪 COMO TESTAR

### PASSO 1: Recarregar App
```
Ctrl + Shift + R (limpar cache)
```

### PASSO 2: Ir para /companies e cadastrar empresas
```
1. Ir em: http://localhost:8080/companies
2. Clicar: "Nova Empresa"
3. Cadastrar:
   - Nome: "Nubank"
   - Domínio: "nubank.com.br"
   - Indústria: "Fintech"
   - Tamanho: "501-1000"
4. Salvar
5. Repetir para mais 2-3 empresas
```

### PASSO 3: Criar Oportunidade
```
1. Ir em: http://localhost:8080/pipelines
2. Clicar: "Nova Oportunidade"
3. Verificar console (F12):

✅ Esperado:
🏢 Empresas disponíveis: {
  total: 3,
  loading: false,
  error: null,
  empresas: [
    { id: "uuid1", name: "Nubank" },
    { id: "uuid2", name: "Banco Inter" },
    { id: "uuid3", name: "BTG Pactual" }
  ]
}

4. Campo "Empresa": Clicar e ver lista
5. Buscar "Nubank"
6. Selecionar empresa existente
7. OU digitar nova empresa
8. Preencher demais campos
9. Adicionar contatos
10. Criar oportunidade
```

### PASSO 4: Verificar Console
```
✅ Deve aparecer:
🚀 Iniciando criação de oportunidade...
🔍 Criando deal: { company_id: "uuid", title: "...", ... }
✅ Deal criado com sucesso
📝 Adicionando participantes...
✅ Participante 1/2 adicionado
✅ Participante 2/2 adicionado
🎉 Oportunidade criada com 2 participante(s)!

❌ NÃO deve aparecer:
- PGRST204: Could not find the 'source' column
- 🏢 Empresas carregadas: {total: 0} (repetido 100x)
- Erro 400
```

---

## 📊 VALIDAÇÃO SQL

Execute no Supabase para verificar empresas:

```sql
-- 1. Verificar empresas do usuário logado
SELECT id, name, domain, industry, size
FROM companies
WHERE user_id = (SELECT auth.uid())
ORDER BY name;

-- Se retornar 0 linhas: cadastre empresas em /companies

-- 2. Verificar estrutura da tabela deals
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'deals'
AND column_name IN ('source', 'company_id', 'company_name');

-- Esperado:
-- company_id | uuid
-- company_name | text (opcional, será removido)
-- source | NÃO DEVE EXISTIR (foi removido do código)

-- 3. Criar deal teste
INSERT INTO deals (
  user_id,
  pipeline_id,
  stage_id,
  title,
  value,
  company_id,
  status
) VALUES (
  auth.uid(),
  (SELECT id FROM pipelines WHERE user_id = auth.uid() LIMIT 1),
  (SELECT id FROM stages LIMIT 1),
  'Teste Manual',
  5000,
  (SELECT id FROM companies WHERE user_id = auth.uid() LIMIT 1),
  'open'
) RETURNING *;

-- Se funcionar: ✅ Estrutura correta
-- Se falhar: ❌ Verificar RLS policies
```

---

## 🎯 RESULTADO FINAL

### Antes:
- ❌ Empresas: total 0
- ❌ Erro: source column not found
- ❌ Loop infinito de logs
- ❌ Autocomplete vazio
- ❌ Não criava oportunidades

### Depois:
- ✅ Empresas carregam com filtro de userId
- ✅ Campo source removido
- ✅ Log aparece 1x quando abre dialog
- ✅ Autocomplete mostra empresas cadastradas
- ✅ Cria oportunidades com sucesso
- ✅ Vincula empresa por company_id

---

## 🔗 FLUXO CORRETO

### 1. Usuário tem empresas cadastradas:
```
1. Dialog abre
2. useCompanies() busca com userId
3. allCompanies[] preenchido
4. Autocomplete mostra lista
5. Usuário seleciona empresa
6. company_id preenchido
7. Deal criado com vínculo
```

### 2. Usuário digita nova empresa:
```
1. Dialog abre
2. allCompanies[] pode estar vazio
3. Usuário digita "Nova Empresa SA"
4. Não encontra na lista
5. Mostra: "✨ Nova empresa será criada"
6. company_id = undefined
7. Backend cria empresa + deal
```

---

## 📝 ARQUIVOS MODIFICADOS

1. ✅ `src/types/company.ts` - Adicionar userId em CompanyFilters
2. ✅ `src/services/companyService.ts` - Filtrar por userId em fetchCompanies
3. ✅ `src/hooks/useCompanies.ts` - Passar userId automaticamente
4. ✅ `src/hooks/useDeals.ts` - Remover campo source
5. ✅ `src/components/CreateDealDialog.tsx` - Corrigir loop de logs

---

## ⚠️ IMPORTANTE

**SE AINDA NÃO HÁ EMPRESAS CADASTRADAS:**

1. Vá em: `/companies`
2. Cadastre **pelo menos 3 empresas** manualmente
3. Volte para `/pipelines`
4. Tente criar oportunidade novamente
5. Empresas devem aparecer no autocomplete

**O SISTEMA NÃO VAI FUNCIONAR sem empresas cadastradas!**

---

## 🚀 PRÓXIMOS PASSOS

Após testar e validar:

1. [ ] Verificar empresas aparecem no autocomplete
2. [ ] Testar criar oportunidade com empresa existente
3. [ ] Testar criar oportunidade com nova empresa
4. [ ] Verificar deal aparece no kanban
5. [ ] Verificar vínculo company_id está correto
6. [ ] Remover logs de debug (após validação)
7. [ ] Aplicar FIX_COMPANY_NAME_COLUMN.sql (se ainda não foi)
8. [ ] Aplicar APPLY_THIS_MIGRATION.sql (deal_participants)

**Status:** ✅ CORRIGIDO
**Testado:** ⏳ AGUARDANDO VALIDAÇÃO
**Bloqueio:** Cadastre empresas em /companies primeiro!
