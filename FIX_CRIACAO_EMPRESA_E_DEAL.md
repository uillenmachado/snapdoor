# 🔧 CORREÇÃO: Criação de Empresa e Atualização do Funil

## 🐛 Problemas Identificados

### 1. Nova empresa não era criada
**Sintoma:** Ao digitar uma empresa nova, ela não aparecia na lista de empresas depois.

**Causa Raiz:**
```typescript
// ❌ ANTES: Código enviava company_id undefined
const newDeal = await createDealMutation.mutateAsync({
  company_id: companyId || undefined, // undefined se empresa nova
});
```

O código verificava se a empresa existia (`companyId`), mas **nunca criava** a empresa nova antes de criar o deal.

---

### 2. Oportunidade não aparecia no funil
**Sintoma:** Deal criado mas não aparece no kanban/pipeline.

**Causa Raiz:**
- Cache do React Query não era invalidado manualmente
- Delay curto demais (300ms) antes de fechar dialog
- Query de deals do stage específico não era invalidada

---

## ✅ Soluções Implementadas

### 1️⃣ Criar Empresa Antes do Deal

**Arquivo:** `src/components/CreateDealDialog.tsx`

```typescript
// ✅ DEPOIS: Criar empresa se for nova
let finalCompanyId = companyId;

if (!companyId && companyName.trim()) {
  console.log('🏢 Criando nova empresa:', companyName);
  try {
    const newCompany = await createCompany({
      user_id: userId,
      name: companyName.trim(),
    });
    finalCompanyId = newCompany.id;
    console.log('✅ Empresa criada:', newCompany.id, newCompany.name);
    toast.success(`Empresa "${companyName}" criada com sucesso!`);
  } catch (error: any) {
    console.error('❌ Erro ao criar empresa:', error);
    toast.error(`Erro ao criar empresa: ${error.message}`);
    // Continua sem empresa vinculada
  }
}

// Usar finalCompanyId no deal
const newDeal = await createDealMutation.mutateAsync({
  company_id: finalCompanyId || undefined, // ✅ ID da empresa recém-criada
});
```

**Fluxo Implementado:**
1. ✅ Verifica se `companyId` existe (empresa selecionada)
2. ✅ Se não existe e `companyName` foi digitado → **Cria empresa**
3. ✅ Usa `finalCompanyId` (existente ou recém-criado) no deal
4. ✅ Toast de sucesso para cada etapa
5. ✅ Tratamento de erro sem bloquear criação do deal

---

### 2️⃣ Invalidação de Cache Completa

**Antes:**
```typescript
toast.success(`🎉 Oportunidade criada!`);
await new Promise(resolve => setTimeout(resolve, 300)); // ❌ Delay curto
onClose();
```

**Depois:**
```typescript
toast.success(`🎉 Oportunidade "${title}" criada com ${selectedLeads.length} participante(s)!`);

// ✅ Invalidar todos os caches relevantes
await queryClient.invalidateQueries({ queryKey: ["deals"] });
await queryClient.invalidateQueries({ queryKey: ["companies"] });
await queryClient.invalidateQueries({ queryKey: ["analytics"] });

// ✅ Delay maior para garantir persistência
await new Promise(resolve => setTimeout(resolve, 500));
onClose();
```

**Caches Invalidados:**
- `["deals"]` → Lista geral de deals
- `["companies"]` → Lista de empresas (mostra nova empresa)
- `["analytics"]` → Métricas do dashboard

---

### 3️⃣ Import do `createCompany`

**Arquivo:** `src/components/CreateDealDialog.tsx`

```typescript
import { createCompany } from "@/services/companyService";
import { useQueryClient } from "@tanstack/react-query";

export function CreateDealDialog({ ... }: CreateDealDialogProps) {
  const queryClient = useQueryClient(); // ✅ Hook adicionado
  // ...
}
```

---

## 🧪 Teste Manual

### Cenário 1: Criar Empresa Nova + Deal
1. Abrir diálogo "Nova Oportunidade"
2. **Empresa:** Digitar "Consultoria XYZ" (não existente)
3. Clicar no botão "+ Criar nova empresa: Consultoria XYZ"
4. Verificar toast: "Empresa 'Consultoria XYZ' criada com sucesso!"
5. Preencher campos e adicionar contatos
6. Criar oportunidade
7. **Verificar:**
   - ✅ Toast: "🎉 Oportunidade criada com X participante(s)!"
   - ✅ Empresa "Consultoria XYZ" aparece na lista de empresas
   - ✅ Deal aparece no kanban na etapa selecionada

---

### Cenário 2: Usar Empresa Existente
1. Abrir diálogo
2. **Empresa:** Selecionar "Padaria do zé" (existente)
3. Verificar mensagem verde: "Empresa existente selecionada"
4. Criar oportunidade
5. **Verificar:**
   - ✅ Deal criado com `company_id` correto
   - ✅ Aparece no kanban

---

### Cenário 3: Criar Deal Sem Empresa
1. Abrir diálogo
2. **Empresa:** Deixar vazio (não obrigatório)
3. Criar oportunidade
4. **Verificar:**
   - ✅ Deal criado com `company_id = null`
   - ✅ Aparece no kanban

---

## 📊 Console Logs Esperados

```javascript
// 1. Ao abrir dialog
🏢 Empresas disponíveis: { total: 11, loading: false, ... }

// 2. Ao criar empresa nova
🚀 Iniciando criação de oportunidade...
🏢 Criando nova empresa: Consultoria XYZ
✅ Empresa criada: uuid-123, Consultoria XYZ

// 3. Ao criar deal
🔍 Criando deal: { title, value, company_id: "uuid-123", ... }
✅ Deal criado com sucesso: { id: "uuid-456", ... }

// 4. Ao adicionar participantes
📝 Adicionando 1 participantes...
✅ Participante 1/1 adicionado: João Silva
```

---

## 🔍 Verificação no Supabase

### Tabela `companies`
```sql
SELECT id, name, user_id, created_at
FROM companies
WHERE name = 'Consultoria XYZ'
ORDER BY created_at DESC
LIMIT 1;
```

**Resultado esperado:**
- ✅ Registro existe
- ✅ `user_id` correto
- ✅ `created_at` recente

---

### Tabela `deals`
```sql
SELECT 
  d.id,
  d.title,
  d.company_id,
  c.name as company_name,
  s.name as stage_name
FROM deals d
LEFT JOIN companies c ON d.company_id = c.id
LEFT JOIN stages s ON d.stage_id = s.id
WHERE d.title LIKE '%Consultoria%'
ORDER BY d.created_at DESC
LIMIT 5;
```

**Resultado esperado:**
- ✅ Deal existe
- ✅ `company_id` aponta para empresa criada
- ✅ `stage_id` correto
- ✅ JOIN retorna nome da empresa

---

### Tabela `deal_participants`
```sql
SELECT 
  dp.deal_id,
  dp.lead_id,
  dp.role,
  dp.is_primary,
  l.first_name,
  l.last_name
FROM deal_participants dp
JOIN leads l ON dp.lead_id = l.id
WHERE dp.deal_id = 'SEU_DEAL_ID_AQUI';
```

**Resultado esperado:**
- ✅ Participantes vinculados
- ✅ Roles corretos
- ✅ `is_primary = true` no primeiro

---

## 🚀 Melhorias Futuras (Opcional)

### 1. Enriquecimento Automático de Empresa
```typescript
if (!companyId && companyName.trim()) {
  const newCompany = await createCompany({
    user_id: userId,
    name: companyName.trim(),
    domain: extractDomainFromName(companyName), // ✨ Deduzir domínio
  });
  
  // ✨ Enriquecer com dados externos
  enrichCompanyData(newCompany.id);
}
```

---

### 2. Validação de Nome Duplicado
```typescript
// Verificar se empresa já existe com nome similar
const existing = allCompanies.find(c => 
  c.name.toLowerCase() === companyName.toLowerCase()
);

if (existing) {
  const confirm = window.confirm(
    `Empresa "${existing.name}" já existe. Deseja usar ela?`
  );
  if (confirm) {
    finalCompanyId = existing.id;
  }
}
```

---

### 3. Undo/Desfazer
```typescript
toast.success(`Empresa criada!`, {
  action: {
    label: "Desfazer",
    onClick: () => deleteCompany(newCompany.id),
  },
});
```

---

## 📝 Checklist Pós-Deploy

- [ ] Testar criação de deal com empresa nova
- [ ] Testar criação de deal com empresa existente
- [ ] Verificar aparição no kanban
- [ ] Verificar lista de empresas atualizada
- [ ] Verificar console logs
- [ ] Verificar SQL (empresas + deals + participants)
- [ ] Testar dark mode
- [ ] Testar responsividade mobile
- [ ] Verificar performance (delays adequados)
- [ ] Remover console.logs de debug (opcional)

---

## 🎯 Impacto

### Antes
- ❌ Empresas novas não eram salvas
- ❌ Deal aparecia "solto" sem empresa
- ❌ Usuário confuso (empresa sumia)
- ❌ Cache não atualizava

### Depois
- ✅ Empresa criada automaticamente
- ✅ Deal vinculado à empresa
- ✅ Aparece na lista de empresas imediatamente
- ✅ Cache invalidado corretamente
- ✅ UX consistente e previsível

---

## 📞 Suporte

Se ainda não aparecer no funil após correção:
1. Verifique console (erros?)
2. Inspecione Network (requisições Supabase)
3. Verifique SQL (deals criados?)
4. Teste com `localStorage.clear()` (limpar cache local)
5. Hard reload: `Ctrl + Shift + R`
