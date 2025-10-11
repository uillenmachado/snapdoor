# 🔧 MIGRATION V3: DEV ACCOUNT UNLIMITED CREDITS

## 🎯 Objetivo
Configurar a conta `uillenmachado@gmail.com` como conta de desenvolvedor/proprietário com **créditos ilimitados** para testes, enquanto todas as outras contas mantêm o sistema normal de créditos.

---

## ✨ O que esta migration faz?

### 1. **Função `is_dev_account()`**
Verifica se um email é a conta dev (uillenmachado@gmail.com)

### 2. **Função `get_user_credits()` Atualizada**
- **Conta dev**: Retorna `999999` (ilimitado) ∞
- **Outras contas**: Retorna créditos normais do banco

### 3. **Função `debit_credits()` Atualizada**
- **Conta dev**: NÃO debita créditos, mas registra no histórico com tag "(DEV ACCOUNT - FREE)"
- **Outras contas**: Debita normalmente

### 4. **View `v_user_credits_status`**
Visualização admin para ver status de todas as contas:
```sql
SELECT * FROM v_user_credits_status;
```

Output:
```
| user_id | email                      | credits_display      | credits_value | is_dev |
|---------|----------------------------|----------------------|---------------|--------|
| abc123  | uillenmachado@gmail.com    | ∞ (DEV ACCOUNT)      | 999999        | true   |
| def456  | cliente@example.com        | 10                   | 10            | false  |
```

---

## 🚀 Como Aplicar

### Opção 1: Supabase Dashboard (Recomendado)

1. **Acesse**: https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm
2. **Vá em**: SQL Editor
3. **Cole o conteúdo** de: `supabase/migrations/20251010000003_dev_account_unlimited_credits.sql`
4. **Clique em**: RUN
5. **Aguarde**: "Success. No rows returned"

### Opção 2: Supabase CLI

```bash
# No diretório do projeto
cd "C:\Users\Uillen Machado\Documents\Meus projetos\snapdoor"

# Aplicar migration
supabase db push
```

### Opção 3: PowerShell Script

```powershell
# Ler conteúdo da migration
$migration = Get-Content "supabase/migrations/20251010000003_dev_account_unlimited_credits.sql" -Raw

# Aplicar via API (substitua SEU_SERVICE_ROLE_KEY)
$headers = @{
    "apikey" = "SEU_SERVICE_ROLE_KEY"
    "Authorization" = "Bearer SEU_SERVICE_ROLE_KEY"
    "Content-Type" = "application/json"
}

$body = @{
    query = $migration
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://cfydbvrzjtbcrbzimfjm.supabase.co/rest/v1/rpc/exec_sql" -Method POST -Headers $headers -Body $body
```

---

## ✅ Validação

### 1. Testar Função `is_dev_account()`
```sql
SELECT is_dev_account('uillenmachado@gmail.com'); -- Deve retornar: true
SELECT is_dev_account('outro@example.com');       -- Deve retornar: false
```

### 2. Testar Créditos Ilimitados
```sql
-- Buscar seu user_id
SELECT id, email FROM auth.users WHERE email = 'uillenmachado@gmail.com';

-- Testar get_user_credits (substitua abc-123 pelo seu user_id real)
SELECT get_user_credits('abc-123-seu-user-id'); -- Deve retornar: 999999
```

### 3. Testar Débito (não debita conta dev)
```sql
-- Seu user_id
SELECT debit_credits(
  'abc-123-seu-user-id'::uuid,
  50,
  'TEST_DEBIT',
  '{"test": true}'::jsonb
); -- Retorna: true (mas não debita, só registra histórico)

-- Verificar histórico
SELECT * FROM credit_usage_history 
WHERE user_id = 'abc-123-seu-user-id'::uuid 
ORDER BY created_at DESC 
LIMIT 5;
-- Deve mostrar: "TEST_DEBIT (DEV ACCOUNT - FREE)"
```

### 4. Visualizar Status de Todas Contas
```sql
SELECT * FROM v_user_credits_status;
```

---

## 🎨 Como Aparece no Frontend

### Sidebar Badge
```jsx
// Para uillenmachado@gmail.com
<Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-500">
  ∞ DEV
</Badge>

// Para outras contas
<Badge variant={credits > 100 ? "default" : credits > 50 ? "secondary" : "destructive"}>
  {credits} créditos
</Badge>
```

### Modal de Créditos
```jsx
// Para uillenmachado@gmail.com
<Alert>
  <Infinity className="h-4 w-4" />
  <AlertTitle>Conta de Desenvolvedor</AlertTitle>
  <AlertDescription>
    Você tem acesso ilimitado a todos os recursos para testes.
  </AlertDescription>
</Alert>

// Para outras contas (comportamento normal)
<CreditPurchaseDialog />
```

---

## 🔐 Segurança

### ✅ Seguro
- Função `is_dev_account()` com `SECURITY DEFINER` - apenas admin pode modificar
- Hardcoded email `uillenmachado@gmail.com` - não pode ser alterado via API
- Verificação no lado do servidor (Supabase Functions)
- RLS continua ativo para todas as contas

### ⚠️ Importante
- **Apenas uillenmachado@gmail.com** tem acesso ilimitado
- **Outras contas** funcionam normalmente (10 créditos iniciais)
- **Histórico é registrado** mesmo para conta dev (auditoria)
- **Production**: Considere remover/modificar antes do lançamento público

---

## 📊 Comportamento Comparado

| Ação | Conta Dev (uillenmachado) | Outras Contas |
|------|---------------------------|---------------|
| **Créditos Iniciais** | ∞ (999999) | 10 |
| **get_user_credits()** | Sempre retorna 999999 | Retorna valor real do DB |
| **Busca no SnapDoor AI (5cr)** | ✅ Executa, não debita | ✅ Executa se >= 5cr, debita 5 |
| **Domain Search (3cr)** | ✅ Executa, não debita | ✅ Executa se >= 3cr, debita 3 |
| **Email Verifier (1cr)** | ✅ Executa, não debita | ✅ Executa se >= 1cr, debita 1 |
| **Histórico** | ✅ Registra com tag "(DEV ACCOUNT - FREE)" | ✅ Registra normalmente |
| **Compra de Créditos** | ❌ Não necessário | ✅ Pode comprar pacotes |
| **Badge no Sidebar** | ∞ DEV (roxo/rosa) | X créditos (verde/amarelo/vermelho) |

---

## 🧪 Teste Completo

### Passo 1: Aplicar Migration
```sql
-- Cole o conteúdo da migration no SQL Editor e execute
```

### Passo 2: Login no App
```
URL: http://localhost:8080
Email: uillenmachado@gmail.com
Senha: (sua senha Supabase)
```

### Passo 3: Verificar Badge
```
✅ Deve mostrar: "∞ DEV" ou "999999 créditos"
✅ Cor roxa/rosa (gradiente especial)
```

### Passo 4: Testar SnapDoor AI
```
1. Abrir SnapDoor AI
2. Fazer busca (custo 5 créditos)
3. ✅ Busca executa normalmente
4. ✅ Créditos permanecem em 999999 (não debita)
5. ✅ Histórico registra com "(DEV ACCOUNT - FREE)"
```

### Passo 5: Criar Conta Teste
```
1. Fazer logout
2. Criar nova conta: teste@example.com
3. Login com teste@example.com
4. ✅ Deve ter 10 créditos iniciais
5. ✅ Ao usar SnapDoor AI, debita normalmente
```

---

## 🔄 Rollback (Se Necessário)

Se precisar reverter:

```sql
-- 1. Remover view
DROP VIEW IF EXISTS v_user_credits_status;

-- 2. Restaurar função debit_credits original
CREATE OR REPLACE FUNCTION debit_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_action TEXT,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_credits INTEGER;
BEGIN
  SELECT credits INTO v_current_credits
  FROM user_credits
  WHERE user_id = p_user_id;
  
  IF v_current_credits IS NULL OR v_current_credits < p_amount THEN
    RETURN FALSE;
  END IF;
  
  UPDATE user_credits
  SET 
    credits = credits - p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  INSERT INTO credit_usage_history (
    user_id,
    credits_used,
    action,
    metadata
  ) VALUES (
    p_user_id,
    p_amount,
    p_action,
    p_metadata
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Restaurar função get_user_credits original
CREATE OR REPLACE FUNCTION get_user_credits(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_credits INTEGER;
BEGIN
  SELECT credits INTO v_credits
  FROM user_credits
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(v_credits, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Remover função is_dev_account
DROP FUNCTION IF EXISTS is_dev_account(TEXT);
```

---

## 📝 Notas Importantes

### Para Desenvolvimento
- ✅ **Use sua conta** (uillenmachado@gmail.com) para todos os testes
- ✅ **Créditos ilimitados** - pode testar à vontade
- ✅ **Histórico registrado** - pode ver todas as ações no histórico
- ✅ **Sem custos** - Hunter.io não será cobrado nos seus testes

### Para Produção
- ⚠️ **Considere remover** esta migration antes do lançamento público
- ⚠️ **Ou modificar** para usar uma tabela de admin_users
- ⚠️ **Ou criar** um flag `is_admin` na tabela profiles
- ⚠️ **Documentar** que existe uma conta com acesso especial

### Alternativa para Produção
```sql
-- Criar coluna is_admin em profiles
ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Marcar sua conta como admin
UPDATE profiles 
SET is_admin = TRUE 
WHERE email = 'uillenmachado@gmail.com';

-- Modificar função is_dev_account para usar coluna
CREATE OR REPLACE FUNCTION is_dev_account(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🎉 Resultado Esperado

Após aplicar esta migration:

```
✅ uillenmachado@gmail.com = 999999 créditos (ilimitado)
✅ Não debita ao usar funcionalidades
✅ Registra no histórico com tag especial
✅ Badge especial no sidebar "∞ DEV"
✅ Todas outras contas = 10 créditos iniciais
✅ Outras contas debitam normalmente
✅ Sistema 100% funcional para testes
```

---

**🚀 Pronto para aplicar e testar com créditos ilimitados!**
