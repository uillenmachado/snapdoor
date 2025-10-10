# 🎯 ROTEIRO PARA 10/10 - SISTEMA 100% FUNCIONAL

## Status Atual: 7/10 ⭐⭐⭐⭐⭐⭐⭐☆☆☆

---

## FASE 1: CORREÇÃO DO BANCO DE DADOS (URGENTE) ⏰ 5 min

### ❌ PROBLEMA CRÍTICO:
As tabelas `leads`, `pipelines`, `stages`, `subscriptions` NÃO existem no Supabase.
Sistema retorna 404 em todas as queries.

### ✅ SOLUÇÃO:

**PASSO 1**: Acesse o Supabase Dashboard
```
https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm/editor
```

**PASSO 2**: Clique em "SQL Editor" (ícone </> no menu lateral)

**PASSO 3**: Clique em "+ New Query"

**PASSO 4**: Cole o SQL completo (arquivo abaixo)

**PASSO 5**: Clique em "RUN" ou Ctrl+Enter

**PASSO 6**: Aguarde 10-15 segundos até ver "Success"

**PASSO 7**: Vá em "Table Editor" e verifique se existem 11 tabelas

---

## FASE 2: IMPLEMENTAÇÕES PARA 10/10 ⏰ 2-3 horas

### 1. UI de Compra de Créditos (45 min)
**Arquivo**: `src/components/CreditPurchaseDialog.tsx`

**Features**:
- Modal bonito com 4 pacotes de créditos
- Cards com preços em R$ (47, 127, 397, 1497)
- Badges "Mais Popular" e "Melhor Valor"
- Botão "Comprar Agora" por pacote
- Animações hover e transições

**Design**:
```
┌─────────────────────────────────────────┐
│  💳 Comprar Créditos                    │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐│
│  │BASIC │  │GROWTH│  │  PRO │  │ENTER││
│  │ 50cr │  │150cr │  │500cr │  │2000cr││
│  │ R$47 │  │ R$127│  │ R$397│  │R$1497││
│  └──────┘  └──────┘  └──────┘  └──────┘│
│                                         │
└─────────────────────────────────────────┘
```

### 2. Indicador de Créditos no Header (20 min)
**Arquivo**: `src/components/AppSidebar.tsx`

**Features**:
- Badge com saldo de créditos atual
- Cor verde (>100cr), amarela (50-100cr), vermelha (<50cr)
- Botão "+" para abrir dialog de compra
- Tooltip com detalhes do saldo

**Visual**:
```
┌────────────────────────────┐
│ 👤 Uillen Machado          │
│ 💰 125 créditos    [+]     │
└────────────────────────────┘
```

### 3. Modal de Créditos Insuficientes (15 min)
**Arquivo**: `src/components/InsufficientCreditsDialog.tsx`

**Features**:
- Alert modal quando créditos < necessários
- Mostra: "Você precisa de X créditos mas tem apenas Y"
- Botão "Comprar Créditos" abre CreditPurchaseDialog
- Botão "Cancelar" fecha modal

### 4. Integração no SnapDoor AI (30 min)
**Arquivo**: `src/components/SnapDoorAIDialog.tsx`

**Features**:
- Verificar créditos antes de enviar prompt
- Debitar créditos após resposta bem-sucedida
- Toast de sucesso: "5 créditos debitados"
- Toast de erro se créditos insuficientes

**Fluxo**:
```
1. Usuário envia prompt
2. Verificar: saldo >= 5 créditos?
3. SIM → Processar → Debitar 5cr → Mostrar resposta
4. NÃO → Mostrar InsufficientCreditsDialog
```

### 5. Setup Stripe Checkout (45 min)
**Arquivo**: `src/hooks/useStripe.ts` (já existe, precisa implementar)

**Features**:
- Criar sessão Stripe Checkout
- Redirecionar para pagamento
- Configurar success_url e cancel_url
- Webhook para confirmar pagamento

**Fluxo de Pagamento**:
```
1. Usuário clica "Comprar Agora"
2. Frontend chama createCheckoutSession(packageId)
3. Stripe retorna checkout_url
4. Redireciona usuário para Stripe
5. Após pagamento, Stripe chama webhook
6. Webhook adiciona créditos via add_credits()
7. Usuário volta para /dashboard?success=true
```

### 6. Testes E2E (30 min)

**Cenários**:
- ✅ Login com uillenmachado@gmail.com
- ✅ Dashboard carrega com pipeline e stages
- ✅ Adicionar lead funciona
- ✅ Arrastar lead entre stages funciona
- ✅ Ver detalhes do lead funciona
- ✅ Indicador de créditos aparece no header
- ✅ Abrir dialog de compra funciona
- ✅ Modal de créditos insuficientes aparece
- ✅ SnapDoor AI debita créditos corretamente
- ✅ Stripe Checkout abre corretamente

---

## FASE 3: OTIMIZAÇÕES FINAIS ⏰ 30 min

### Performance:
- ✅ Lazy loading de componentes pesados
- ✅ React Query com staleTime otimizado
- ✅ Índices no Supabase (já criados na migration)
- ✅ Cache do Hunter.io (1h - já implementado)

### Segurança:
- ✅ RLS em todas as tabelas (migration)
- ✅ Políticas por usuário (migration)
- ✅ API keys em .env (já configurado)
- ✅ Service role key protegida (já configurado)

### UX:
- ✅ Loading skeletons em todas as queries
- ✅ Toasts de feedback em todas as ações
- ✅ Validações de formulário
- ✅ Error boundaries para erros inesperados

---

## RESULTADO ESPERADO: 10/10 ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐

### Backend (10/10):
- ✅ 11 tabelas criadas e funcionais
- ✅ RLS + políticas de segurança
- ✅ 2 funções SQL (debit_credits, add_credits)
- ✅ Índices de performance
- ✅ Migrations versionadas

### Frontend (10/10):
- ✅ UI/UX profissional e responsiva
- ✅ Sistema de créditos totalmente integrado
- ✅ Hunter.io API funcionando (7 endpoints)
- ✅ Stripe Checkout configurado
- ✅ Todos os fluxos testados

### Monetização (10/10):
- ✅ 4 pacotes de créditos configurados
- ✅ Modelo 3x markup (70-80% margem)
- ✅ Processamento de pagamentos via Stripe
- ✅ Sistema de créditos automatizado
- ✅ Histórico completo de uso

### Estabilidade (10/10):
- ✅ 0 erros TypeScript
- ✅ 0 erros console (exceto warnings de desenvolvimento)
- ✅ Todas as queries funcionando
- ✅ Loading states e error handling
- ✅ Performance otimizada

---

## CRONOGRAMA:

| Fase | Tarefa | Tempo | Status |
|------|--------|-------|--------|
| 1 | Aplicar migration Supabase | 5 min | ⏳ Aguardando |
| 2.1 | CreditPurchaseDialog | 45 min | 📋 Próximo |
| 2.2 | Indicador créditos header | 20 min | 📋 Próximo |
| 2.3 | InsufficientCreditsDialog | 15 min | 📋 Próximo |
| 2.4 | Integração SnapDoor AI | 30 min | 📋 Próximo |
| 2.5 | Setup Stripe Checkout | 45 min | 📋 Próximo |
| 2.6 | Testes E2E | 30 min | 📋 Próximo |
| 3 | Otimizações finais | 30 min | 📋 Próximo |

**TEMPO TOTAL**: ~3h30min (após aplicar migration)

---

## COMEÇAR AGORA:

1. **Abra**: https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm/editor
2. **SQL Editor** → **New Query**
3. **Cole** o arquivo: `supabase/migrations/20251010000001_fix_all_tables.sql`
4. **Execute** (Ctrl+Enter)
5. **Confirme** que as 11 tabelas foram criadas
6. **Retorne aqui** para continuar implementação

---

**Pronto para começar?** 🚀
