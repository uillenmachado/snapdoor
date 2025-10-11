# 🚀 GUIA DE CONFIGURAÇÃO DO SUPABASE - SISTEMA DE CRÉDITOS

## ✅ Status Atual
- ✅ Credenciais configuradas no .env
- ✅ Arquivo de migração SQL criado
- ✅ Cliente Supabase configurado

## 📝 PASSO A PASSO PARA EXECUTAR A MIGRAÇÃO

### 1️⃣ Acessar o Painel do Supabase

1. Acesse: https://supabase.com/dashboard
2. Faça login com sua conta
3. Selecione o projeto: **cfydbvrzjtbcrbzimfjm**

### 2️⃣ Abrir o SQL Editor

1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique em **"New Query"** para criar uma nova consulta

### 3️⃣ Copiar e Colar o SQL

1. Abra o arquivo: `supabase/migrations/20251010000000_create_credits_system.sql`
2. **Copie TODO o conteúdo do arquivo** (232 linhas)
3. **Cole no SQL Editor** do Supabase

### 4️⃣ Executar a Migração

1. Clique no botão **"Run"** (ou pressione Ctrl+Enter / Cmd+Enter)
2. Aguarde a execução (deve levar ~5-10 segundos)
3. Verifique se aparece a mensagem **"Success. No rows returned"**

### 5️⃣ Verificar se as Tabelas foram Criadas

1. No menu lateral, clique em **"Table Editor"**
2. Você deve ver as seguintes tabelas:
   - ✅ `user_credits`
   - ✅ `credit_usage_history`
   - ✅ `credit_packages`
   - ✅ `credit_purchases`

### 6️⃣ Verificar os Pacotes Padrão

1. Clique na tabela **`credit_packages`**
2. Você deve ver 4 pacotes criados:
   - **Starter**: 50 créditos por R$ 47,00
   - **Growth**: 150 créditos por R$ 127,00 (10% desconto)
   - **Pro**: 500 créditos por R$ 397,00 (20% desconto)
   - **Enterprise**: 2000 créditos por R$ 1.497,00 (25% desconto)

---

## 🎯 O QUE A MIGRAÇÃO CRIA

### 📊 Tabelas

#### 1. `user_credits`
Armazena o saldo de créditos de cada usuário:
- `id`: UUID único
- `user_id`: Referência ao usuário (auth.users)
- `credits`: Saldo atual de créditos (padrão: 10 grátis)
- `total_purchased`: Total de créditos comprados
- `total_used`: Total de créditos utilizados
- `created_at`, `updated_at`: Timestamps

#### 2. `credit_usage_history`
Registra cada uso de créditos:
- `id`: UUID único
- `user_id`: Referência ao usuário
- `operation_type`: Tipo de operação (domain_search, email_finder, etc.)
- `credits_used`: Quantidade de créditos consumidos
- `domain`, `email`: Dados da consulta
- `query_params`: Parâmetros da query (JSON)
- `result_summary`: Resumo do resultado (JSON)
- `success`: Se a operação foi bem-sucedida
- `error_message`: Mensagem de erro (se houver)
- `created_at`: Timestamp

#### 3. `credit_packages`
Define os pacotes de créditos disponíveis:
- `id`: UUID único
- `name`: Nome do pacote (Starter, Growth, etc.)
- `credits`: Quantidade de créditos
- `price_brl`: Preço em reais
- `discount_percentage`: Percentual de desconto
- `is_active`: Se o pacote está ativo
- `created_at`, `updated_at`: Timestamps

#### 4. `credit_purchases`
Registra compras de créditos:
- `id`: UUID único
- `user_id`: Referência ao usuário
- `package_id`: Referência ao pacote comprado
- `credits_purchased`: Quantidade comprada
- `amount_paid_brl`: Valor pago em reais
- `payment_method`: Método de pagamento
- `payment_status`: Status (pending, completed, failed)
- `stripe_payment_id`: ID do pagamento no Stripe
- `stripe_session_id`: ID da sessão do Stripe
- `created_at`, `completed_at`: Timestamps

### 🔐 Segurança (Row Level Security)

Todas as tabelas têm RLS habilitado com políticas:
- ✅ Usuários só veem seus próprios dados
- ✅ Pacotes são visíveis publicamente
- ✅ Funções SQL com `SECURITY DEFINER` para operações seguras

### ⚡ Funções SQL

#### 1. `debit_credits()`
```sql
debit_credits(
  p_user_id UUID,           -- ID do usuário
  p_credits INTEGER,        -- Créditos a debitar
  p_operation_type TEXT,    -- Tipo de operação
  p_domain TEXT,            -- (opcional) Domínio consultado
  p_email TEXT,             -- (opcional) Email consultado
  p_query_params JSONB,     -- (opcional) Parâmetros da query
  p_result_summary JSONB    -- (opcional) Resumo do resultado
) RETURNS BOOLEAN
```

**O que faz:**
1. Verifica se o usuário tem créditos suficientes
2. Debita os créditos
3. Registra no histórico
4. Retorna TRUE se sucesso, ou lança exceção se sem créditos

**Exemplo de uso (no React):**
```typescript
const { data, error } = await supabase.rpc('debit_credits', {
  p_user_id: user.id,
  p_credits: 3,
  p_operation_type: 'domain_search',
  p_domain: 'example.com',
  p_query_params: { limit: 10, type: 'personal' }
});
```

#### 2. `add_credits()`
```sql
add_credits(
  p_user_id UUID,           -- ID do usuário
  p_credits INTEGER,        -- Créditos a adicionar
  p_purchase_id UUID        -- (opcional) ID da compra
) RETURNS BOOLEAN
```

**O que faz:**
1. Adiciona créditos ao saldo do usuário
2. Atualiza o total de créditos comprados
3. Cria registro se usuário não existe
4. Retorna TRUE se sucesso

**Exemplo de uso (no React):**
```typescript
const { data, error } = await supabase.rpc('add_credits', {
  p_user_id: user.id,
  p_credits: 50,
  p_purchase_id: purchaseId
});
```

### 📈 Índices para Performance

A migração cria índices nas colunas mais consultadas:
- `user_credits.user_id`
- `credit_usage_history.user_id`
- `credit_usage_history.created_at` (DESC)
- `credit_purchases.user_id`
- `credit_purchases.payment_status`

---

## 🧪 TESTAR O SISTEMA APÓS MIGRAÇÃO

### 1. Verificar Créditos de um Usuário (via SQL Editor)

```sql
SELECT * FROM user_credits WHERE user_id = 'SEU_USER_ID_AQUI';
```

### 2. Criar Créditos Iniciais para um Usuário (via SQL Editor)

```sql
INSERT INTO user_credits (user_id, credits)
VALUES ('SEU_USER_ID_AQUI', 10)
ON CONFLICT (user_id) DO NOTHING;
```

### 3. Testar Débito de Créditos (via SQL Editor)

```sql
SELECT debit_credits(
  'SEU_USER_ID_AQUI'::UUID,
  3,
  'domain_search',
  'example.com',
  NULL,
  '{"limit": 10}'::JSONB,
  NULL
);
```

### 4. Ver Histórico de Uso (via SQL Editor)

```sql
SELECT * FROM credit_usage_history 
WHERE user_id = 'SEU_USER_ID_AQUI'
ORDER BY created_at DESC;
```

---

## 🔄 PRÓXIMOS PASSOS APÓS MIGRAÇÃO

1. ✅ **Gerar Types do TypeScript**
   ```bash
   npx supabase gen types typescript --project-id cfydbvrzjtbcrbzimfjm > src/integrations/supabase/types.ts
   ```

2. ✅ **Testar Hooks do React**
   - Os hooks em `src/hooks/useCredits.ts` devem funcionar automaticamente

3. ✅ **Integrar no SnapDoorAIDialog**
   - Adicionar verificação de créditos antes de chamar API do Hunter.io

4. ✅ **Criar UI de Compra de Créditos**
   - Página em Settings para visualizar e comprar créditos

5. ✅ **Configurar Stripe**
   - Integrar webhooks para processar pagamentos

---

## ❓ TROUBLESHOOTING

### Erro: "relation does not exist"
**Solução:** Verifique se você está no projeto correto (cfydbvrzjtbcrbzimfjm)

### Erro: "permission denied"
**Solução:** Certifique-se de estar logado como owner do projeto

### Tabelas não aparecem no Table Editor
**Solução:** 
1. Force refresh (Ctrl+Shift+R / Cmd+Shift+R)
2. Verifique se a query foi executada com sucesso

### Erro ao inserir pacotes padrão
**Solução:** Execute novamente - o SQL usa `ON CONFLICT DO NOTHING` para evitar duplicatas

---

## 📞 SUPORTE

Se tiver dúvidas:
1. Verifique os logs no SQL Editor do Supabase
2. Teste com queries SQL simples primeiro
3. Verifique as políticas RLS estão ativas

---

**✨ Boa configuração!**
