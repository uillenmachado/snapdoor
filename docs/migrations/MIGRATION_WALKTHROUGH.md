# 🎬 PASSO A PASSO VISUAL - EXECUTAR MIGRAÇÃO

## ✋ PARE! LEIA ANTES DE CONTINUAR

Este é um guia passo a passo **COM IMAGENS TEXTUAIS** para você executar a migração SQL no Supabase.

**Tempo estimado:** 5 minutos  
**Dificuldade:** ⭐⭐☆☆☆ (Fácil)

---

## 🎯 PASSO 1: ABRIR O SUPABASE

### 1.1 - Acesse o Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  🌐 Navegador                                          [ _ □ X ] │
├─────────────────────────────────────────────────────────────────┤
│  🔒 https://supabase.com/dashboard                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│     ███████╗██╗   ██╗██████╗  █████╗ ██████╗  █████╗ ███████╗ │
│     ██╔════╝██║   ██║██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔════╝ │
│     ███████╗██║   ██║██████╔╝███████║██████╔╝███████║███████╗ │
│     ╚════██║██║   ██║██╔═══╝ ██╔══██║██╔══██╗██╔══██║╚════██║ │
│     ███████║╚██████╔╝██║     ██║  ██║██████╔╝██║  ██║███████║ │
│     ╚══════╝ ╚═════╝ ╚═╝     ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝╚══════╝ │
│                                                                 │
│                     Dashboard > Projects                        │
│                                                                 │
│     ┌───────────────────────────────────────────────────────┐  │
│     │  📁 cfydbvrzjtbcrbzimfjm              [SELECIONAR] │  │
│     │     snapdoor-production                              │  │
│     │     Created: Today                                   │  │
│     └───────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Ação:** Clique no projeto **cfydbvrzjtbcrbzimfjm**

---

## 🎯 PASSO 2: ACESSAR O SQL EDITOR

### 2.1 - Menu Lateral

```
┌─────────────────────────────────────────────────────────────────┐
│  Supabase Dashboard - cfydbvrzjtbcrbzimfjm          [ _ □ X ] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐                                           │
│  │  MENU LATERAL   │                                           │
│  ├─────────────────┤                                           │
│  │                 │                                           │
│  │  🏠 Home        │                                           │
│  │  📊 Table Editor│                                           │
│  │  🔍 API         │                                           │
│  │  👥 Auth        │                                           │
│  │  📦 Storage     │                                           │
│  │  ⚡ Edge Funcs  │                                           │
│  │  📝 SQL Editor  │  ← CLIQUE AQUI!                           │
│  │  📈 Logs        │                                           │
│  │  ⚙️  Settings   │                                           │
│  │                 │                                           │
│  └─────────────────┘                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Ação:** Clique em **📝 SQL Editor** no menu lateral esquerdo

---

## 🎯 PASSO 3: CRIAR NOVA QUERY

### 3.1 - Botão New Query

```
┌─────────────────────────────────────────────────────────────────┐
│  SQL Editor                                         [ _ □ X ] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────┐          │
│  │  [+ New Query]  [Saved Queries ▼]               │          │
│  │       ↑                                          │          │
│  │   CLIQUE AQUI!                                   │          │
│  └──────────────────────────────────────────────────┘          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  -- Write your SQL here                                  │  │
│  │  -- Example: SELECT * FROM your_table;                   │  │
│  │                                                          │  │
│  │                                                          │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [RUN ▶]                                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Ação:** Clique em **[+ New Query]**

---

## 🎯 PASSO 4: ABRIR ARQUIVO SQL NO VS CODE

### 4.1 - Navegue até o arquivo

```
┌─────────────────────────────────────────────────────────────────┐
│  VS Code - snapdoor                                 [ _ □ X ] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  EXPLORER                                                       │
│  ├─ 📁 supabase                                                 │
│  │  ├─ 📁 functions                                             │
│  │  ├─ 📁 migrations                                            │
│  │  │  ├─ 📄 20251009133602_b9c092c5...sql                      │
│  │  │  ├─ 📄 20251009133633_2d78aa77...sql                      │
│  │  │  ├─ 📄 ...                                                │
│  │  │  └─ 📄 20251010000000_create_credits_system.sql          │
│  │  │           ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑           │
│  │  │           CLIQUE AQUI PARA ABRIR!                         │
│  │  └─ 📄 config.toml                                           │
│  └─ 📁 src                                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Ação:** Clique no arquivo **20251010000000_create_credits_system.sql**

### 4.2 - Selecionar todo o conteúdo

```
┌─────────────────────────────────────────────────────────────────┐
│  20251010000000_create_credits_system.sql       [ _ □ X ] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1  -- ====================================                     │
│  2  -- SISTEMA DE CRÉDITOS PARA API HUNTER.IO                  │
│  3  -- Cobra 3x o custo da requisição                          │
│  4  -- ====================================                     │
│  5                                                              │
│  6  -- Tabela de créditos do usuário                           │
│  7  CREATE TABLE IF NOT EXISTS user_credits (                  │
│  8    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),          │
│  9    user_id UUID NOT NULL REFERENCES auth.users(id)...       │
│  ...                                                            │
│  232 -- (fim do arquivo)                                        │
│                                                                 │
│  ┌────────────────────────────────────────┐                    │
│  │  Pressione: Ctrl + A                   │                    │
│  │  (Seleciona tudo)                      │                    │
│  └────────────────────────────────────────┘                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Ações:**
1. Pressione **Ctrl + A** (ou Cmd + A no Mac) para selecionar tudo
2. Pressione **Ctrl + C** (ou Cmd + C no Mac) para copiar

---

## 🎯 PASSO 5: COLAR NO SUPABASE SQL EDITOR

### 5.1 - Volte para o navegador

```
┌─────────────────────────────────────────────────────────────────┐
│  SQL Editor - New Query                             [ _ □ X ] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1  -- COLE O SQL AQUI!                                  │  │
│  │  2                                                       │  │
│  │  3  ┌─────────────────────────────────┐                 │  │
│  │  4  │  Pressione: Ctrl + V            │                 │  │
│  │  5  │  (Cola o conteúdo copiado)      │                 │  │
│  │     └─────────────────────────────────┘                 │  │
│  │                                                          │  │
│  │                                                          │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [RUN ▶]                                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Ação:** Clique no editor e pressione **Ctrl + V** (ou Cmd + V no Mac)

### 5.2 - Resultado após colar

```
┌─────────────────────────────────────────────────────────────────┐
│  SQL Editor - New Query                             [ _ □ X ] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1  -- =======================================            │  │
│  │  2  -- SISTEMA DE CRÉDITOS PARA API HUNTER.IO            │  │
│  │  3  -- Cobra 3x o custo da requisição                    │  │
│  │  4  -- =======================================            │
│  │  5                                                       │  │
│  │  6  -- Tabela de créditos do usuário                     │  │
│  │  7  CREATE TABLE IF NOT EXISTS user_credits (            │  │
│  │  8    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),    │  │
│  │  ...                                                     │  │
│  │  232 (fim do arquivo)                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [RUN ▶] ← CLIQUE AQUI AGORA!                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Ação:** Clique no botão **[RUN ▶]** ou pressione **Ctrl + Enter**

---

## 🎯 PASSO 6: AGUARDAR EXECUÇÃO

### 6.1 - Processando...

```
┌─────────────────────────────────────────────────────────────────┐
│  SQL Editor                                         [ _ □ X ] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ⏳ Running query...                                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  [████████████████░░░░░░░░░░░░] 65%                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Aguarde 5-10 segundos...                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Ação:** Aguarde a execução (5-10 segundos)

### 6.2 - Sucesso! ✅

```
┌─────────────────────────────────────────────────────────────────┐
│  SQL Editor                                         [ _ □ X ] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ✅ Success. No rows returned (with 23 statements executed)     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Results                                                 │  │
│  │  ────────────────────────────────────────────────        │  │
│  │  Query executed successfully                             │  │
│  │  Duration: 8.2s                                          │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  🎉 PARABÉNS! Migração executada com sucesso!                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Resultado esperado:** Mensagem de sucesso ✅

---

## 🎯 PASSO 7: VERIFICAR TABELAS CRIADAS

### 7.1 - Acessar Table Editor

```
┌─────────────────────────────────────────────────────────────────┐
│  Supabase Dashboard                                 [ _ □ X ] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐                                           │
│  │  MENU LATERAL   │                                           │
│  ├─────────────────┤                                           │
│  │                 │                                           │
│  │  🏠 Home        │                                           │
│  │  📊 Table Editor│  ← CLIQUE AQUI AGORA!                     │
│  │  🔍 API         │                                           │
│  │  ...            │                                           │
│  └─────────────────┘                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Ação:** Clique em **📊 Table Editor**

### 7.2 - Visualizar tabelas criadas

```
┌─────────────────────────────────────────────────────────────────┐
│  Table Editor                                       [ _ □ X ] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📋 All Tables                                                  │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  ✅ user_credits              (0 rows)                 │    │
│  │     Armazena saldo de créditos de cada usuário         │    │
│  │                                                        │    │
│  │  ✅ credit_usage_history      (0 rows)                 │    │
│  │     Histórico de consumo de créditos                   │    │
│  │                                                        │    │
│  │  ✅ credit_packages            (4 rows)                │    │
│  │     Pacotes disponíveis para compra                    │    │
│  │                                                        │    │
│  │  ✅ credit_purchases           (0 rows)                │    │
│  │     Histórico de compras de créditos                   │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  🎉 SUCESSO! 4 tabelas criadas!                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Verificação:**
- ✅ `user_credits` existe
- ✅ `credit_usage_history` existe
- ✅ `credit_packages` existe (e tem 4 pacotes)
- ✅ `credit_purchases` existe

---

## 🎯 PASSO 8: VERIFICAR PACOTES INSERIDOS

### 8.1 - Clicar em credit_packages

```
┌─────────────────────────────────────────────────────────────────┐
│  Table Editor - credit_packages                     [ _ □ X ] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  credit_packages (4 rows)                                       │
│                                                                 │
│  ┌─────────┬──────────┬─────────┬────────────┬──────────────┐  │
│  │ name    │ credits  │ price   │ discount   │ is_active    │  │
│  ├─────────┼──────────┼─────────┼────────────┼──────────────┤  │
│  │ Starter │ 50       │ 47.00   │ 0          │ true         │  │
│  │ Growth  │ 150      │ 127.00  │ 10         │ true         │  │
│  │ Pro     │ 500      │ 397.00  │ 20         │ true         │  │
│  │ Enter...│ 2000     │ 1497.00 │ 25         │ true         │  │
│  └─────────┴──────────┴─────────┴────────────┴──────────────┘  │
│                                                                 │
│  ✅ PERFEITO! 4 pacotes criados corretamente!                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Verificação:**
- ✅ Starter: 50 créditos por R$ 47,00
- ✅ Growth: 150 créditos por R$ 127,00 (10% desconto)
- ✅ Pro: 500 créditos por R$ 397,00 (20% desconto)
- ✅ Enterprise: 2000 créditos por R$ 1.497,00 (25% desconto)

---

## 🎯 PASSO 9: GERAR TYPES TYPESCRIPT

### 9.1 - Voltar para o VS Code

```
┌─────────────────────────────────────────────────────────────────┐
│  VS Code - Terminal                                 [ _ □ X ] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PS C:\...\snapdoor>                                            │
│                                                                 │
│  ┌────────────────────────────────────────┐                    │
│  │  Digite o comando:                     │                    │
│  │                                        │                    │
│  │  npm run db:types                      │                    │
│  │                                        │                    │
│  │  e pressione ENTER                     │                    │
│  └────────────────────────────────────────┘                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Ação:** Execute o comando:

```bash
npm run db:types
```

### 9.2 - Aguardar geração

```
┌─────────────────────────────────────────────────────────────────┐
│  Terminal                                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  > npm run db:types                                             │
│                                                                 │
│  Generating types...                                            │
│  Connecting to project: cfydbvrzjtbcrbzimfjm                    │
│  Fetching schema...                                             │
│  ✅ Types generated successfully!                                │
│                                                                 │
│  File: src/integrations/supabase/types.ts                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Resultado esperado:** Arquivo `types.ts` atualizado com novas tabelas

---

## 🎯 PASSO 10: VERIFICAR COMPILAÇÃO

### 10.1 - Verificar erros TypeScript

```
┌─────────────────────────────────────────────────────────────────┐
│  Terminal                                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PS C:\...\snapdoor> npm run dev                                │
│                                                                 │
│  VITE v5.4.20  ready in 2.1s                                    │
│                                                                 │
│  ➜  Local:   http://localhost:8080/                             │
│  ➜  Network: use --host to expose                               │
│                                                                 │
│  ✅ No TypeScript errors found!                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Verificação:** Projeto compila sem erros ✅

---

## 🎉 PARABÉNS! MIGRAÇÃO CONCLUÍDA COM SUCESSO!

```
╔═════════════════════════════════════════════════════════════════╗
║                                                                 ║
║                    🎉 MISSÃO CUMPRIDA! 🎉                       ║
║                                                                 ║
║  ✅ Migração SQL executada                                       ║
║  ✅ 4 tabelas criadas                                            ║
║  ✅ 4 pacotes inseridos                                          ║
║  ✅ Types TypeScript gerados                                     ║
║  ✅ Projeto compila sem erros                                    ║
║                                                                 ║
║  🎯 Nível de Monetização: 8/10 → 9/10                           ║
║                                                                 ║
╚═════════════════════════════════════════════════════════════════╝
```

---

## 📊 O QUE VOCÊ ACABOU DE CRIAR

### Sistema Completo de Créditos:

1. **Backend Configurado** ✅
   - 4 tabelas no banco de dados
   - 2 funções SQL (debit_credits, add_credits)
   - Políticas RLS para segurança

2. **Pacotes Definidos** ✅
   - Starter: R$ 47,00 (50 créditos)
   - Growth: R$ 127,00 (150 créditos)
   - Pro: R$ 397,00 (500 créditos)
   - Enterprise: R$ 1.497,00 (2000 créditos)

3. **Integração Hunter.io** ✅
   - 7 endpoints configurados
   - Custos definidos (3x markup)
   - Sistema de cache implementado

4. **Hooks React** ✅
   - Gerenciamento de créditos
   - Histórico de uso
   - Verificação de saldo

---

## 🚀 PRÓXIMOS PASSOS

### Para atingir 10/10:

1. **UI de Compra de Créditos** (2-3 horas)
   - Criar página em Settings
   - Mostrar pacotes disponíveis
   - Exibir histórico

2. **Integração Stripe** (3-4 horas)
   - Configurar checkout
   - Implementar webhooks
   - Testar pagamentos

3. **Integrações Finais** (1-2 horas)
   - Adicionar indicador de créditos no header
   - Modal "Créditos insuficientes"
   - Verificação em SnapDoorAIDialog

**Tempo total estimado: 6-9 horas**

---

## 💡 DICA FINAL

Agora que sua migração está completa, você pode:

1. **Testar o sistema:**
   ```bash
   npm run dev
   ```

2. **Ver os créditos no código:**
   - Abra `src/hooks/useCredits.ts`
   - Não deve haver mais erros TypeScript! ✅

3. **Continuar desenvolvimento:**
   - Integrar UI de créditos
   - Adicionar Stripe
   - Lançar em produção! 🚀

---

**🎯 Parabéns pela implementação! Você está pronto para monetizar!**
