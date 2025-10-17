# 🔧 Migração OAuth2 - Instruções Manuais

## ⚠️ Importante
Devido a divergências no histórico de migrações, você precisa aplicar esta migração manualmente via Supabase Dashboard.

## 📝 Passos

### 1. Abra o Supabase Dashboard
- Acesse: https://supabase.com/dashboard
- Selecione seu projeto: **SnapDoor**

### 2. Vá para SQL Editor
- Menu lateral → **SQL Editor**
- Clique em **New Query**

### 3. Cole e Execute o SQL

```sql
-- ============================================
-- ADD OAUTH2 FIELDS TO email_integrations
-- ============================================
-- Adiciona campos necessários para OAuth2 (Google, Outlook)

ALTER TABLE public.email_integrations 
ADD COLUMN IF NOT EXISTS access_token TEXT,
ADD COLUMN IF NOT EXISTS refresh_token TEXT,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS oauth_scopes TEXT[];

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON COLUMN public.email_integrations.access_token IS 'Token de acesso OAuth2 (criptografado)';
COMMENT ON COLUMN public.email_integrations.refresh_token IS 'Token de refresh OAuth2 (criptografado)';
COMMENT ON COLUMN public.email_integrations.token_expires_at IS 'Data de expiração do access_token';
COMMENT ON COLUMN public.email_integrations.oauth_scopes IS 'Escopos autorizados pelo usuário';
```

### 4. Clique em **RUN** (Ctrl+Enter)

### 5. Verifique o Resultado
Você deve ver: ✅ **Success. No rows returned**

### 6. Confirme a Estrutura da Tabela

Execute esta query para confirmar:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'email_integrations' 
AND column_name IN ('access_token', 'refresh_token', 'token_expires_at', 'oauth_scopes')
ORDER BY ordinal_position;
```

Resultado esperado:
```
access_token       | text
refresh_token      | text
token_expires_at   | timestamp with time zone
oauth_scopes       | ARRAY
```

## ✅ Próximos Passos

Após aplicar a migração:

1. **Regenerar tipos TypeScript**:
   ```bash
   npx supabase gen types typescript --project-id cfydbvrzjtbcrbzimfjm > src/integrations/supabase/types.ts
   ```

2. **Configurar Google Cloud** (siga `GOOGLE_OAUTH_SETUP.md`)

3. **Habilitar Google Auth no Supabase**:
   - Dashboard → Authentication → Providers
   - Enable "Google"
   - Cole Client ID e Client Secret

4. **Implementar frontend OAuth flow**

## 🆘 Problemas?

Se a migração falhar com erro "column already exists":
- ✅ Perfeito! Significa que os campos já existem
- Prossiga para os próximos passos

Se houver outro erro:
- Copie a mensagem completa
- Compartilhe com o agente para análise
