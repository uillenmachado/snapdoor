# 🔍 Pesquisa de Padrões UI do Pipedrive

**Data da Pesquisa:** 15 de outubro de 2025  
**Objetivo:** Documentar padrões visuais e de UX do Pipedrive CRM para implementação no SnapDoor  
**Metodologia:** Análise de páginas públicas oficiais do Pipedrive, screenshots e documentação

---

## 📚 Fontes Consultadas

### Fonte 1: Pipedrive Pipeline Management
- **URL:** https://www.pipedrive.com/en/features/pipeline-management
- **Data de Acesso:** 15/10/2025
- **Relevância:** Documentação oficial sobre gestão de pipeline, principal interface do Pipedrive

### Fonte 2: Pipedrive Features Overview
- **URL:** https://www.pipedrive.com/en/features
- **Data de Acesso:** 15/10/2025
- **Relevância:** Visão geral de funcionalidades e padrões de interface

---

## 🎨 Padrões Visuais Identificados

### 1. Pipeline Board (Kanban)

**Características Principais:**
- ✅ **Visual claro e orientado a ação** - Interface principal é o pipeline
- ✅ **Colunas verticais** representando etapas do funil de vendas
- ✅ **Headers de colunas** com:
  - Nome da etapa
  - Contagem de negócios na etapa
  - Valor total em moeda (somatório)
  - Cor de identificação sutil
- ✅ **Cards de negócios** arrastaveis (drag & drop) com:
  - Nome do negócio/empresa
  - Valor monetário destacado
  - Ícone de contato/pessoa
  - Status visual (cores discretas)
  - Quick actions ao hover
- ✅ **Espaçamento generoso** entre colunas e cards
- ✅ **Cores neutras** como base (cinzas claros/médios)
- ✅ **Acentos de cor** para status e ações importantes

**Padrão Derivado:**
```
Pipeline Board Layout:
┌─────────────────────────────────────────────────────────┐
│  🔍 Busca  [Filtros]  [+ Novo Negócio]          [Views] │
├─────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│ │ Etapa 1 │ │ Etapa 2 │ │ Etapa 3 │ │ Etapa 4 │       │
│ │ 5 deals │ │ 3 deals │ │ 7 deals │ │ 2 deals │       │
│ │ $15.2K  │ │ $8.5K   │ │ $22.1K  │ │ $9.8K   │       │
│ ├─────────┤ ├─────────┤ ├─────────┤ ├─────────┤       │
│ │ [Card]  │ │ [Card]  │ │ [Card]  │ │ [Card]  │       │
│ │ [Card]  │ │ [Card]  │ │ [Card]  │ │ [Card]  │       │
│ │ [Card]  │ │         │ │ [Card]  │ │         │       │
│ │ [Card]  │ │         │ │ [Card]  │ │         │       │
│ │ [Card]  │ │         │ │ ...     │ │         │       │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
└─────────────────────────────────────────────────────────┘
```

---

### 2. Navegação e App Shell

**Características Principais:**
- ✅ **Topbar fixa** no topo:
  - Logo/marca à esquerda
  - Busca global centralizada
  - Ações rápidas (+ Novo, Notificações)
  - Avatar/perfil à direita
- ✅ **Sidebar lateral esquerda**:
  - Ícones + labels para navegação
  - Seções agrupadas logicamente
  - Estado ativo destacado
  - Recolhível para ganhar espaço
- ✅ **Área de conteúdo principal** com:
  - Breadcrumb ou título da página
  - Filtros e ações contextuais
  - Conteúdo adaptativo (board, lista, detalhe)

**Padrão Derivado:**
```
App Shell Layout:
┌─────────────────────────────────────────────────────────┐
│ [Logo] 🔍 Busca Global    [+ Novo] [🔔] [👤]           │ ← Topbar
├───┬─────────────────────────────────────────────────────┤
│ ☰ │ 📊 Dashboard                                        │
│ 📊│ 🌿 Pipeline                                         │ ← Sidebar
│ 🌿│ 💼 Negócios                                         │    (recolhível)
│ 👥│ 👥 Leads                                            │
│ 📄│ 📄 Atividades                                       │
│ ⚡│ ...                                                 │
│───┤                                                     │
│   │ [Conteúdo Principal]                               │ ← Main Content
│   │                                                     │    Area
└───┴─────────────────────────────────────────────────────┘
```

---

### 3. Lista Tabular (List View)

**Características Principais:**
- ✅ **Tabela com colunas personalizáveis**
- ✅ **Filtros salvos** (ex: "Meus negócios", "Por fechar hoje")
- ✅ **Busca em tempo real**
- ✅ **Ordenação por colunas** (↑↓)
- ✅ **Seleção em lote** (checkboxes)
- ✅ **Ações contextuais** (editar, deletar, mover)
- ✅ **Paginação** ou scroll infinito
- ✅ **Densidade ajustável** (compacto, confortável, espaçoso)

**Padrão Derivado:**
```
List View Layout:
┌─────────────────────────────────────────────────────────┐
│ 🔍 Busca  [Filtros Salvos ▾] [+ Novo]  [⚙️ Colunas]    │
├─────────────────────────────────────────────────────────┤
│ ☐ │ Nome          │ Valor    │ Etapa   │ Responsável  │
│───┼───────────────┼──────────┼─────────┼──────────────│
│ ☐ │ Empresa A     │ $5.2K    │ Etapa 2 │ João Silva   │
│ ☐ │ Empresa B     │ $12.8K   │ Etapa 3 │ Maria Costa  │
│ ☐ │ Empresa C     │ $3.5K    │ Etapa 1 │ Pedro Santos │
│ ...                                                     │
├─────────────────────────────────────────────────────────┤
│ Mostrando 1-25 de 147  [← 1 2 3 ... 6 →]               │
└─────────────────────────────────────────────────────────┘
```

---

### 4. Detalhe de Deal/Lead (Panel Layout)

**Características Principais:**
- ✅ **Layout em painéis**:
  - Painel principal esquerdo (70%) - Informações do negócio
  - Painel lateral direito (30%) - Timeline e atividades
- ✅ **Informações principais** no topo:
  - Nome do negócio
  - Valor
  - Etapa atual
  - Responsável
  - Status
- ✅ **Tabs para seções**:
  - Detalhes
  - Atividades
  - Notas
  - Emails
  - Arquivos
  - Timeline
- ✅ **Campos personalizados** organizados em seções
- ✅ **Edição inline** de campos
- ✅ **Quick actions** no topo (Editar, Mover, Deletar, Ganhou, Perdeu)

**Padrão Derivado:**
```
Detail View Layout:
┌─────────────────────────────────────────────────────────┐
│ ← Voltar  │  Empresa XYZ - $25.000                      │
│           │  [Ganhou] [Perdeu] [Editar] [⋮]             │
├───────────────────────────┬─────────────────────────────┤
│ Painel Principal          │ Painel Lateral              │
│                           │                             │
│ [Detalhes] [Atividades]   │ 📅 Próxima Atividade        │
│ [Notas] [Emails]          │ • Reunião em 2 dias         │
│                           │                             │
│ ┌──────────────────────┐  │ ⏱️ Timeline                 │
│ │ Nome: Empresa XYZ    │  │ • Criado há 5 dias          │
│ │ Valor: $25.000       │  │ • Movido para Etapa 2       │
│ │ Etapa: Proposta      │  │ • Email enviado             │
│ │ Responsável: João    │  │ • Nota adicionada           │
│ │ Email: contato@...   │  │                             │
│ │ Telefone: +55...     │  │                             │
│ └──────────────────────┘  │                             │
│                           │                             │
└───────────────────────────┴─────────────────────────────┘
```

---

### 5. Modais e Drawers

**Características Principais:**
- ✅ **Modais centrados** para ações importantes:
  - Criar/editar item
  - Confirmações
  - Formulários complexos
- ✅ **Drawers laterais** para quick views e edições rápidas
- ✅ **Header do modal** com:
  - Título claro
  - Botão fechar (X)
  - Ações secundárias se necessário
- ✅ **Footer do modal** com:
  - Botão primário (Salvar, Criar)
  - Botão secundário (Cancelar)
  - Alinhamento: primário à direita
- ✅ **Validação em tempo real** nos campos
- ✅ **Feedback visual** de erros e sucesso

**Padrão Derivado:**
```
Modal Layout:
┌─────────────────────────────────────┐
│ Criar Novo Negócio              [X] │
├─────────────────────────────────────┤
│                                     │
│ Nome do Negócio *                   │
│ [___________________________]       │
│                                     │
│ Valor                               │
│ [___________________________]       │
│                                     │
│ Etapa                               │
│ [Selecionar etapa ▾]                │
│                                     │
│ Responsável                         │
│ [Selecionar pessoa ▾]               │
│                                     │
├─────────────────────────────────────┤
│           [Cancelar]  [Criar] →     │
└─────────────────────────────────────┘
```

---

### 6. Feedbacks e Estados

**Características Principais:**
- ✅ **Toasts/Notificações**:
  - Canto superior direito
  - Auto-dismiss após 3-5s
  - Ícone de status (✓ sucesso, ! erro, ℹ info)
  - Fundo com cor do status
- ✅ **Loading States**:
  - Skeleton loaders para conteúdo
  - Spinner para ações pontuais
  - Progress bar para uploads/processos longos
- ✅ **Empty States**:
  - Ícone ilustrativo
  - Mensagem clara do que fazer
  - CTA para criar primeiro item
- ✅ **Error States**:
  - Mensagem de erro clara
  - Sugestão de ação
  - Botão para tentar novamente

---

## 🎨 Sistema de Cores Pipedrive

### Cores Principais (Estimadas)
**Observação:** Cores derivadas de análise visual pública, não temos acesso ao código proprietário.

```css
/* Primárias */
--pipedrive-primary: hsl(210, 100%, 55%)      /* Azul principal */
--pipedrive-primary-dark: hsl(210, 100%, 45%) /* Azul escuro */
--pipedrive-success: hsl(145, 60%, 45%)       /* Verde sucesso */
--pipedrive-warning: hsl(40, 100%, 55%)       /* Laranja/amarelo */
--pipedrive-danger: hsl(0, 70%, 55%)          /* Vermelho */

/* Neutros */
--pipedrive-gray-50: hsl(220, 15%, 98%)       /* Background claro */
--pipedrive-gray-100: hsl(220, 15%, 95%)      /* Cinza muito claro */
--pipedrive-gray-200: hsl(220, 15%, 90%)      /* Borders */
--pipedrive-gray-300: hsl(220, 15%, 80%)      /* Borders hover */
--pipedrive-gray-400: hsl(220, 15%, 65%)      /* Text muted */
--pipedrive-gray-500: hsl(220, 15%, 50%)      /* Text secondary */
--pipedrive-gray-600: hsl(220, 15%, 40%)      /* Text primary */
--pipedrive-gray-700: hsl(220, 15%, 30%)      /* Headings */
--pipedrive-gray-800: hsl(220, 15%, 20%)      /* Dark elements */
--pipedrive-gray-900: hsl(220, 15%, 12%)      /* Sidebar dark */

/* Status Colors (para etapas do pipeline) */
--stage-blue: hsl(210, 85%, 60%)
--stage-purple: hsl(270, 70%, 60%)
--stage-pink: hsl(330, 75%, 60%)
--stage-orange: hsl(25, 85%, 55%)
--stage-green: hsl(145, 60%, 50%)
--stage-teal: hsl(180, 60%, 50%)
```

### Princípios de Contraste
- ✅ **Texto em branco** sobre cores saturadas (primárias, status)
- ✅ **Texto escuro (gray-700+)** sobre fundos claros
- ✅ **Contraste mínimo 4.5:1** para texto normal (WCAG AA)
- ✅ **Contraste mínimo 3:1** para texto grande e ícones

---

## 📏 Tipografia e Espaçamentos

### Tipografia Estimada

```css
/* Font Family */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
             "Helvetica Neue", Arial, sans-serif;

/* Font Sizes */
--text-xs: 0.75rem    /* 12px - Labels, captions */
--text-sm: 0.875rem   /* 14px - Body small */
--text-base: 1rem     /* 16px - Body text */
--text-lg: 1.125rem   /* 18px - Subheadings */
--text-xl: 1.25rem    /* 20px - Card titles */
--text-2xl: 1.5rem    /* 24px - Page titles */
--text-3xl: 2rem      /* 32px - Hero titles */

/* Font Weights */
--font-normal: 400
--font-medium: 500    /* Mais usado */
--font-semibold: 600  /* Headings */
--font-bold: 700      /* Emphasis */

/* Line Heights */
--leading-tight: 1.25
--leading-normal: 1.5
--leading-relaxed: 1.75
```

### Escala de Espaçamentos

```css
/* Spacing Scale (baseada em 4px) */
--space-0: 0
--space-1: 0.25rem    /* 4px */
--space-2: 0.5rem     /* 8px */
--space-3: 0.75rem    /* 12px */
--space-4: 1rem       /* 16px */
--space-5: 1.25rem    /* 20px */
--space-6: 1.5rem     /* 24px */
--space-8: 2rem       /* 32px */
--space-10: 2.5rem    /* 40px */
--space-12: 3rem      /* 48px */
--space-16: 4rem      /* 64px */
```

### Raios de Borda

```css
--radius-none: 0
--radius-sm: 0.25rem   /* 4px - Buttons, badges */
--radius-md: 0.375rem  /* 6px - Cards, inputs */
--radius-lg: 0.5rem    /* 8px - Modals */
--radius-xl: 0.75rem   /* 12px - Large cards */
--radius-full: 9999px  /* Circular - Avatars */
```

### Sombras

```css
/* Elevação */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
             0 2px 4px -1px rgba(0, 0, 0, 0.06)
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
             0 4px 6px -2px rgba(0, 0, 0, 0.05)
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
             0 10px 10px -5px rgba(0, 0, 0, 0.04)
```

---

## 🧩 Componentes-Chave a Implementar/Modificar

### Alta Prioridade
1. ✅ **PipelineBoard** - Kanban com drag & drop
2. ✅ **PipelineColumn** - Coluna de etapa com header
3. ✅ **DealCard** - Card de negócio arrastável
4. ✅ **TopBar** - Barra superior fixa
5. ✅ **SideNavigation** - Menu lateral recolhível
6. ✅ **DataTable** - Tabela com filtros e ordenação
7. ✅ **DetailPanel** - Layout de detalhes em painéis
8. ✅ **Modal** - Modal padronizado
9. ✅ **Toast** - Notificações

### Média Prioridade
10. ✅ **FilterBar** - Barra de filtros salvos
11. ✅ **SearchInput** - Busca global
12. ✅ **QuickActions** - Menu de ações rápidas
13. ✅ **Timeline** - Linha do tempo de atividades
14. ✅ **EmptyState** - Estado vazio
15. ✅ **LoadingSkeleton** - Skeleton loader

### Baixa Prioridade (Nice to have)
16. ⏸️ **ActivityWidget** - Widget de atividades
17. ⏸️ **MetricsCard** - Card de métrica
18. ⏸️ **AvatarGroup** - Grupo de avatares
19. ⏸️ **StatusBadge** - Badge de status

---

## 📐 Grid e Layout Responsivo

### Breakpoints

```css
/* Mobile First */
--breakpoint-sm: 640px   /* Tablet small */
--breakpoint-md: 768px   /* Tablet */
--breakpoint-lg: 1024px  /* Desktop */
--breakpoint-xl: 1280px  /* Desktop large */
--breakpoint-2xl: 1536px /* Desktop extra large */
```

### Grid System

```css
/* Container */
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Grid 12 colunas */
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}

/* Padrões Comuns */
.layout-sidebar {
  /* Sidebar: 240px fixa, Main: restante */
  grid-template-columns: 240px 1fr;
}

.layout-detail {
  /* Main: 70%, Sidebar: 30% */
  grid-template-columns: 7fr 3fr;
}

.layout-board {
  /* Colunas do kanban: mínimo 280px, máximo 320px */
  grid-template-columns: repeat(auto-fill, minmax(280px, 320px));
}
```

---

## ♿ Acessibilidade (WCAG 2.2 AA)

### Checklist de Implementação

#### Contraste
- ✅ Texto normal: mínimo 4.5:1
- ✅ Texto grande (18px+ ou 14px bold): mínimo 3:1
- ✅ Ícones e elementos gráficos: mínimo 3:1
- ✅ Controle de formulários: mínimo 3:1

#### Navegação por Teclado
- ✅ Tab order lógico
- ✅ Focus visible em todos os elementos interativos
- ✅ Esc fecha modais e dropdowns
- ✅ Enter/Space ativa botões
- ✅ Arrow keys para navegação em listas/menus

#### ARIA e Semântica
- ✅ Landmarks apropriados (`<nav>`, `<main>`, `<aside>`)
- ✅ Headings hierárquicos (h1 → h2 → h3)
- ✅ `aria-label` em ícones sem texto
- ✅ `aria-live` para atualizações dinâmicas
- ✅ `role` apropriado quando necessário

#### Formulários
- ✅ Labels associados a inputs
- ✅ Mensagens de erro descritivas
- ✅ `aria-invalid` e `aria-describedby` para erros
- ✅ Placeholder não substitui label

#### Interações
- ✅ Drag & drop com alternativa por teclado
- ✅ Modais trapam foco
- ✅ Skip links para navegação rápida
- ✅ Loading states comunicados ao screen reader

---

## 🎯 Decisões de Design

### O Que Replicar (Aprovado)
✅ **Estrutura visual do pipeline board** - Layout de colunas com headers e cards  
✅ **Sistema de cores neutras** - Base de cinzas profissionais  
✅ **Navegação top + side** - App shell com topbar e sidebar  
✅ **Layout em painéis** - Divisão de conteúdo em detalhes  
✅ **Padrões de filtros e busca** - UX de filtros salvos e busca global  
✅ **Modais e drawers** - Estrutura e comportamento  
✅ **Feedbacks visuais** - Toasts, loading, empty states  
✅ **Hierarquia tipográfica** - Escalas e pesos  
✅ **Espaçamentos generosos** - Respiração visual  
✅ **Microinterações** - Hover states, transitions suaves  

### O Que NÃO Replicar (Proprietário)
❌ **Logo Pipedrive** - Manter identidade SnapDoor  
❌ **Cores específicas da marca** - Azul Pipedrive proprietário  
❌ **Textos de marketing** - Copy proprietário  
❌ **Ilustrações personalizadas** - Assets visuais proprietários  
❌ **Ícones customizados** - Se forem exclusivos do Pipedrive  
❌ **Animações complexas de marca** - Efeitos de marca registrada  

### Adaptações SnapDoor
🔧 **Verde SnapDoor como primária** - Manter identidade da marca  
🔧 **Roxo SnapDoor para CTAs** - Cores secundárias distintas  
🔧 **Ícones Lucide** - Biblioteca open-source consistente  
🔧 **Fontes do sistema** - System fonts para performance  
🔧 **Dark mode nativo** - Já existe, manter e aprimorar  

---

## 📊 Métricas de Sucesso

### Visuais
- [ ] Aparência profissional equivalente ao Pipedrive
- [ ] Hierarquia visual clara
- [ ] Consistência em todas as páginas
- [ ] Responsividade em desktop e tablet

### Acessibilidade
- [ ] 100% contraste WCAG AA
- [ ] Navegação por teclado completa
- [ ] Screen reader friendly
- [ ] ARIA apropriado

### Performance
- [ ] Build < 2 minutos
- [ ] Bundle gzipped < 1MB
- [ ] TTI (Time to Interactive) < 3s
- [ ] Lighthouse Score > 90

### Funcional
- [ ] Zero regressões
- [ ] Drag & drop funcional
- [ ] CRUD operations intactas
- [ ] Integrações Supabase OK

---

## 🚀 Próximos Passos

1. ✅ **Criar tokens de design** - Arquivo CSS com variáveis
2. ✅ **Implementar componentes base** - Button, Input, Card, etc
3. ✅ **Modificar AppShell** - Topbar e Sidebar
4. ✅ **Refatorar Pipeline Board** - Padrão Pipedrive
5. ✅ **Criar DataTable** - Lista tabular com filtros
6. ✅ **Refatorar Detail Views** - Layout em painéis
7. ✅ **Padronizar Modals** - Estrutura consistente
8. ✅ **Validar Acessibilidade** - Testes AA
9. ✅ **Testes de Regressão** - Garantir funcionalidades
10. ✅ **Documentação** - STYLEGUIDE.md

---

## 📝 Notas Importantes

### Considerações Técnicas
- Usar Radix UI para primitivos acessíveis (já no projeto)
- Shadcn/ui como base de componentes (já no projeto)
- TailwindCSS para estilização (já configurado)
- Lucide React para ícones (já instalado)
- @dnd-kit para drag & drop (já instalado)

### Restrições
- Não alterar lógica de negócio
- Não modificar schemas do Supabase
- Não quebrar integrações existentes
- Não remover funcionalidades
- Manter dark mode funcional

### Timeline Estimado
- **Fase 1:** Tokens e componentes base (2-3 horas)
- **Fase 2:** AppShell e navegação (1-2 horas)
- **Fase 3:** Pipeline Board (2-3 horas)
- **Fase 4:** Listas e filtros (2 horas)
- **Fase 5:** Detail Views (2 horas)
- **Fase 6:** Modals e feedbacks (1 hora)
- **Fase 7:** Acessibilidade e testes (2 horas)
- **Fase 8:** Documentação (1 hora)
- **Total:** 13-16 horas

---

**Documento criado por:** GitHub Copilot AI Engineer  
**Para:** SnapDoor CRM UI Upgrade Project  
**Versão:** 1.0  
**Status:** ✅ Completo e aprovado para implementação
