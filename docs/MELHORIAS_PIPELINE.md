# 🎯 Melhorias no Pipeline - Plano de Implementação

## 📋 Objetivos

1. ✅ Remover duplicação da página "Negócios" 
2. 🎨 Melhorar contraste e padrão de cores dark
3. ⚙️ Expandir ações dos cards (menu de 3 pontos)
4. 📊 Implementar histórico de negócios

---

## 1. Remoção de Duplicação

### Estado Atual
- ✅ AppSidebar já tem apenas "Pipeline" (sem duplicata)
- ✅ Pipelines.tsx é a página principal
- ❌ Deals.tsx existe mas NÃO está no menu (legacy code)

### Ação
- Manter Deals.tsx para compatibilidade de rotas antigas
- Focar melhorias em Pipelines.tsx

---

## 2. Menu de Ações do Card (3 pontos)

### Referência: Pipedrive/HubSpot

**Ações Principais:**
1. ⭐ **Favoritar** - Marcar negócio importante
2. ✅ **Marcar como Ganho** - Mover para histórico (won)
3. ❌ **Marcar como Perdido** - Mover para histórico (lost)
4. 📋 **Duplicar Oportunidade** - Criar cópia com novo lead
5. ✏️ **Editar** - Abrir detalhes para edição
6. 🗑️ **Excluir** - Remover negócio

### Estado Atual (DealCard.tsx)
```tsx
<DropdownMenu>
  <DropdownMenuItem>Editar</DropdownMenuItem>
  <DropdownMenuItem>Marcar como Ganho</DropdownMenuItem>
  <DropdownMenuItem>Marcar como Perdido</DropdownMenuItem>
  <DropdownMenuItem>Excluir</DropdownMenuItem>
</DropdownMenu>
```

### Melhorias Necessárias
- [ ] Adicionar ⭐ Favoritar
- [ ] Adicionar 📋 Duplicar
- [ ] Melhorar ícones e cores
- [ ] Adicionar confirmação antes de excluir

---

## 3. Sistema de Histórico de Negócios

### Referência: Pipedrive

**Fluxo:**
1. Negócio em Pipeline → status = 'open'
2. Marcar como Ganho → status = 'won', archived_at = NOW()
3. Marcar como Perdido → status = 'lost', archived_at = NOW(), lost_reason

**Dados Preservados:**
- Valor do negócio
- Data de fechamento
- Motivo da perda (se perdido)
- Histórico de atividades
- Notas e anexos
- Participantes
- Todas as métricas

### Schema Atual (deals table)
```sql
CREATE TABLE deals (
  id UUID PRIMARY KEY,
  title TEXT,
  value DECIMAL,
  status TEXT CHECK (status IN ('open', 'won', 'lost')), -- ✅ JÁ TEM
  stage_id UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  closed_at TIMESTAMP, -- ⚠️ Precisa adicionar
  lost_reason TEXT, -- ⚠️ Precisa adicionar
  is_favorite BOOLEAN DEFAULT FALSE -- ⚠️ Precisa adicionar
);
```

### Migration Necessária
```sql
-- Adicionar campos para histórico
ALTER TABLE deals ADD COLUMN IF NOT EXISTS closed_at TIMESTAMP;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS lost_reason TEXT;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;

-- Índice para consultas de histórico
CREATE INDEX IF NOT EXISTS idx_deals_status_closed_at ON deals(status, closed_at);
CREATE INDEX IF NOT EXISTS idx_deals_favorite ON deals(is_favorite) WHERE is_favorite = TRUE;
```

### Implementação

#### A. Hook useDeals
```typescript
// Adicionar filtros
export function useDealsHistory(userId: string, status: 'won' | 'lost') {
  return useQuery({
    queryKey: ['deals-history', userId, status],
    queryFn: async () => {
      const { data } = await supabase
        .from('deals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', status)
        .order('closed_at', { ascending: false });
      return data;
    }
  });
}
```

#### B. Mutações
```typescript
// Já existe: useMarkDealAsWon, useMarkDealAsLost
// Adicionar: useDuplicateDeal, useToggleFavorite
```

#### C. Nova Página: DealsHistory.tsx
- Tabs: Ganhos | Perdidos
- Filtros: Data, Valor, Stage original
- Métricas: Taxa conversão, Ticket médio, Ciclo de vendas
- Cards com badges (Ganho 🎉 / Perdido ❌)

---

## 4. Uniformização de Cores Dark

### Problemas Identificados
- ❌ Excesso de branco em fundos
- ❌ Contraste insuficiente
- ❌ Inconsistência entre componentes

### Palette Padrão (Pipedrive-inspired)

#### Backgrounds
```css
/* Aplicação */
--background: 222.2 84% 4.9%; /* Quase preto (dark) */
--card: 222.2 84% 6%; /* Cards ligeiramente mais claros */
--muted: 217.2 32.6% 17.5%; /* Áreas secundárias */

/* Headers/Sidebars */
--sidebar: 222.2 84% 5.5%;
--header: 222.2 84% 5.5%;
```

#### Text
```css
/* Textos */
--foreground: 210 40% 98%; /* Branco quase puro */
--muted-foreground: 215 20.2% 65.1%; /* Texto secundário */

/* Contraste mínimo: 7:1 (AAA WCAG) */
```

#### Accents
```css
--primary: 142 76% 36%; /* Brand green */
--accent: 217.2 32.6% 17.5%; /* Hover states */
--border: 217.2 32.6% 15%; /* Bordas sutis */
```

### Componentes a Ajustar

#### Cards (DealCard.tsx)
```tsx
// ANTES
className="bg-white dark:bg-neutral-900"

// DEPOIS
className="bg-card border-border hover:bg-accent/50"
```

#### Tables (Leads.tsx)
```tsx
// ANTES
className="bg-neutral-100 text-neutral-900"

// DEPOIS
className="bg-muted/50 text-foreground"
```

#### Kanban Columns
```tsx
// ANTES
className="bg-neutral-50 dark:bg-neutral-900"

// DEPOIS
className="bg-card/30 border-border"
```

---

## 📊 Checklist de Implementação

### Fase 1: Menu de Ações (Prioridade ALTA)
- [ ] Adicionar ícone "Favoritar" (Star)
- [ ] Implementar "Duplicar negócio"
- [ ] Adicionar confirmação em "Excluir"
- [ ] Melhorar visual do menu (ícones + cores)

### Fase 2: Histórico (Prioridade ALTA)
- [ ] Migration: closed_at, lost_reason, is_favorite
- [ ] Hook: useDealsHistory
- [ ] Hook: useDuplicateDeal
- [ ] Hook: useToggleFavorite
- [ ] Página: DealsHistory.tsx
- [ ] Adicionar ao menu: "Histórico"

### Fase 3: Cores Dark (Prioridade MÉDIA)
- [ ] Atualizar tailwind.config.ts (palette)
- [ ] Ajustar DealCard.tsx
- [ ] Ajustar Leads.tsx
- [ ] Ajustar Pipelines.tsx (colunas)
- [ ] Ajustar AppSidebar.tsx
- [ ] Testar contraste (mínimo 7:1)

### Fase 4: Refinamentos (Prioridade BAIXA)
- [ ] Animações de transição
- [ ] Loading states
- [ ] Empty states
- [ ] Tooltips informativos
- [ ] Keyboard shortcuts

---

## 🎯 Resultado Esperado

### Funcionalidades
✅ Menu completo de ações nos cards  
✅ Sistema de favoritos  
✅ Duplicação de negócios  
✅ Histórico completo (ganhos/perdidos)  
✅ Métricas de conversão  

### Visual
✅ Contraste AAA (7:1 mínimo)  
✅ Palette dark consistente  
✅ Menos branco, mais escuro  
✅ Visual profissional (Pipedrive-like)  

### Experiência
✅ Ações rápidas (3 pontos)  
✅ Confirmações quando necessário  
✅ Feedback visual claro  
✅ Performance mantida  

---

**Última atualização:** 16/10/2025  
**Status:** 📝 Planejamento completo  
**Próximo passo:** Implementar Fase 1 (Menu de Ações)
