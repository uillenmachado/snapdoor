# 🔧 Melhorias - Dialog Adicionar Participante (V2)

**Data**: 17 de outubro de 2025  
**Status**: ✅ **MELHORADO**

---

## 🎯 **Melhorias Aplicadas**

### **1. Exibição Melhorada de Leads**

**Antes**:
```
João Silva
Sem empresa
```

**Depois**:
```
João Silva
Acme Corp • CEO • joao@acme.com
```

**Mudança**:
- Agora mostra `company`, `job_title` e `email` separados por `•`
- Remove "Sem empresa" quando não houver dados
- Exibe apenas informações disponíveis

---

### **2. Estado Vazio Tratado**

**Quando não há leads cadastrados**:
```
┌────────────────────────────────────┐
│ Selecione um lead...             ▼ │
└────────────────────────────────────┘

Nenhum lead disponível. Crie um lead primeiro.
```

**Código**:
```tsx
{allLeads.length === 0 && (
  <div className="p-4 text-center text-sm text-muted-foreground">
    Nenhum lead disponível. Crie um lead primeiro.
  </div>
)}
```

---

### **3. Link para Criar Novo Lead**

**Abaixo do select**:
```
Não encontrou o lead? [Criar novo lead]
```

**Comportamento**:
- Link abre `/leads` em nova aba
- Classe `text-primary hover:underline`
- Permite criar lead sem perder contexto

**Código**:
```tsx
<p className="text-xs text-muted-foreground mt-1">
  Não encontrou o lead? 
  <a href="/leads" target="_blank" className="text-primary hover:underline">
    Criar novo lead
  </a>
</p>
```

---

### **4. Altura Máxima do Dropdown**

**Antes**: Scroll infinito
**Depois**: `max-h-[300px]` com scroll controlado

```tsx
<SelectContent className="max-h-[300px]">
```

---

### **5. Debug Console Log**

**Adicionado temporariamente**:
```tsx
console.log('Leads disponíveis:', allLeads.length, allLeads.slice(0, 3));
```

**Propósito**: 
- Verificar quantos leads estão sendo carregados
- Ver estrutura dos dados (company, job_title, email)
- Identificar se o problema é nos dados ou na exibição

---

## 📊 **Estrutura do Lead Esperada**

```typescript
interface Lead {
  id: string;
  name: string;
  company?: string;      // Pode ser null
  job_title?: string;    // Pode ser null
  email?: string;        // Pode ser null
  phone?: string;
  // ... outros campos
}
```

---

## 🧪 **Como Testar Agora**

### **Teste 1: Verificar Leads no Console**

1. Abra uma oportunidade
2. Pressione **F12** (DevTools)
3. Vá para a tab **Console**
4. Procure: `Leads disponíveis: X [...]`
5. Verifique a estrutura dos dados

**Esperado**:
```
Leads disponíveis: 12 [
  {
    id: "...",
    name: "João Silva",
    company: "Acme Corp",
    job_title: "CEO",
    email: "joao@acme.com"
  },
  ...
]
```

---

### **Teste 2: Adicionar Participante**

1. Vá para tab **"Participantes"**
2. Clique em **"Adicionar"**
3. Clique no campo **"Lead"**
4. Verifique se os leads aparecem com informações completas:
   - ✅ Nome em negrito
   - ✅ Empresa • Cargo • Email (se disponíveis)
   - ✅ Scroll limitado (máximo 300px)

---

### **Teste 3: Criar Novo Lead**

**Cenário**: Lead não está na lista

1. Abra dialog "Adicionar Participante"
2. Clique em **"Criar novo lead"** (link abaixo do select)
3. Nova aba abre em `/leads`
4. Crie o lead
5. Volte para a aba da oportunidade
6. Feche e reabra o dialog
7. Lead deve aparecer na lista

---

## 🐛 **Possíveis Problemas**

### **Problema 1: Todos os leads aparecem como "Sem empresa"**

**Causa**: Campo `company` está null no banco de dados

**Solução Temporária**: Usar campo `company_id` para buscar empresa relacionada

**Verificar**:
```sql
SELECT id, name, company, job_title, email FROM leads LIMIT 5;
```

---

### **Problema 2: Leads não aparecem**

**Causa Possível**: 
- `allLeads` está vazio
- Problema no `useLeads(user?.id)`
- Usuário não tem leads cadastrados

**Debug**:
1. Verificar console: `Leads disponíveis: 0`
2. Ir para `/leads` e criar alguns leads
3. Voltar e testar novamente

---

### **Problema 3: Dropdown não abre**

**Causa**: Conflito de z-index ou portal

**Solução**: SelectContent já está usando portal automático do Radix

---

## 🔄 **Próxima Iteração (Se Necessário)**

### **Opção A: Usar Campo de Busca**
Se houver muitos leads (50+), considere adicionar busca:

```tsx
<Input 
  placeholder="Buscar lead..."
  onChange={(e) => setSearchTerm(e.target.value)}
/>
```

### **Opção B: Criar Lead Inline**
Dialog dentro de dialog:

```tsx
<Button onClick={() => setIsCreatingLead(true)}>
  + Criar Novo Lead
</Button>

<Dialog open={isCreatingLead}>
  {/* Form de criar lead */}
</Dialog>
```

### **Opção C: Usar Combobox com Busca**
Voltar ao Combobox mas com layout corrigido:

```tsx
<Combobox>
  <ComboboxInput placeholder="Digite para buscar..." />
  <ComboboxOptions>
    {filteredLeads.map(...)}
  </ComboboxOptions>
</Combobox>
```

---

## ✅ **Checklist**

- [x] Select com altura máxima (300px)
- [x] Exibição melhorada (company • job_title • email)
- [x] Estado vazio tratado
- [x] Link para criar novo lead
- [x] Debug console.log adicionado
- [ ] **Verificar console do navegador** ← TESTAR
- [ ] **Confirmar dados dos leads** ← TESTAR
- [ ] **Adicionar participante com sucesso** ← TESTAR

---

**Agora teste e me diga o que aparece no console! 🔍**

Especialmente:
1. Quantos leads estão sendo carregados?
2. Qual a estrutura dos dados (tem company, job_title, email)?
