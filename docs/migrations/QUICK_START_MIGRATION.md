# ⚡ QUICK START - EXECUTAR MIGRAÇÃO

## 🎯 Opção 1: Execução Manual no Supabase (RECOMENDADO)

### Passo a Passo:

1. **Acesse o Supabase:**
   - URL: https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm/sql/new

2. **Copie o SQL:**
   - Abra: `supabase/migrations/20251010000000_create_credits_system.sql`
   - Selecione TUDO (Ctrl+A)
   - Copie (Ctrl+C)

3. **Cole no SQL Editor:**
   - Cole no editor SQL do Supabase (Ctrl+V)

4. **Execute:**
   - Clique em "Run" ou pressione Ctrl+Enter
   - Aguarde mensagem de sucesso

5. **Verifique:**
   - Menu lateral → "Table Editor"
   - Deve ver 4 tabelas: `user_credits`, `credit_usage_history`, `credit_packages`, `credit_purchases`

---

## 🤖 Opção 2: Execução Automática (EXPERIMENTAL)

⚠️ **Atenção:** A API REST do Supabase pode não suportar execução direta de SQL. Use apenas se a Opção 1 não funcionar.

### Comandos:

```bash
# Instalar dependências (se ainda não instalou)
npm install --save-dev ts-node @types/node

# Executar migração
npm run db:migrate
```

---

## 📊 Após a Migração

### 1. Gerar Types TypeScript

```bash
npm run db:types
```

Isso vai gerar/atualizar o arquivo `src/integrations/supabase/types.ts` com as novas tabelas.

### 2. Verificar Pacotes Criados

Acesse: https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm/editor

Clique na tabela `credit_packages` e verifique se existem 4 pacotes:
- ✅ Starter (50 créditos - R$ 47)
- ✅ Growth (150 créditos - R$ 127)
- ✅ Pro (500 créditos - R$ 397)
- ✅ Enterprise (2000 créditos - R$ 1.497)

### 3. Testar Criação de Créditos

No SQL Editor, execute:

```sql
-- Substitua 'SEU_USER_ID' pelo ID de um usuário real
SELECT add_credits(
  'SEU_USER_ID'::UUID,
  10,
  NULL
);

-- Verificar créditos
SELECT * FROM user_credits WHERE user_id = 'SEU_USER_ID'::UUID;
```

---

## ✅ Checklist de Verificação

- [ ] Migração executada sem erros
- [ ] 4 tabelas criadas (user_credits, credit_usage_history, credit_packages, credit_purchases)
- [ ] 4 pacotes inseridos em credit_packages
- [ ] Types TypeScript gerados (arquivo types.ts atualizado)
- [ ] Sem erros TypeScript no projeto

---

## 🐛 Troubleshooting

### Erro: "relation already exists"
**Causa:** Tabelas já foram criadas antes  
**Solução:** Tudo OK! A migração usa `IF NOT EXISTS`, então é seguro executar múltiplas vezes.

### Erro: "permission denied for schema public"
**Causa:** Permissões insuficientes  
**Solução:** Certifique-se de estar logado como owner do projeto no Supabase.

### Erro: Types não são gerados
**Causa:** Supabase CLI não instalado ou credenciais incorretas  
**Solução:**
```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
npx supabase login

# Gerar types
npm run db:types
```

### Erro: "Cannot find module 'ts-node'"
**Causa:** Dependências não instaladas  
**Solução:**
```bash
npm install --save-dev ts-node @types/node
```

---

## 📞 Próximos Passos

Após executar a migração com sucesso:

1. ✅ **Testar Hooks React** (`src/hooks/useCredits.ts`)
2. ✅ **Integrar no SnapDoorAIDialog** (verificação de créditos)
3. ✅ **Criar UI de compra de créditos** (Settings page)
4. ✅ **Configurar Stripe** (webhooks para pagamentos)

---

**🚀 Boa sorte!**
