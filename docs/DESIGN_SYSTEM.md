# 🎨 SNAPDOOR CRM - DESIGN SYSTEM
**Versão:** 1.0  
**Data:** 16 de Outubro de 2025  
**Status:** 🟢 Ativo

---

## 📋 SUMÁRIO EXECUTIVO

Este documento define o sistema de design padronizado para todas as páginas do SnapDoor CRM, garantindo consistência visual, hierarquia clara de informações e experiência de usuário uniforme.

---

## 🎯 PRINCÍPIOS DE DESIGN

### 1. Consistência Visual
Todas as páginas seguem o mesmo padrão de layout, cores, tipografia e espaçamento.

### 2. Hierarquia Clara
Informações importantes destacadas sem poluição visual através de:
- Contraste de cores
- Tamanho de fonte
- Peso de fonte (font-weight)
- Espaçamento estratégico

### 3. Dark Mode First
Design otimizado para modo escuro com suporte a light mode.

### 4. Responsividade
Layouts que se adaptam a diferentes tamanhos de tela.

---

## 🎨 PALETA DE CORES

### Cores de Fundo (Background)
```css
--background: hsl(222.2 84% 4.9%)        /* Fundo principal escuro */
--card: hsl(222.2 84% 4.9%)              /* Fundo de cards */
--accent: hsl(217.2 32.6% 17.5%)         /* Hover e estados */
```

### Cores de Borda (Border)
```css
--border: hsl(217.2 32.6% 17.5%)         /* Bordas padrão */
--border-subtle: hsl(217.2 32.6% 12%)    /* Bordas mais suaves */
```

### Cores de Texto
```css
--foreground: hsl(210 40% 98%)           /* Texto principal (branco) */
--muted-foreground: hsl(215 20.2% 65.1%) /* Texto secundário (cinza) */
--muted: hsl(217.2 32.6% 17.5%)          /* Texto terciário */
```

### Cores de Marca (Brand)
```css
--primary: hsl(222.2 47.4% 11.2%)        /* Cor primária do sistema */
--brand-green: hsl(142 76% 36%)          /* Verde SnapDoor */
```

### Cores Semânticas
```css
--success: hsl(142 76% 36%)              /* Verde - sucesso */
--warning: hsl(38 92% 50%)               /* Amarelo - aviso */
--danger: hsl(0 84% 60%)                 /* Vermelho - erro */
--info: hsl(217 91% 60%)                 /* Azul - informação */
```

### Cores do Pipeline (Cards de Etapas)
```css
--pipeline-1: hsl(217 91% 60%)           /* Azul */
--pipeline-2: hsl(142 76% 36%)           /* Verde */
--pipeline-3: hsl(262 83% 58%)           /* Roxo */
--pipeline-4: hsl(38 92% 50%)            /* Laranja */
--pipeline-5: hsl(340 82% 52%)           /* Rosa */
--pipeline-6: hsl(199 89% 48%)           /* Cyan */
```

---

## 📝 TIPOGRAFIA

### Hierarquia de Texto

```tsx
// Título da Página (H1)
<h1 className="text-2xl font-bold text-foreground">
  Título da Página
</h1>

// Subtítulo da Página
<p className="text-sm text-muted-foreground">
  Descrição ou contexto da página
</p>

// Título de Seção (H2)
<h2 className="text-xl font-semibold text-foreground">
  Seção Principal
</h2>

// Título de Card (H3)
<h3 className="text-lg font-semibold text-foreground">
  Título do Card
</h3>

// Descrição de Card
<p className="text-sm text-muted-foreground">
  Descrição do conteúdo
</p>

// Texto de Label
<label className="text-sm font-medium text-foreground">
  Campo de formulário
</label>

// Texto de Hint/Helper
<span className="text-xs text-muted-foreground">
  Texto auxiliar ou dica
</span>

// Métricas/Números Grandes
<div className="text-3xl font-bold text-foreground">
  1,234
</div>
```

### Font Weights
- `font-normal` (400) - Texto regular
- `font-medium` (500) - Labels e subtítulos
- `font-semibold` (600) - Títulos de seção
- `font-bold` (700) - Títulos principais e métricas

---

## 📐 LAYOUT PADRÃO

### Estrutura Geral de Página

```tsx
<SidebarProvider>
  <div className="min-h-screen flex w-full bg-background">
    <AppSidebar />
    
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header Fixo */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Título da Página
              </h1>
              <p className="text-sm text-muted-foreground">
                Descrição da página
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Ações rápidas */}
            <NotificationBell />
            <Button>Ação Principal</Button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal com Scroll */}
      <main className="flex-1 overflow-auto p-6">
        {/* Conteúdo aqui */}
      </main>
    </div>
  </div>
</SidebarProvider>
```

### Espaçamentos Padrão

```css
/* Padding do Container Principal */
p-6           /* 24px - padding do main */

/* Gap entre Elementos */
gap-2         /* 8px - gap pequeno */
gap-4         /* 16px - gap médio */
gap-6         /* 24px - gap grande */

/* Margem entre Seções */
mb-6          /* 24px - margem bottom padrão */
mt-6          /* 24px - margem top padrão */

/* Padding de Cards */
p-4           /* 16px - padding de cards menores */
p-6           /* 24px - padding de cards médios/grandes */
```

---

## 🎴 COMPONENTES PADRÃO

### Card Padrão

```tsx
<Card className="bg-card border-border">
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Icon className="h-5 w-5" />
      Título do Card
    </CardTitle>
    <CardDescription>
      Descrição do conteúdo do card
    </CardDescription>
  </CardHeader>
  <CardContent>
    {/* Conteúdo */}
  </CardContent>
</Card>
```

### Card de Métrica

```tsx
<Card className="bg-card border-border">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">
      Nome da Métrica
    </CardTitle>
    <Icon className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold text-foreground">
      1,234
    </div>
    <p className="text-xs text-muted-foreground mt-1">
      Descrição ou comparação
    </p>
  </CardContent>
</Card>
```

### Botão Primário

```tsx
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  <Icon className="h-4 w-4 mr-2" />
  Ação Principal
</Button>
```

### Botão Secundário

```tsx
<Button variant="outline">
  <Icon className="h-4 w-4 mr-2" />
  Ação Secundária
</Button>
```

### Botão de Ícone

```tsx
<Button variant="ghost" size="icon">
  <Icon className="h-4 w-4" />
</Button>
```

### Input com Ícone

```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
  <Input
    placeholder="Buscar..."
    className="pl-10"
  />
</div>
```

### Badge Padrão

```tsx
<Badge variant="default">Ativo</Badge>
<Badge variant="secondary">Inativo</Badge>
<Badge variant="destructive">Excluído</Badge>
<Badge variant="outline">Pendente</Badge>
```

### Tabela Padrão

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="text-muted-foreground font-medium">
        Coluna 1
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="hover:bg-accent/50 cursor-pointer">
      <TableCell className="text-foreground">
        Valor
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## 📊 GRID DE MÉTRICAS

### Grid 4 Colunas (Desktop)

```tsx
<div className="grid gap-4 md:grid-cols-4">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

### Grid 3 Colunas

```tsx
<div className="grid gap-4 md:grid-cols-3">
  <Card>...</Card>
  <Card>...</Card>
  <Card>...</Card>
</div>
```

### Grid 2 Colunas

```tsx
<div className="grid gap-6 md:grid-cols-2">
  <Card>...</Card>
  <Card>...</Card>
</div>
```

---

## 🔍 HEADER PADRÃO POR PÁGINA

### Dashboard
```
Título: "Dashboard"
Descrição: "Visão geral do seu negócio"
Ações: [NotificationBell]
```

### Pipeline
```
Título: "{Nome do Pipeline}"
Descrição: "Gerencie seus negócios através do funil de vendas"
Ações: [Search, Filter, "Novo Negócio"]
```

### Leads
```
Título: "Leads"
Descrição: "Gerencie seus leads e oportunidades"
Ações: [Search, Filter, Export, Import, "Adicionar Lead"]
```

### Empresas
```
Título: "Empresas"
Descrição: "Gerencie suas empresas e contatos"
Ações: [Search, Filter, Export, Import, "Adicionar Empresa"]
```

### Atividades
```
Título: "Atividades"
Descrição: "Acompanhe suas tarefas e interações"
Ações: [Filter, "Nova Atividade"]
```

### Relatórios
```
Título: "Relatórios"
Descrição: "Análise e insights do seu negócio"
Ações: [DateRange, Export]
```

### Configurações
```
Título: "Configurações"
Descrição: "Gerencie suas preferências e configurações"
Ações: []
```

---

## 🎯 ESTADOS VISUAIS

### Loading State

```tsx
<div className="min-h-screen flex items-center justify-center">
  <Loader2 className="h-8 w-8 animate-spin text-primary" />
</div>
```

### Empty State

```tsx
<div className="flex flex-col items-center justify-center p-12 text-center">
  <Icon className="h-16 w-16 text-muted-foreground mb-4" />
  <h3 className="text-lg font-semibold text-foreground mb-2">
    Nenhum item encontrado
  </h3>
  <p className="text-sm text-muted-foreground mb-4">
    Comece adicionando seu primeiro item
  </p>
  <Button>
    <Plus className="h-4 w-4 mr-2" />
    Adicionar Item
  </Button>
</div>
```

### Error State

```tsx
<div className="flex flex-col items-center justify-center p-12 text-center">
  <AlertCircle className="h-16 w-16 text-destructive mb-4" />
  <h3 className="text-lg font-semibold text-foreground mb-2">
    Erro ao carregar dados
  </h3>
  <p className="text-sm text-muted-foreground mb-4">
    Tente novamente ou entre em contato com o suporte
  </p>
  <Button variant="outline" onClick={() => window.location.reload()}>
    <RefreshCw className="h-4 w-4 mr-2" />
    Tentar Novamente
  </Button>
</div>
```

---

## 🚫 O QUE EVITAR

### ❌ Cores Inconsistentes
```tsx
// ❌ Evitar
<div className="bg-gray-800 text-white">

// ✅ Usar
<div className="bg-card text-foreground">
```

### ❌ Tamanhos de Fonte Aleatórios
```tsx
// ❌ Evitar
<h1 className="text-4xl">
<h2 className="text-sm">

// ✅ Usar (seguir hierarquia)
<h1 className="text-2xl font-bold">
<h2 className="text-xl font-semibold">
```

### ❌ Espaçamentos Inconsistentes
```tsx
// ❌ Evitar
<div className="p-2">
<div className="p-8">
<div className="p-3">

// ✅ Usar (padrões: p-4 ou p-6)
<div className="p-4">
<div className="p-6">
```

### ❌ Headers Diferentes
```tsx
// ❌ Evitar cada página com layout diferente

// ✅ Usar o mesmo padrão em todas
<header className="border-b border-border bg-card sticky top-0 z-10">
```

---

## 📱 RESPONSIVIDADE

### Breakpoints Tailwind

```css
sm: 640px   /* Smartphone landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop small */
xl: 1280px  /* Desktop large */
2xl: 1536px /* Desktop XL */
```

### Padrão de Grid Responsivo

```tsx
// Mobile: 1 coluna
// Tablet: 2 colunas
// Desktop: 4 colunas
<div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
```

---

## ✅ CHECKLIST DE PADRONIZAÇÃO

Ao criar ou editar uma página, verificar:

- [ ] Header fixo com título + descrição
- [ ] SidebarTrigger no header
- [ ] NotificationBell no header (quando aplicável)
- [ ] Cores usando classes do design system (bg-card, text-foreground, etc)
- [ ] Tipografia seguindo hierarquia (text-2xl bold para H1, etc)
- [ ] Espaçamento padronizado (p-4, p-6, gap-4, gap-6)
- [ ] Cards com border-border e bg-card
- [ ] Icons com tamanho consistente (h-4 w-4 ou h-5 w-5)
- [ ] Loading state com Loader2
- [ ] Empty state com mensagem clara
- [ ] Grid responsivo (md:grid-cols-X)
- [ ] Botões com variantes corretas (primary, outline, ghost)
- [ ] Text truncate em textos longos
- [ ] Hover states em elementos clicáveis

---

## 🎨 EXEMPLOS DE IMPLEMENTAÇÃO

### Página Completa Padrão

Ver implementação completa em:
- `src/pages/Pipelines.tsx` ✅ Exemplo de referência
- `src/pages/Dashboard.tsx` ✅ Após padronização

---

## 📚 RECURSOS

### Documentação Tailwind CSS
https://tailwindcss.com/docs

### Documentação Shadcn/UI
https://ui.shadcn.com

### Ícones Lucide React
https://lucide.dev

---

**Última atualização:** 16/10/2025  
**Próxima revisão:** Conforme necessário

