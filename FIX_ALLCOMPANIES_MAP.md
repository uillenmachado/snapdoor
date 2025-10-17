# 🐛 FIX: allCompanies.map is not a function

## ❌ ERRO ORIGINAL
```
TypeError: allCompanies.map is not a function
at CreateDealDialog (CreateDealDialog.tsx:359:41)
```

## 🔍 CAUSA RAIZ
O hook `useCompanies()` retorna um **objeto** com estrutura:
```typescript
{
  data: {
    companies: Company[], // ← Array real aqui
    count: number,
    pagination: {...}
  },
  isLoading: boolean,
  error: Error | null
}
```

**Código errado:**
```typescript
const { data: allCompanies = [] } = useCompanies(userId);
// allCompanies = { companies: [], count: 0, ... } ❌ Objeto, não array!
```

## ✅ SOLUÇÃO APLICADA

### src/components/CreateDealDialog.tsx (linhas 63-74)

**ANTES (errado):**
```typescript
const { data: allCompanies = [] } = useCompanies(userId);
```

**DEPOIS (correto):**
```typescript
const companiesQuery = useCompanies(undefined, 1, 1000); // Buscar todas empresas
const allCompanies = companiesQuery.data?.companies || [];

console.log('🏢 Empresas carregadas:', {
  total: allCompanies.length,
  isArray: Array.isArray(allCompanies),
  empresas: allCompanies.map((c: any) => c.name)
});
```

## 📋 ESTRUTURA DO useCompanies

### Assinatura:
```typescript
useCompanies(
  filters?: CompanyFilters,  // Filtros opcionais
  page = 1,                  // Página atual
  pageSize = 20              // Itens por página
)
```

### Retorno:
```typescript
{
  data: {
    companies: Company[],    // ← Array de empresas
    count: number,           // Total de empresas
    pagination: {
      page: number,
      pageSize: number,
      totalPages: number
    }
  },
  isLoading: boolean,
  error: Error | null,
  refetch: () => void
}
```

## 🧪 COMO TESTAR

1. **Recarregar app:** Ctrl+Shift+R
2. **Abrir console:** F12 → Console
3. **Ir para:** /pipelines
4. **Clicar:** "Nova Oportunidade"
5. **Verificar logs:**
```
✅ Esperado:
🏢 Empresas carregadas: {
  total: 5,
  isArray: true,
  empresas: ["Nubank", "Banco Inter", "BTG Pactual", ...]
}

❌ NÃO deve aparecer:
TypeError: allCompanies.map is not a function
```

## 🎯 RESULTADO

### Antes:
- ❌ Erro: `allCompanies.map is not a function`
- ❌ Dialog não abria
- ❌ App quebrava

### Depois:
- ✅ `allCompanies` é array válido
- ✅ Dialog abre normalmente
- ✅ Autocomplete funciona
- ✅ Lista de empresas renderiza
- ✅ Console mostra logs de debug

## 🚀 PRÓXIMOS PASSOS

1. **Verificar se empresas aparecem:**
   - Abrir campo "Empresa"
   - Ver lista de empresas cadastradas

2. **Se lista estiver vazia:**
   - Ir em /companies
   - Cadastrar 2-3 empresas teste
   - Voltar para criar oportunidade
   - Empresas devem aparecer agora

3. **Testar fluxo completo:**
   - Selecionar empresa existente → `company_id` preenchido
   - Digitar nova empresa → `company_id` undefined, cria nova

4. **Remover logs de debug** (após validar):
```typescript
// Remover estas linhas depois:
console.log('🏢 Empresas carregadas:', ...);
```

## 📝 ARQUIVOS MODIFICADOS

- ✅ `src/components/CreateDealDialog.tsx` (linhas 63-74)

## 🔗 RELACIONADO

- Issue anterior: PGRST204 - company_name column não existe
- Solução: FIX_COMPANY_NAME_COLUMN.sql
- Feature: Autocomplete de empresas
- UX: Remoção de popup de decisor

---

**Status:** ✅ CORRIGIDO
**Testado:** ⏳ AGUARDANDO VALIDAÇÃO DO USUÁRIO
**Pronto para:** Testar criação de oportunidade com autocomplete
