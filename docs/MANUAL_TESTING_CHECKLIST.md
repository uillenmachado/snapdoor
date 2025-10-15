# ✅ Checklist de Testes Manuais - UI Padrão Pipedrive

**Data:** 15 de outubro de 2025  
**Branch:** `feat/ui-padrao-pipedrive`  
**Testador:** Sistema Automatizado + Validação Humana  
**Navegador Principal:** Chrome (mais recente)

---

## 📋 **1. TESTES DE CONSOLE (Critério: 0 erros)**

### ✅ Validações Automáticas
- [ ] Console sem erros JavaScript
- [ ] Console sem warnings críticos
- [ ] Nenhum erro de rede (404, 500)
- [ ] Recursos carregados corretamente (CSS, JS, imagens)

### 🔍 Como Testar:
1. Abrir DevTools (F12)
2. Ir para aba Console
3. Recarregar página (Ctrl+R)
4. Verificar se há erros em vermelho
5. Navegar por todas as páginas principais

**Páginas a verificar:**
- `/` - Dashboard
- `/leads` - Lista de Leads
- `/deals` - Negócios/Pipeline
- `/companies` - Empresas
- `/reports` - Relatórios
- `/activities` - Atividades
- `/settings` - Configurações

---

## 🌓 **2. DARK MODE (Critério: 100% funcional)**

### ✅ Componentes Refatorados a Validar:
- [ ] **AppSidebar** - cores, gradientes, ícones
- [ ] **DealKanbanBoard** - cores de pipeline, backgrounds
- [ ] **DealCard** - contraste, bordas, textos
- [ ] **DashboardMetrics** - cards coloridos, ícones
- [ ] **Leads (tabela)** - linhas, headers, badges
- [ ] **Reports** - tabs, charts, cards

### 🔍 Como Testar:
1. Clicar no toggle de tema (ícone sol/lua)
2. Verificar transição suave
3. Validar contraste em TODOS os componentes
4. Verificar se cores semânticas funcionam (success, danger, warning)
5. Testar hover states em ambos os temas

**Critérios de Aceitação:**
- ✅ Nenhum texto ilegível
- ✅ Todas as cores invertidas corretamente
- ✅ Ícones visíveis em ambos os temas
- ✅ Shadows e bordas ajustadas

---

## 📱 **3. RESPONSIVE DESIGN (Critério: 320px - 1920px)**

### ✅ Breakpoints a Testar:
- [ ] **Mobile Small:** 320px x 568px (iPhone SE)
- [ ] **Mobile:** 375px x 667px (iPhone 8)
- [ ] **Mobile Large:** 414px x 896px (iPhone 11 Pro)
- [ ] **Tablet:** 768px x 1024px (iPad)
- [ ] **Desktop:** 1280px x 800px
- [ ] **Desktop Large:** 1920px x 1080px

### 🔍 Componentes Críticos:
**AppSidebar:**
- [ ] Colapsa em mobile (<768px)
- [ ] Menu hamburguer funcional
- [ ] Itens de menu legíveis

**DealKanbanBoard:**
- [ ] Colunas em scroll horizontal (mobile)
- [ ] Cards mantêm proporção
- [ ] Drag-and-drop desabilitado em mobile (opcional)

**Leads (tabela):**
- [ ] Tabela responsiva (scroll horizontal ou cards em mobile)
- [ ] Filtros empilham verticalmente
- [ ] Botões de ação acessíveis

**DashboardMetrics:**
- [ ] Cards empilham em mobile (1 coluna)
- [ ] Gráficos redimensionam
- [ ] Textos não quebram

**Reports:**
- [ ] Tabs em scroll horizontal (mobile)
- [ ] Charts responsivos
- [ ] Export button acessível

### 🔍 Como Testar:
1. Abrir DevTools (F12)
2. Ativar Device Toolbar (Ctrl+Shift+M)
3. Testar cada breakpoint
4. Rotacionar dispositivo (portrait/landscape)
5. Verificar overflow horizontal (não deve existir)

---

## ⌨️ **4. NAVEGAÇÃO POR TECLADO (Critério: 100% acessível)**

### ✅ Componentes a Validar:
- [ ] **AppSidebar** - Tab navega entre itens
- [ ] **DealKanbanBoard** - Cards focáveis, Esc fecha dialogs
- [ ] **DealCard** - Botões de ação (Enriquecer, Ganho, Perdido) focáveis
- [ ] **DashboardMetrics** - Sem problemas (static content)
- [ ] **Leads** - Tabela navegável, filtros focáveis
- [ ] **Reports** - Tabs navegáveis com setas

### 🔍 Atalhos de Teclado:
- [ ] **Tab** - Navega entre elementos focáveis
- [ ] **Shift+Tab** - Navega para trás
- [ ] **Enter** - Ativa botões/links
- [ ] **Space** - Marca checkboxes, abre dropdowns
- [ ] **Esc** - Fecha modais/dialogs
- [ ] **Setas** - Navega em tabs, selects

### 🔍 Como Testar:
1. **NÃO usar mouse**
2. Usar apenas Tab/Shift+Tab
3. Verificar focus ring visível
4. Testar todas as ações principais
5. Validar skip links (ir para conteúdo principal)

**Critérios de Aceitação:**
- ✅ Todos os botões focáveis
- ✅ Focus ring sempre visível (design: ring-2 ring-brand-green-500)
- ✅ Ordem de foco lógica
- ✅ Nenhum "keyboard trap"

---

## 🌐 **5. CROSS-BROWSER (Critério: Chrome, Firefox, Safari, Edge)**

### ✅ Navegadores a Testar:
- [ ] **Chrome** (v120+)
- [ ] **Firefox** (v120+)
- [ ] **Safari** (v17+ - se disponível)
- [ ] **Edge** (v120+)

### 🔍 Validações por Navegador:
**Para cada navegador:**
- [ ] Design tokens aplicados corretamente
- [ ] Gradientes renderizam
- [ ] Shadows funcionam
- [ ] Transições suaves
- [ ] Drag-and-drop (DealKanbanBoard) funciona
- [ ] Dialogs/modals centralizam

### 🔍 Como Testar:
1. Abrir aplicação em cada navegador
2. Navegar pelas páginas principais
3. Testar dark/light mode
4. Verificar componentes críticos
5. Testar interações (hover, click, drag)

**Critérios de Aceitação:**
- ✅ Visual consistente (±95%)
- ✅ Todas as funcionalidades operacionais
- ✅ Performance aceitável

---

## 🎨 **6. DESIGN TOKENS - VALIDAÇÃO VISUAL**

### ✅ Cores a Verificar:
**Neutral:**
- [ ] `neutral-50` a `neutral-900` (gradação suave)

**Brand:**
- [ ] `brand-green-500` (primária) - AppSidebar, focus rings
- [ ] `brand-green-600` (hover) - Botões hover
- [ ] `brand-purple-500` - Badges, ícones especiais

**Status:**
- [ ] `success-500` - Verde (leads ganhos, ações positivas)
- [ ] `danger-500` - Vermelho (leads perdidos, alertas)
- [ ] `warning-500` - Amarelo (atenção, prioridades)
- [ ] `info-500` - Azul (informações neutras)

**Pipeline:**
- [ ] `pipeline-1` (azul) a `pipeline-6` (roxo) - DealKanbanBoard

### ✅ Shadows a Verificar:
- [ ] `shadow-xs` - Borders sutis
- [ ] `shadow-sm` - Cards normais
- [ ] `shadow-md` - Cards elevated
- [ ] `shadow-lg` - Dropdowns
- [ ] `shadow-xl` - Modals
- [ ] `shadow-2xl` - Max elevation

### 🔍 Como Testar:
1. Inspecionar elementos (DevTools)
2. Verificar computed styles
3. Comparar com STYLEGUIDE.md
4. Validar consistência visual

---

## 🔊 **7. SCREEN READER (OPCIONAL - Básico)**

### ✅ Validações ARIA:
- [ ] **Skip links** - "Ir para conteúdo principal" funciona
- [ ] **Table captions** - Leads table tem caption (sr-only)
- [ ] **Button labels** - Todos os icon buttons têm aria-label
- [ ] **Form labels** - Todos os inputs têm label associado
- [ ] **Landmarks** - main, nav, header, footer definidos

### 🔍 Como Testar (NVDA - Windows):
1. Baixar NVDA (gratuito)
2. Ativar screen reader
3. Navegar com Tab
4. Verificar se anuncia corretamente
5. Testar formulários

**Critério Mínimo:**
- ✅ Navegação compreensível sem visão
- ✅ Nenhum elemento "silencioso" importante

---

## 📊 **8. COMPONENTES ESPECÍFICOS - TESTES FUNCIONAIS**

### ✅ AppSidebar:
- [ ] Logo clicável (vai para Dashboard)
- [ ] Itens de menu navegam corretamente
- [ ] Active state destaca página atual
- [ ] Credits card exibe valor correto
- [ ] User avatar com fallback (iniciais)
- [ ] Hover states funcionam
- [ ] Collapse/expand (se implementado)

### ✅ DealKanbanBoard:
- [ ] Colunas renderizam (pipeline-1 a pipeline-6)
- [ ] Drag-and-drop funciona
- [ ] Deals movem entre colunas
- [ ] Empty state aparece quando vazio
- [ ] Contador de deals por coluna
- [ ] Modal de detalhes abre
- [ ] Filtros aplicam corretamente

### ✅ DealCard:
- [ ] Informações exibidas (empresa, valor, probabilidade)
- [ ] Ações rápidas no hover (Enriquecer, Ganho, Perdido)
- [ ] Dropdown menu funciona
- [ ] Temperatura visual (Quente/Morno/Frio)
- [ ] Prioridade (estrela) toggle
- [ ] Dialogs abrem/fecham
- [ ] Validações de formulário

### ✅ DashboardMetrics:
- [ ] 4-5 cards coloridos
- [ ] Valores calculados corretamente
- [ ] Trends (↑↓) com cores corretas
- [ ] Ícones apropriados
- [ ] Hover scale effect
- [ ] Responsive (empilham em mobile)

### ✅ Leads (tabela):
- [ ] Stats cards no topo (5 cards)
- [ ] Tabela renderiza todos leads
- [ ] Filtros funcionam (status, temperatura)
- [ ] Busca filtra em tempo real
- [ ] Badges de status coloridos
- [ ] Ações por linha (Ver, Editar, Deletar)
- [ ] Paginação funciona
- [ ] Sort por coluna

### ✅ Reports:
- [ ] Tabs navegam entre seções
- [ ] Active tab destacado (bg-brand-green-50)
- [ ] Charts renderizam (Recharts)
- [ ] Export button presente
- [ ] Dados filtram por período
- [ ] Cards brancos com shadow-sm
- [ ] Responsive (charts redimensionam)

---

## 🚨 **9. CRITÉRIOS DE BLOQUEIO (MUST FIX)**

**Bloqueia Merge se:**
- ❌ Erros de console em produção
- ❌ Crash da aplicação em qualquer página
- ❌ Dark mode quebrado (textos ilegíveis)
- ❌ Responsividade quebrada em mobile (<768px)
- ❌ Navegação por teclado impossível
- ❌ Contraste WCAG AA abaixo de 4.5:1

**Pode Mergear com Issue Tracking:**
- ⚠️ Pequenas inconsistências visuais (<5%)
- ⚠️ Performance < 90 no Lighthouse (se > 80)
- ⚠️ Browser específico com bug menor (Safari)
- ⚠️ Keyboard navigation com gaps menores

---

## ✅ **10. CHECKLIST DE APROVAÇÃO FINAL**

**Design System:**
- [ ] 90+ tokens documentados e funcionais
- [ ] Cores consistentes em light/dark mode
- [ ] Shadows aplicadas corretamente
- [ ] Tipografia legível

**Componentes:**
- [ ] AppSidebar profissional
- [ ] Pipeline Board com cores de estágios
- [ ] Dashboard Metrics coloridos
- [ ] Leads Table clean e funcional
- [ ] Reports Page redesenhada

**Qualidade:**
- [ ] 53/53 testes passando
- [ ] 0 erros de lint
- [ ] 0 erros de TypeScript
- [ ] Build de produção: SUCCESS

**Acessibilidade:**
- [ ] 85% WCAG 2.2 AA conformidade
- [ ] 100% contraste AAA
- [ ] Navegação por teclado funcional

**Performance:**
- [ ] Build time < 1 minuto
- [ ] Bundle size aceitável (+0.7 KB)
- [ ] Lighthouse score > 80 (target: 90+)

---

## 📝 **11. ISSUES CONHECIDOS (Se houver)**

### 🐛 Bugs Identificados:
_Nenhum até o momento (atualizar após testes)_

### 💡 Melhorias Futuras:
_Documentar sugestões não-bloqueantes_

---

## ✍️ **12. ASSINATURA DE APROVAÇÃO**

**Testador:** ___________________________  
**Data:** ___________________________  
**Status:** ⬜ APROVADO | ⬜ APROVADO COM RESSALVAS | ⬜ REJEITADO  

**Observações:**
_____________________________________________________________________
_____________________________________________________________________
_____________________________________________________________________

---

**Documento gerado automaticamente - Atualizar após execução dos testes**
