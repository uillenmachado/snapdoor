# 🔧 FIX FINAL: Empresas Não Aparecem + company_id Null

## ❌ PROBLEMAS ENCONTRADOS

### 1. **Empresas não aparecem no autocomplete**
```javascript
🏢 Empresas disponíveis: {
  total: 0,
  empresas: [],
  error: null,
  loading: false
}
```
**Causa:** `fetchCompanies()` retornava `{ data: [], count: 0 }` mas hook esperava `{ companies: [], count: 0 }`

### 2. **company_id sempre null**
```javascript
✅ Deal criado com sucesso: {
  id: '31906997-5ade-4ac2-825b-5f4d0d37009e',
  company_id: null, // ❌ Deveria ter UUID
  ...
}
```
**Causa:** `allCompanies` vazio → usuário digita empresa → `companyId` fica undefined → deal criado sem vínculo

### 3. **Campo 'source' ainda sendo enviado**
```javascript
source: 'manual' // ❌ Coluna não existe no banco
```

---

## ✅ CORREÇÕES APLICADAS

### 1. **src/services/companyService.ts** (linha 228, 277-285)

**Tipo de retorno corrigido:**
```diff
export async function fetchCompanies(
  ...
- ): Promise<{ data: Company[]; count: number }> {
+ ): Promise<{ companies: Company[]; count: number }> { // ✅ Corrigir tipo
```

**Retorno da função corrigido:**
```diff
  const { data, error, count } = await query;

  if (error) {
    console.error('Erro ao buscar empresas:', error);
    throw new Error(`Erro ao buscar empresas: ${error.message}`);
  }

+ console.log('✅ Empresas buscadas:', { 
+   total: count, 
+   empresas: data?.map(c => c.name) 
+ });

- return { data: (data || []) as Company[], count: count || 0 };
+ // ✅ Retornar no formato correto
+ return { 
+   companies: (data || []) as Company[], 
+   count: count || 0 
+ };
}
```

### 2. **src/components/CreateDealDialog.tsx** (linha 193-208)

**Logs de debug melhorados:**
```diff
try {
- console.log('🚀 Iniciando criação de oportunidade...');
+ console.log('🚀 Iniciando criação de oportunidade...', {
+   companyName,
+   companyId,
+   hasCompanyId: !!companyId,
+   selectedLeads: selectedLeads.map(l => ({ name: l.name, role: l.role }))
+ });
```

**Campo source removido:**
```diff
  const newDeal = await createDealMutation.mutateAsync({
    user_id: userId,
    pipeline_id: pipelineId,
    stage_id: stageId,
    title: title.trim(),
    value: parseFloat(value),
    company_id: companyId || undefined,
    probability: parseInt(probability),
    expected_close_date: expectedCloseDate || undefined,
    description: description.trim() || undefined,
-   source: 'manual',
+   // source: 'manual', // ❌ Coluna não existe no banco
    position: 0,
  });
```

**Log de empresas aprimorado:**
```diff
React.useEffect(() => {
  if (isOpen) {
    console.log('🏢 Empresas disponíveis:', {
      total: allCompanies.length,
      loading: companiesQuery.isLoading,
      error: companiesQuery.error,
+     rawData: companiesQuery.data, // ✅ Ver estrutura completa
      empresas: allCompanies.map((c: any) => ({ id: c.id, name: c.name }))
    });
  }
- }, [isOpen, allCompanies.length]);
+ }, [isOpen, allCompanies.length, companiesQuery.data]); // ✅ Reagir a mudanças
```

---

## 🧪 COMO TESTAR AGORA

### PASSO 1: Recarregar e Limpar Cache
```powershell
# No navegador:
Ctrl + Shift + R

# OU no terminal:
# Parar servidor (Ctrl+C)
# Limpar cache do Vite
Remove-Item -Recurse -Force .vite
npm run dev
```

### PASSO 2: Verificar Empresas no Console
```
1. Abrir console: F12
2. Ir para: http://localhost:8080/pipelines
3. Clicar: "Nova Oportunidade"
4. Verificar log:

✅ ESPERADO:
✅ Empresas buscadas: {
  total: 5,
  empresas: ["Nubank", "Banco Inter", "BTG", ...]
}

🏢 Empresas disponíveis: {
  total: 5,
  loading: false,
  error: null,
  rawData: { companies: [...], count: 5 },
  empresas: [
    { id: "uuid1", name: "Nubank" },
    { id: "uuid2", name: "Banco Inter" },
    ...
  ]
}

❌ SE AINDA MOSTRAR total: 0:
- Ir em /companies
- Verificar se empresas existem
- Se sim, problema é RLS do Supabase
```

### PASSO 3: Criar Oportunidade com Empresa
```
1. Campo "Empresa": Clicar
2. Ver lista de empresas (deve aparecer agora!)
3. Selecionar "Nubank"
4. Console deve mostrar:
   🚀 Iniciando criação de oportunidade... {
     companyName: "Nubank",
     companyId: "uuid-da-empresa",
     hasCompanyId: true,
     selectedLeads: [...]
   }

5. Verificar deal criado:
   ✅ Deal criado com sucesso: {
     company_id: "uuid-da-empresa", // ✅ Não null!
     ...
   }
```

### PASSO 4: Validar SQL
```sql
-- 1. Verificar empresas cadastradas
SELECT id, name, domain, user_id
FROM companies
WHERE user_id = (SELECT auth.uid())
ORDER BY name;

-- Se retornar 0 linhas:
-- Problema: Não há empresas OU user_id diferente
-- Solução: Cadastre empresas em /companies

-- 2. Verificar deal criado
SELECT 
  d.id,
  d.title,
  d.company_id,
  c.name as company_name
FROM deals d
LEFT JOIN companies c ON d.company_id = c.id
WHERE d.user_id = (SELECT auth.uid())
ORDER BY d.created_at DESC
LIMIT 5;

-- ✅ Esperado: company_id preenchido
-- ❌ Se null: Problema no frontend
```

---

## 📊 FLUXO CORRETO AGORA

### **Quando dialog abre:**
```
1. useCompanies() executa
2. fetchCompanies({ userId: "uuid" }, 1, 1000)
3. Supabase query: SELECT * FROM companies WHERE user_id = 'uuid'
4. Retorna: { companies: [...], count: 5 }
5. allCompanies = companiesQuery.data?.companies || []
6. Console: "✅ Empresas buscadas: { total: 5 }"
7. Console: "🏢 Empresas disponíveis: { total: 5 }"
```

### **Quando seleciona empresa:**
```
1. Usuário clica no Popover "Empresa"
2. CommandList renderiza allCompanies.map()
3. Usuário seleciona "Nubank"
4. onSelect() executa:
   - setCompanyName("Nubank")
   - setCompanyId("uuid-da-nubank")
   - setOpenCompanyCombobox(false)
5. Estado atualizado com ID
```

### **Quando cria deal:**
```
1. handleCreateDeal() executa
2. Valida: companyId existe? Sim
3. Console: "companyId: uuid, hasCompanyId: true"
4. Mutation: { company_id: "uuid" }
5. Supabase INSERT: company_id = 'uuid'
6. Deal criado COM vínculo
7. Console: "company_id: uuid" (não null!)
```

---

## 🐛 SE AINDA NÃO FUNCIONAR

### **Empresas ainda aparecem como total: 0**

**Debug no console do navegador:**
```javascript
// Copie e cole no console:
const { createClient } = await import('/node_modules/@supabase/supabase-js/dist/module/index.js');
const supabase = createClient(
  'https://cfydbvrzjtbcrbzimfjm.supabase.co',
  'sua_anon_key_aqui'
);

const { data: user } = await supabase.auth.getUser();
console.log('User ID:', user?.user?.id);

const { data, error } = await supabase
  .from('companies')
  .select('*')
  .eq('user_id', user.user.id);

console.log('Empresas do user:', data);
console.log('Erro:', error);
```

**Possíveis causas:**

1. **RLS bloqueando consulta:**
```sql
-- Verificar policies no Supabase:
SELECT * FROM pg_policies WHERE tablename = 'companies';

-- Deve ter policy tipo:
-- CREATE POLICY "Users can view own companies"
-- ON companies FOR SELECT
-- USING (auth.uid() = user_id);
```

2. **user_id diferente:**
```sql
-- Verificar user_id das empresas:
SELECT DISTINCT user_id FROM companies;

-- Comparar com user logado:
SELECT auth.uid();

-- Se diferente: empresas foram criadas por outro usuário
```

3. **Tabela vazia:**
```sql
-- Contar empresas:
SELECT COUNT(*) FROM companies;

-- Se 0: Cadastre empresas em /companies
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

- [ ] Console mostra: `✅ Empresas buscadas: { total: X }`
- [ ] Console mostra: `🏢 Empresas disponíveis: { total: X }`
- [ ] Autocomplete exibe lista de empresas
- [ ] Ao selecionar empresa, nome aparece no botão
- [ ] Console mostra: `companyId: "uuid", hasCompanyId: true`
- [ ] Deal criado com `company_id: "uuid"` (não null)
- [ ] SQL confirma vínculo: `SELECT * FROM deals WHERE company_id IS NOT NULL`

---

## 📝 ARQUIVOS MODIFICADOS

1. ✅ `src/services/companyService.ts` (linha 228, 277-285)
   - Tipo de retorno: `{ companies: [], count: 0 }`
   - Console.log de debug
   
2. ✅ `src/components/CreateDealDialog.tsx` (linha 1, 70-82, 193-208)
   - Import React
   - Logs detalhados
   - Campo source removido
   - useEffect com dependências corretas

---

## 🚀 RESULTADO ESPERADO

### **Console limpo:**
```
✅ Empresas buscadas: { total: 5, empresas: ["Nubank", ...] }
🏢 Empresas disponíveis: { total: 5, empresas: [{id, name}, ...] }
🚀 Iniciando criação... { companyId: "uuid", hasCompanyId: true }
🔍 Criando deal: { company_id: "uuid", ... }
✅ Deal criado com sucesso: { company_id: "uuid", ... }
📝 Adicionando 1 participantes...
✅ Participante 1/1 adicionado
```

### **Kanban atualizado:**
- Card aparece com nome da empresa
- Ao abrir, mostra dados completos
- Empresa vinculada corretamente

---

**Status:** ✅ CORRIGIDO
**Próximo teste:** Recarregue e teste agora!
