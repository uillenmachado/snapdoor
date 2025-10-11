# 🔧 FIX: EDGE FUNCTION 404 NO FRONTEND

**Data:** 11 de outubro de 2025  
**Problema:** Edge Function retorna 404 quando chamada pelo frontend, mas funciona via cURL  
**Status:** 🔄 **EM INVESTIGAÇÃO**

---

## 🚨 PROBLEMA

### **Erro no Console:**
```
cfydbvrzjtbcrbzimfjm.supabase.co/functions/v1/linkedin-scraper:1  
Failed to load resource: the server responded with a status of 404 ()

❌ [LinkedIn Scraper] Erro na Edge Function: FunctionsHttpError: 
Edge Function returned a non-2xx status code
```

### **Contexto:**
- ✅ Edge Function deployada e ativa (v6)
- ✅ Funciona perfeitamente via **cURL**
- ❌ Retorna **404** quando chamada pelo **frontend**

---

## 🧪 TESTES REALIZADOS

### **Teste 1: cURL com Authorization Header (SUCESSO)**
```bash
curl -X POST "https://cfydbvrzjtbcrbzimfjm.supabase.co/functions/v1/linkedin-scraper" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"linkedinUrl":"https://www.linkedin.com/in/williamhgates"}'
```

**Resultado:** ✅ **SUCESSO**
```json
{
  "data": {
    "fullName": "Bill Gates",
    "firstName": "Bill",
    ...
  },
  "success": true
}
```

### **Teste 2: cURL com apikey Header (SUCESSO)**
```bash
curl -X POST "https://cfydbvrzjtbcrbzimfjm.supabase.co/functions/v1/linkedin-scraper" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{"linkedinUrl":"https://www.linkedin.com/in/williamhgates"}'
```

**Resultado:** ✅ **SUCESSO**

### **Teste 3: Frontend com supabase.functions.invoke() (FALHA)**
```typescript
const { data, error } = await supabase.functions.invoke('linkedin-scraper', {
  body: { linkedinUrl: profileUrl }
});
```

**Resultado:** ❌ **404 - Edge Function returned a non-2xx status code**

---

## 🔍 ANÁLISE DO PROBLEMA

### **Possíveis Causas:**

1. **JWT Verification Ativada** ❓
   - Edge Function pode estar exigindo JWT válido
   - Frontend envia token de usuário autenticado
   - Token pode não ter permissões corretas

2. **Headers Faltando** ❓
   - `apikey` header pode não estar sendo enviado
   - `supabase.functions.invoke()` pode não incluir headers necessários

3. **CORS Issues** ❌ (improvável)
   - Edge Function tem CORS configurado corretamente
   - cURL funciona, então não é CORS

4. **Permissões RLS** ❓
   - Edge Function pode estar verificando permissões de usuário
   - Usuário pode não ter acesso

---

## 🔧 SOLUÇÕES TENTADAS

### **1. Re-deploy com --no-verify-jwt**
```bash
npx supabase functions deploy linkedin-scraper --no-verify-jwt
```

**Status:** ✅ Deployado (versão 6)  
**Resultado:** ⏳ Aguardando teste no frontend

### **2. Adicionar Headers Explícitos**
```typescript
const { data, error } = await supabase.functions.invoke('linkedin-scraper', {
  body: { linkedinUrl: profileUrl },
  headers: {
    'Content-Type': 'application/json',
  }
});
```

**Status:** ✅ Commitado  
**Resultado:** ⏳ Aguardando teste no frontend

---

## 📊 COMPARAÇÃO: cURL vs Frontend

| Aspecto | cURL | Frontend | Status |
|---------|------|----------|--------|
| **Authorization** | Bearer token | ✅ Incluso | ✅ |
| **apikey** | ✅ Explícito | ❓ Automático | ⚠️ |
| **Content-Type** | ✅ application/json | ✅ Adicionado | ✅ |
| **Body** | ✅ JSON string | ✅ Object | ✅ |
| **Resultado** | ✅ SUCESSO | ❌ 404 | ❌ |

---

## 🎯 PRÓXIMOS PASSOS

### **Passo 1: Testar no Frontend**
1. ✅ Fazer hard refresh (Ctrl+Shift+R)
2. ✅ Limpar cache do browser
3. ✅ Tentar enriquecer lead novamente
4. ✅ Verificar console logs

### **Passo 2: Se Ainda Falhar**
Adicionar debug logs para ver headers enviados:
```typescript
console.log('🔍 Supabase URL:', supabase.supabaseUrl);
console.log('🔍 Supabase Key:', supabase.supabaseKey?.substring(0, 20) + '...');
```

### **Passo 3: Verificar Permissões**
```sql
-- Verificar RLS nas tabelas relacionadas
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'leads';
```

### **Passo 4: Testar com Service Role Key**
Se tudo falhar, testar com service_role_key:
```typescript
import { createClient } from '@supabase/supabase-js';

const serviceClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY // Mais permissões
);

const { data, error } = await serviceClient.functions.invoke('linkedin-scraper', {
  body: { linkedinUrl: profileUrl }
});
```

---

## 💡 HIPÓTESE PRINCIPAL

**O problema está na autenticação do usuário no frontend.**

### **Evidências:**
1. ✅ cURL funciona (usa anon key sem contexto de usuário)
2. ❌ Frontend falha (usa anon key COM contexto de usuário autenticado)
3. ✅ Edge Function tem `--no-verify-jwt` (não deveria importar)

### **Teoria:**
A Edge Function pode estar tentando acessar recursos do Supabase (ex: banco de dados) usando o contexto do usuário autenticado, mas o usuário não tem permissões para invocar a função.

### **Solução Proposta:**
Verificar no **Supabase Dashboard** se há alguma política de acesso (Policy) bloqueando a invocação da Edge Function por usuários autenticados.

---

## 📚 REFERÊNCIAS

### **Supabase Edge Functions:**
- https://supabase.com/docs/guides/functions
- https://supabase.com/docs/guides/functions/auth

### **Comandos Úteis:**
```bash
# Listar functions
npx supabase functions list

# Ver logs em tempo real
npx supabase functions logs linkedin-scraper

# Re-deploy
npx supabase functions deploy linkedin-scraper --no-verify-jwt

# Ver secrets
npx supabase secrets list
```

---

## 🔄 ATUALIZAÇÃO NECESSÁRIA

**Após testar no frontend, atualizar este documento com:**
1. ✅ Resultado do teste
2. ✅ Logs do console
3. ✅ Headers enviados
4. ✅ Solução final aplicada

---

**👨‍💻 Investigado por:** IA Assistant  
**📅 Data:** 11 de outubro de 2025  
**🎯 Status:** 🔄 **EM INVESTIGAÇÃO - AGUARDANDO TESTE NO FRONTEND**
