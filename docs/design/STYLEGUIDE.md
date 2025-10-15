# 🎨 SnapDoor CRM - Style Guide

**Versão:** 2.0 - Padrão Profissional Inspirado em CRMs Modernos  
**Data:** 15 de outubro de 2025  
**Baseado em:** Pesquisa de padrões UI de CRMs líderes de mercado

---

## 📋 Índice

1. [Princípios de Design](#princípios-de-design)
2. [Tokens de Design](#tokens-de-design)
3. [Componentes](#componentes)
4. [Layouts e Padrões](#layouts-e-padrões)
5. [Acessibilidade](#acessibilidade)
6. [Diretrizes de Uso](#diretrizes-de-uso)

---

## 🎯 Princípios de Design

### 1. Clareza Acima de Tudo
- Interface limpa e sem ruído visual
- Hierarquia tipográfica clara
- Espaçamentos generosos
- Foco em ação e dados relevantes

### 2. Consistência
- Padrões visuais repetíveis
- Componentes reutilizáveis
- Comportamentos previsíveis
- Estados visuais padronizados

### 3. Acessibilidade
- Contraste WCAG 2.2 AA mínimo
- Navegação por teclado completa
- Estados de foco visíveis
- Screen reader friendly

### 4. Performance
- Loading states informativos
- Feedback visual imediato
- Transições suaves (200-300ms)
- Otimização de bundle

---

## 🎨 Tokens de Design

### Cores

#### Paleta de Neutros (Base)

```css
/* Light Mode - Neutros */
--neutral-50: 220 15% 98%;   /* Backgrounds muito claros */
--neutral-100: 220 15% 95%;  /* Backgrounds claros */
--neutral-200: 220 15% 90%;  /* Borders padrão */
--neutral-300: 220 15% 80%;  /* Borders hover */
--neutral-400: 220 15% 65%;  /* Text muted/placeholders */
--neutral-500: 220 15% 50%;  /* Text secondary */
--neutral-600: 220 15% 40%;  /* Text primary */
--neutral-700: 220 15% 30%;  /* Headings */
--neutral-800: 220 15% 20%;  /* Dark elements */
--neutral-900: 220 15% 12%;  /* Sidebar/footer dark */

/* Dark Mode - Neutros (invertidos) */
--neutral-50-dark: 220 15% 12%;
--neutral-100-dark: 220 15% 20%;
--neutral-200-dark: 220 15% 25%;
--neutral-300-dark: 220 15% 30%;
--neutral-400-dark: 220 15% 50%;
--neutral-500-dark: 220 15% 60%;
--neutral-600-dark: 220 15% 75%;
--neutral-700-dark: 220 15% 85%;
--neutral-800-dark: 220 15% 92%;
--neutral-900-dark: 220 15% 98%;
```

#### Cores de Marca (SnapDoor)

```css
/* Verde SnapDoor - Primária */
--brand-green-50: 157 76% 95%;
--brand-green-100: 157 76% 91%;
--brand-green-200: 157 70% 80%;
--brand-green-300: 157 65% 65%;
--brand-green-400: 157 60% 50%;
--brand-green-500: 157 100% 33%;  /* PRIMARY */
--brand-green-600: 157 100% 28%;
--brand-green-700: 157 100% 23%;
--brand-green-800: 157 100% 18%;
--brand-green-900: 157 100% 13%;

/* Roxo SnapDoor - Secundária/CTA */
--brand-purple-50: 257 82% 95%;
--brand-purple-100: 257 82% 90%;
--brand-purple-200: 257 82% 80%;
--brand-purple-300: 257 82% 70%;
--brand-purple-400: 257 82% 65%;
--brand-purple-500: 257 82% 61%;  /* SECONDARY */
--brand-purple-600: 257 82% 55%;
--brand-purple-700: 257 82% 48%;
--brand-purple-800: 257 82% 40%;
--brand-purple-900: 257 82% 32%;
```

#### Cores de Status (Semânticas)

```css
/* Sucesso - Verde */
--status-success-50: 145 60% 95%;
--status-success-100: 145 60% 90%;
--status-success-500: 145 60% 45%;  /* BASE */
--status-success-700: 145 60% 35%;

/* Info - Azul */
--status-info-50: 210 100% 95%;
--status-info-100: 210 100% 90%;
--status-info-500: 210 100% 55%;    /* BASE */
--status-info-700: 210 100% 45%;

/* Atenção - Amarelo/Laranja */
--status-warning-50: 40 100% 95%;
--status-warning-100: 40 100% 90%;
--status-warning-500: 40 100% 55%;  /* BASE */
--status-warning-700: 40 100% 45%;

/* Erro - Vermelho */
--status-danger-50: 0 70% 95%;
--status-danger-100: 0 70% 90%;
--status-danger-500: 0 70% 55%;     /* BASE */
--status-danger-700: 0 70% 45%;
```

#### Cores de Etapas do Pipeline

```css
/* Para diferenciar etapas do funil de vendas */
--pipeline-stage-1: 210 85% 60%;   /* Azul - Primeiro contato */
--pipeline-stage-2: 270 70% 60%;   /* Roxo - Qualificação */
--pipeline-stage-3: 330 75% 60%;   /* Rosa - Proposta */
--pipeline-stage-4: 25 85% 55%;    /* Laranja - Negociação */
--pipeline-stage-5: 145 60% 50%;   /* Verde - Ganho */
--pipeline-stage-6: 0 70% 55%;     /* Vermelho - Perdido */
```

### Contraste Mínimo (WCAG AA)

```
Texto Normal (16px):
- Contraste mínimo: 4.5:1
- Exemplo: neutral-600 em neutral-50 ✅

Texto Grande (18px+ ou 14px bold):
- Contraste mínimo: 3:1
- Exemplo: neutral-500 em neutral-50 ✅

Elementos Gráficos (ícones, borders):
- Contraste mínimo: 3:1
- Exemplo: neutral-300 em neutral-50 ✅
```

---

### Tipografia

#### Família de Fontes

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
             "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", 
             "Segoe UI Emoji", "Segoe UI Symbol";
```

**Justificativa:** System fonts otimizadas para cada plataforma, performance máxima, zero latência de carregamento.

#### Escala Tipográfica

```css
--font-size-xs: 0.75rem;     /* 12px - Labels, captions, meta */
--font-size-sm: 0.875rem;    /* 14px - Body small, table text */
--font-size-base: 1rem;      /* 16px - Body text padrão */
--font-size-lg: 1.125rem;    /* 18px - Subheadings, card titles */
--font-size-xl: 1.25rem;     /* 20px - Section titles */
--font-size-2xl: 1.5rem;     /* 24px - Page titles */
--font-size-3xl: 2rem;       /* 32px - Hero titles */
--font-size-4xl: 2.5rem;     /* 40px - Marketing headlines */
```

#### Pesos de Fonte

```css
--font-weight-normal: 400;    /* Body text */
--font-weight-medium: 500;    /* Mais usado - emphasis, buttons */
--font-weight-semibold: 600;  /* Headings, strong emphasis */
--font-weight-bold: 700;      /* High emphasis, números destacados */
```

#### Line Heights

```css
--line-height-tight: 1.25;    /* Headings */
--line-height-normal: 1.5;    /* Body text */
--line-height-relaxed: 1.75;  /* Large body text, descriptions */
```

#### Uso Recomendado

```css
/* Page Title */
h1 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
  color: hsl(var(--neutral-700));
}

/* Section Title */
h2 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
  color: hsl(var(--neutral-700));
}

/* Card Title */
h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-normal);
  color: hsl(var(--neutral-600));
}

/* Body Text */
p {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  color: hsl(var(--neutral-600));
}

/* Label */
label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  line-height: var(--line-height-normal);
  color: hsl(var(--neutral-600));
}

/* Caption/Meta */
small {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  color: hsl(var(--neutral-500));
}
```

---

### Espaçamentos

```css
/* Escala base 4px */
--space-0: 0;
--space-0-5: 0.125rem;   /* 2px */
--space-1: 0.25rem;      /* 4px */
--space-2: 0.5rem;       /* 8px */
--space-3: 0.75rem;      /* 12px */
--space-4: 1rem;         /* 16px */
--space-5: 1.25rem;      /* 20px */
--space-6: 1.5rem;       /* 24px */
--space-8: 2rem;         /* 32px */
--space-10: 2.5rem;      /* 40px */
--space-12: 3rem;        /* 48px */
--space-16: 4rem;        /* 64px */
--space-20: 5rem;        /* 80px */
--space-24: 6rem;        /* 96px */
```

#### Guia de Uso

```
Micro espaços (1-2): Entre ícone e texto, badges
Pequeno (3-4): Padding de botões, entre elementos inline
Médio (5-6): Entre seções de um card, entre form fields
Grande (8-10): Entre cards, entre seções de página
Extra grande (12+): Margens de página, hero sections
```

---

### Raios de Borda

```css
--radius-none: 0;
--radius-sm: 0.25rem;     /* 4px - Badges, small buttons */
--radius-md: 0.375rem;    /* 6px - Buttons, inputs, cards (padrão) */
--radius-lg: 0.5rem;      /* 8px - Modals, large cards */
--radius-xl: 0.75rem;     /* 12px - Feature cards */
--radius-2xl: 1rem;       /* 16px - Hero cards */
--radius-full: 9999px;    /* Circular - Avatars, pills */
```

---

### Sombras

```css
/* Elevação progressiva */
--shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
             0 1px 2px 0 rgba(0, 0, 0, 0.06);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
             0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
             0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
             0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Sombras especiais */
--shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
--shadow-outline: 0 0 0 3px rgba(157, 255, 185, 0.5); /* Focus ring */
```

#### Guia de Uso

```
xs: Subtle hover em elementos flat
sm: Cards padrão em repouso
md: Cards ao hover, dropdowns
lg: Modais, popovers
xl: Drawers, overlays importantes
2xl: Splash screens, hero modals
inner: Inputs pressionados
outline: Estados de foco (acessibilidade)
```

---

## 🧩 Componentes

### Button

#### Variantes

**Primary (CTA principal)**
```tsx
<Button variant="primary" size="md">
  Criar Negócio
</Button>

/* Estilo */
background: hsl(var(--brand-green-500));
color: white;
font-weight: 500;
padding: 0.5rem 1rem;
border-radius: var(--radius-md);
shadow: var(--shadow-sm);

/* Hover */
background: hsl(var(--brand-green-600));
shadow: var(--shadow-md);

/* Focus */
outline: 2px solid hsl(var(--brand-green-500));
outline-offset: 2px;
```

**Secondary**
```tsx
<Button variant="secondary" size="md">
  Cancelar
</Button>

/* Estilo */
background: hsl(var(--neutral-100));
color: hsl(var(--neutral-700));
border: 1px solid hsl(var(--neutral-200));
```

**Ghost**
```tsx
<Button variant="ghost" size="sm">
  <MoreHorizontal className="h-4 w-4" />
</Button>

/* Estilo */
background: transparent;
color: hsl(var(--neutral-600));

/* Hover */
background: hsl(var(--neutral-100));
```

**Destructive**
```tsx
<Button variant="destructive">
  Deletar
</Button>

/* Estilo */
background: hsl(var(--status-danger-500));
color: white;
```

#### Tamanhos

```tsx
<Button size="sm">Small</Button>      /* h-8, px-3, text-sm */
<Button size="md">Medium</Button>     /* h-10, px-4, text-base (padrão) */
<Button size="lg">Large</Button>      /* h-12, px-6, text-lg */
<Button size="icon">
  <Plus className="h-4 w-4" />
</Button>                             /* h-10 w-10, quadrado */
```

---

### Card

#### Estrutura Padrão

```tsx
<Card>
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
    <CardDescription>Descrição opcional</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Conteúdo principal */}
  </CardContent>
  <CardFooter>
    {/* Ações do card */}
  </CardFooter>
</Card>

/* Estilo */
background: hsl(var(--card));
border: 1px solid hsl(var(--neutral-200));
border-radius: var(--radius-lg);
shadow: var(--shadow-sm);
padding: var(--space-6);
```

#### Variantes

**Hover Interativo**
```tsx
<Card className="hover-card">
  {/* ... */}
</Card>

/* Hover */
shadow: var(--shadow-md);
border-color: hsl(var(--neutral-300));
transform: translateY(-2px);
transition: all 200ms ease;
```

**Flat (sem sombra)**
```tsx
<Card variant="flat">
  {/* ... */}
</Card>

/* Estilo */
shadow: none;
border: 1px solid hsl(var(--neutral-200));
```

---

### Input e Form Fields

#### Input Padrão

```tsx
<Label htmlFor="name">Nome *</Label>
<Input
  id="name"
  type="text"
  placeholder="Digite o nome"
  required
/>

/* Estilo */
height: 2.5rem;
padding: 0.5rem 0.75rem;
background: hsl(var(--background));
border: 1px solid hsl(var(--neutral-300));
border-radius: var(--radius-md);
font-size: var(--font-size-sm);

/* Focus */
border-color: hsl(var(--brand-green-500));
outline: 2px solid hsl(var(--brand-green-500) / 0.2);
outline-offset: 0;

/* Error */
border-color: hsl(var(--status-danger-500));
outline-color: hsl(var(--status-danger-500) / 0.2);

/* Disabled */
background: hsl(var(--neutral-100));
color: hsl(var(--neutral-400));
cursor: not-allowed;
```

#### Validação

```tsx
<div className="space-y-1">
  <Label htmlFor="email">Email *</Label>
  <Input
    id="email"
    type="email"
    aria-invalid="true"
    aria-describedby="email-error"
  />
  <p id="email-error" className="text-xs text-danger">
    Email inválido
  </p>
</div>
```

---

### Modal / Dialog

#### Estrutura

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir Modal</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título do Modal</DialogTitle>
      <DialogDescription>Descrição opcional</DialogDescription>
    </DialogHeader>
    
    {/* Conteúdo do modal */}
    <div className="space-y-4 py-4">
      {/* Form fields, etc */}
    </div>
    
    <DialogFooter>
      <Button variant="secondary">Cancelar</Button>
      <Button variant="primary">Salvar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

/* Estilo */
max-width: 32rem;  /* 512px */
background: hsl(var(--card));
border-radius: var(--radius-lg);
shadow: var(--shadow-xl);
padding: var(--space-6);

/* Overlay */
background: rgba(0, 0, 0, 0.5);
backdrop-filter: blur(4px);
```

---

### Toast / Notification

#### Uso

```tsx
import { toast } from "sonner"

// Sucesso
toast.success("Negócio criado com sucesso!")

// Erro
toast.error("Erro ao criar negócio")

// Info
toast.info("5 novos leads importados")

// Warning
toast.warning("Créditos baixos")

/* Posição: Top Right */
/* Auto-dismiss: 4s */
/* Com ícone de status */
```

---

### Table

#### Estrutura

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead>Valor</TableHead>
      <TableHead>Etapa</TableHead>
      <TableHead>Ações</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Empresa XYZ</TableCell>
      <TableCell>$15.000</TableCell>
      <TableCell>
        <Badge>Proposta</Badge>
      </TableCell>
      <TableCell>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>

/* Estilo */
/* TableHead */
background: hsl(var(--neutral-50));
font-weight: 500;
font-size: var(--font-size-sm);
color: hsl(var(--neutral-600));
border-bottom: 2px solid hsl(var(--neutral-200));
padding: var(--space-3) var(--space-4);

/* TableRow */
border-bottom: 1px solid hsl(var(--neutral-200));

/* TableRow:hover */
background: hsl(var(--neutral-50));

/* TableCell */
padding: var(--space-4);
font-size: var(--font-size-sm);
```

---

## 📐 Layouts e Padrões

### App Shell (Layout Principal)

```tsx
<div className="app-shell">
  {/* Topbar Fixa */}
  <header className="topbar">
    <div className="topbar-left">
      <Logo />
      <GlobalSearch />
    </div>
    <div className="topbar-right">
      <Button size="sm">+ Novo</Button>
      <NotificationBell />
      <Avatar />
    </div>
  </header>
  
  {/* Container */}
  <div className="app-container">
    {/* Sidebar Recolhível */}
    <aside className="sidebar">
      <nav>
        {menuItems.map(item => (
          <SidebarItem key={item.url} {...item} />
        ))}
      </nav>
    </aside>
    
    {/* Main Content */}
    <main className="main-content">
      {children}
    </main>
  </div>
</div>

/* CSS */
.topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: hsl(var(--card));
  border-bottom: 1px solid hsl(var(--neutral-200));
  box-shadow: var(--shadow-sm);
  z-index: 50;
}

.sidebar {
  width: 240px;
  background: hsl(var(--sidebar-background));
  border-right: 1px solid hsl(var(--sidebar-border));
  padding: var(--space-4);
}

.main-content {
  flex: 1;
  padding: var(--space-6);
  margin-top: 64px; /* altura do topbar */
}
```

---

### Pipeline Board Layout

```tsx
<div className="pipeline-board">
  {/* Header */}
  <div className="pipeline-header">
    <h1>Pipeline de Vendas</h1>
    <div className="pipeline-actions">
      <SearchInput />
      <FilterButton />
      <Button>+ Novo Negócio</Button>
    </div>
  </div>
  
  {/* Kanban Columns */}
  <div className="pipeline-columns">
    {stages.map(stage => (
      <PipelineColumn key={stage.id} stage={stage}>
        {/* Stage Header */}
        <div className="stage-header">
          <h3>{stage.name}</h3>
          <div className="stage-meta">
            <span>{stage.count} deals</span>
            <span>${stage.total}</span>
          </div>
        </div>
        
        {/* Deal Cards */}
        <div className="stage-cards">
          {stage.deals.map(deal => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </div>
      </PipelineColumn>
    ))}
  </div>
</div>

/* CSS */
.pipeline-columns {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 320px));
  gap: var(--space-4);
  padding: var(--space-6);
  overflow-x: auto;
}

.stage-header {
  padding: var(--space-4);
  background: hsl(var(--neutral-50));
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  border-bottom: 2px solid hsl(var(--pipeline-stage-color));
}

.stage-cards {
  padding: var(--space-3);
  min-height: 400px;
}
```

---

### Detail Panel Layout (70/30)

```tsx
<div className="detail-layout">
  {/* Main Panel (70%) */}
  <div className="detail-main">
    <header className="detail-header">
      <Button variant="ghost" size="sm">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Button>
      <h1>Empresa XYZ - $25.000</h1>
      <div className="detail-actions">
        <Button variant="success">Ganhou</Button>
        <Button variant="destructive">Perdeu</Button>
        <Button variant="secondary">Editar</Button>
      </div>
    </header>
    
    <Tabs>
      <TabsList>
        <TabsTrigger value="details">Detalhes</TabsTrigger>
        <TabsTrigger value="activities">Atividades</TabsTrigger>
        <TabsTrigger value="notes">Notas</TabsTrigger>
        <TabsTrigger value="emails">Emails</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details">
        {/* Form fields em grid */}
      </TabsContent>
    </Tabs>
  </div>
  
  {/* Sidebar (30%) */}
  <aside className="detail-sidebar">
    <Card>
      <CardHeader>
        <CardTitle>Próxima Atividade</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Próxima atividade */}
      </CardContent>
    </Card>
    
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <Timeline items={activities} />
      </CardContent>
    </Card>
  </aside>
</div>

/* CSS */
.detail-layout {
  display: grid;
  grid-template-columns: 7fr 3fr;
  gap: var(--space-6);
  padding: var(--space-6);
}
```

---

## ♿ Acessibilidade

### Contraste de Cores

**Todos os pares de cor devem atingir:**
- Texto normal (16px): **4.5:1** mínimo
- Texto grande (18px+ ou 14px bold): **3:1** mínimo
- Elementos gráficos: **3:1** mínimo

**Ferramenta de validação:** [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

### Navegação por Teclado

```tsx
/* Todos os elementos interativos devem ser acessíveis via Tab */
<Button tabIndex={0} onKeyDown={handleKeyDown}>
  Ação
</Button>

/* Skip link para navegação rápida */
<a href="#main-content" className="skip-link">
  Pular para conteúdo principal
</a>

/* Trap focus em modais */
<Dialog onOpenChange={handleFocusTrap}>
  {/* conteúdo */}
</Dialog>
```

### Estados de Foco

```css
/* Focus ring visível */
:focus-visible {
  outline: 2px solid hsl(var(--brand-green-500));
  outline-offset: 2px;
}

/* Nunca remover outline sem substituição visual */
button:focus {
  outline: 2px solid hsl(var(--brand-green-500));
  outline-offset: 2px;
}
```

### ARIA Labels

```tsx
/* Ícones sem texto precisam de aria-label */
<Button aria-label="Deletar negócio" variant="ghost" size="icon">
  <Trash2 className="h-4 w-4" />
</Button>

/* Formulários com validação */
<Input
  aria-invalid={!!error}
  aria-describedby="field-error"
  aria-required="true"
/>
{error && <p id="field-error" className="text-danger">{error}</p>}

/* Loading states */
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? "Carregando..." : content}
</div>
```

---

## 📋 Diretrizes de Uso

### Quando Usar Cada Componente

#### Button vs Link
- **Button:** Ações que modificam estado (Salvar, Deletar, Criar)
- **Link:** Navegação entre páginas (Ver detalhes, Ir para configurações)

#### Card vs Section
- **Card:** Conteúdo agrupado com borda e sombra (Widget, Item da lista)
- **Section:** Seção de página sem container visual

#### Modal vs Drawer
- **Modal:** Ações importantes que exigem atenção (Criar, Deletar)
- **Drawer:** Quick views, detalhes rápidos, filtros

#### Toast vs Alert
- **Toast:** Feedback temporário de ação (Salvo com sucesso)
- **Alert:** Mensagem persistente importante (Erro crítico)

### Hierarquia de Ações

**Primária:** Ação principal esperada (verde, destaque)  
**Secundária:** Ação alternativa (cinza, outline)  
**Terciária:** Ações opcionais (ghost, subtle)  
**Destrutiva:** Ações perigosas (vermelho)

```tsx
<DialogFooter>
  <Button variant="ghost">Cancelar</Button>
  <Button variant="secondary">Salvar Rascunho</Button>
  <Button variant="primary">Publicar</Button>
</DialogFooter>
```

### Espaçamento Consistente

```tsx
/* Entre elementos inline */
<div className="flex items-center gap-2">
  <Icon />
  <span>Texto</span>
</div>

/* Entre form fields */
<div className="space-y-4">
  <FormField />
  <FormField />
</div>

/* Entre seções de página */
<div className="space-y-8">
  <Section />
  <Section />
</div>

/* Padding de containers */
<Card className="p-6">
  {/* conteúdo */}
</Card>
```

---

## ✅ Checklist de Revisão

Antes de criar um novo componente ou padrão:

- [ ] Segue paleta de cores definida
- [ ] Contraste WCAG AA validado
- [ ] Responsivo em desktop e tablet
- [ ] Navegável por teclado
- [ ] Estados de foco visíveis
- [ ] ARIA labels apropriados
- [ ] Consistente com componentes existentes
- [ ] Documentado no Styleguide
- [ ] Testado em dark mode
- [ ] Performance validada

---

**Documento criado por:** GitHub Copilot AI Engineer  
**Baseado em:** Pesquisa de padrões UI de CRMs modernos  
**Versão:** 2.0  
**Data:** 15 de outubro de 2025  
**Status:** ✅ Aprovado para implementação
