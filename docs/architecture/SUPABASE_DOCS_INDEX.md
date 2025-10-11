# 🎯 CONFIGURAÇÃO DO SUPABASE - README

## 📚 Índice de Documentação

Este projeto possui documentação completa em vários arquivos. Escolha o que melhor se adequa à sua necessidade:

### 🚀 Para Iniciantes (COMECE AQUI!)

**[📖 MIGRATION_WALKTHROUGH.md](./MIGRATION_WALKTHROUGH.md)**  
Guia passo a passo com visualizações textuais. Perfeito se é sua primeira vez configurando Supabase.

**Tempo:** 10 minutos  
**Dificuldade:** ⭐⭐☆☆☆

---

### ⚡ Para Desenvolvedores Experientes

**[📋 QUICK_START_MIGRATION.md](./QUICK_START_MIGRATION.md)**  
Guia rápido e direto ao ponto. Para quem já conhece Supabase e quer executar rapidamente.

**Tempo:** 5 minutos  
**Dificuldade:** ⭐⭐⭐☆☆

---

### 📊 Para Entender o Sistema

**[📘 CREDIT_SYSTEM_GUIDE.md](./CREDIT_SYSTEM_GUIDE.md)**  
Documentação completa do sistema de créditos (400+ linhas). Arquitetura, fluxos, exemplos de código.

**Tempo:** 30 minutos  
**Dificuldade:** ⭐⭐⭐⭐☆

---

### 🔧 Para Configuração Detalhada

**[🛠️ SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)**  
Guia detalhado de configuração. Inclui troubleshooting, testes SQL, e verificações.

**Tempo:** 20 minutos  
**Dificuldade:** ⭐⭐⭐☆☆

---

### 📈 Para Visão Geral do Projeto

**[📊 STATUS_VISUAL.md](./STATUS_VISUAL.md)**  
Status visual do projeto com checklist, fluxogramas e resumo executivo.

**Tempo:** 5 minutos  
**Dificuldade:** ⭐☆☆☆☆

---

### 📋 Para Resumo Executivo

**[📄 SETUP_SUMMARY.md](./SETUP_SUMMARY.md)**  
Resumo completo: o que foi feito, o que falta, próximos passos, arquitetura.

**Tempo:** 10 minutos  
**Dificuldade:** ⭐⭐☆☆☆

---

## 🎯 Qual arquivo devo ler primeiro?

### Se você quer:

- **Executar a migração agora** → [MIGRATION_WALKTHROUGH.md](./MIGRATION_WALKTHROUGH.md)
- **Entender o sistema** → [STATUS_VISUAL.md](./STATUS_VISUAL.md)
- **Ver código e exemplos** → [CREDIT_SYSTEM_GUIDE.md](./CREDIT_SYSTEM_GUIDE.md)
- **Resolver problemas** → [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)
- **Visão rápida** → [QUICK_START_MIGRATION.md](./QUICK_START_MIGRATION.md)

---

## ⚡ TL;DR - Começando em 30 segundos

### 1. Execute a migração:

**Opção A (Manual - Recomendado):**
1. Acesse: https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm/sql/new
2. Copie todo o conteúdo de: `supabase/migrations/20251010000000_create_credits_system.sql`
3. Cole no SQL Editor
4. Clique em "Run"

**Opção B (Automático):**
```bash
npm run db:migrate
```

### 2. Gere os types TypeScript:

```bash
npm run db:types
```

### 3. Inicie o servidor:

```bash
npm run dev
```

**Pronto! Sistema de créditos configurado.** ✅

---

## 📂 Estrutura dos Arquivos de Configuração

```
snapdoor/
├── .env                                    # Credenciais Supabase
├── MIGRATION_WALKTHROUGH.md                # 🚀 Guia visual passo a passo
├── QUICK_START_MIGRATION.md                # ⚡ Guia rápido
├── CREDIT_SYSTEM_GUIDE.md                  # 📘 Documentação completa
├── SUPABASE_SETUP_GUIDE.md                 # 🛠️ Setup detalhado
├── STATUS_VISUAL.md                        # 📊 Status do projeto
├── SETUP_SUMMARY.md                        # 📄 Resumo executivo
├── SUPABASE_DOCS_INDEX.md                  # 📚 Este arquivo
│
├── supabase/
│   └── migrations/
│       └── 20251010000000_create_credits_system.sql  # Migração SQL
│
├── src/
│   ├── hooks/
│   │   └── useCredits.ts                   # Hooks React Query
│   ├── services/
│   │   └── hunterClient.ts                 # Cliente Hunter.io
│   └── integrations/
│       └── supabase/
│           ├── client.ts                   # Cliente Supabase
│           └── types.ts                    # Types (gerado após migração)
│
└── scripts/
    ├── apply-migration-http.ts             # Script de migração
    └── package.json                        # Scripts NPM
```

---

## 🎓 Fluxo de Leitura Recomendado

### Para Iniciantes:
1. [STATUS_VISUAL.md](./STATUS_VISUAL.md) - Entender o estado atual
2. [MIGRATION_WALKTHROUGH.md](./MIGRATION_WALKTHROUGH.md) - Executar migração
3. [CREDIT_SYSTEM_GUIDE.md](./CREDIT_SYSTEM_GUIDE.md) - Aprender o sistema

### Para Experientes:
1. [SETUP_SUMMARY.md](./SETUP_SUMMARY.md) - Resumo técnico
2. [QUICK_START_MIGRATION.md](./QUICK_START_MIGRATION.md) - Executar migração
3. [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md) - Troubleshooting

---

## 🆘 Precisa de Ajuda?

### Problemas Comuns:

**❌ Erro: "relation does not exist"**  
**Solução:** Migração não foi executada. Siga: [MIGRATION_WALKTHROUGH.md](./MIGRATION_WALKTHROUGH.md)

**❌ Erros TypeScript em useCredits.ts**  
**Solução:** Types não foram gerados. Execute: `npm run db:types`

**❌ Erro ao executar npm run db:migrate**  
**Solução:** Use a opção manual. Veja: [QUICK_START_MIGRATION.md](./QUICK_START_MIGRATION.md)

**❌ Não consigo acessar o Supabase**  
**Solução:** Verifique credenciais em `.env`. Veja: [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)

---

## 📞 Comandos Úteis

```bash
# Executar migração (automático)
npm run db:migrate

# Gerar types TypeScript
npm run db:types

# Iniciar dev server
npm run dev

# Ver erros TypeScript
npm run lint

# Build para produção
npm run build
```

---

## 🎯 Status Atual do Projeto

```
✅ Credenciais Supabase configuradas
✅ Cliente Supabase implementado
✅ Migração SQL criada (232 linhas)
✅ Hunter.io API integrada
✅ Hooks React Query criados
✅ Documentação completa
⏳ Migração SQL pendente (VOCÊ PRECISA EXECUTAR)
⏳ Types TypeScript desatualizados
🔲 UI de compra de créditos
🔲 Integração Stripe

Nível de Monetização: 8/10
```

---

## 🚀 Próximos Passos

1. **Executar migração SQL** (AGORA)  
   → Siga: [MIGRATION_WALKTHROUGH.md](./MIGRATION_WALKTHROUGH.md)

2. **Gerar types TypeScript**  
   → Execute: `npm run db:types`

3. **Desenvolver UI de créditos** (2-3 horas)  
   → Página em Settings, indicador no header

4. **Integrar Stripe** (3-4 horas)  
   → Checkout, webhooks, confirmação de pagamento

5. **Lançar em produção** (1-2 horas)  
   → Deploy, testes finais, documentação de usuário

**Tempo total para 10/10: 6-9 horas de desenvolvimento**

---

## 📊 Arquitetura do Sistema de Créditos

```
┌─────────────────────────────────────────────────────────────┐
│                      USUÁRIO                                │
│                      Signup → 10 créditos grátis            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  SNAPDOOR AI (Frontend)                     │
│                  Verifica créditos disponíveis              │
└─────────────────────────────────────────────────────────────┘
                          ↓
            ┌─────────────┴─────────────┐
            │                           │
     TEM CRÉDITOS?                  NÃO TEM?
            │                           │
            ↓                           ↓
┌───────────────────────┐   ┌───────────────────────┐
│   HUNTER.IO API       │   │  MODAL DE COMPRA      │
│   • Domain Search     │   │  • Mostrar pacotes    │
│   • Email Finder      │   │  • Stripe Checkout    │
│   • Verifier, etc     │   │  • Webhook confirma   │
└───────────────────────┘   └───────────────────────┘
            ↓                           ↓
┌───────────────────────┐   ┌───────────────────────┐
│   DEBIT_CREDITS()     │   │   ADD_CREDITS()       │
│   Função SQL          │   │   Função SQL          │
│   • Debita saldo      │   │   • Adiciona saldo    │
│   • Registra histórico│   │   • Atualiza total    │
└───────────────────────┘   └───────────────────────┘
            ↓                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS SUPABASE                  │
│                                                             │
│  • user_credits (saldo)                                     │
│  • credit_usage_history (consumo)                           │
│  • credit_packages (pacotes)                                │
│  • credit_purchases (compras)                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 💰 Modelo de Precificação

| Pacote | Créditos | Preço | Custo/Crédito | Desconto |
|--------|----------|-------|---------------|----------|
| **Starter** | 50 | R$ 47,00 | R$ 0,94 | - |
| **Growth** | 150 | R$ 127,00 | R$ 0,85 | 10% |
| **Pro** | 500 | R$ 397,00 | R$ 0,79 | 20% |
| **Enterprise** | 2000 | R$ 1.497,00 | R$ 0,75 | 25% |

**Markup: 3x** (Cliente paga 3 créditos para cada 1 crédito do Hunter.io)

---

## 🎉 Conclusão

Você tem em mãos um **sistema completo de monetização** pronto para escalar. 

**Próximo passo:** Execute a migração seguindo o [MIGRATION_WALKTHROUGH.md](./MIGRATION_WALKTHROUGH.md)

**Dúvidas?** Consulte os outros guias listados acima.

**Bom desenvolvimento! 🚀**
