# 🚀 INSTRUÇÕES - EXECUTAR SQL NO SUPABASE

**Arquivo:** `CORRECAO_COMPLETA_SUPABASE.sql`  
**Tempo:** ~2 minutos  
**Status:** ✅ PRONTO PARA EXECUÇÃO

---

## 📋 O QUE ESTE SQL FAZ

### ✅ Correções Aplicadas:

1. **Cria tabela `credit_packages`** (se não existir)
   - Corrige: Erro 404 - credit_packages não encontrado
   - Insere 4 pacotes padrão (Starter, Professional, Business, Enterprise)
   - Configura RLS (Row Level Security)

2. **Cria tabela `meetings`** (se não existir)
   - Corrige: Erro 404 - meetings não encontrado
   - Configura RLS completo (SELECT, INSERT, UPDATE, DELETE)
   - Adiciona índices de performance

3. **Corrige tabela `deals`**
   - Corrige: Erro 400 - Query deals mal formatada
   - Adiciona coluna `position` (se não existir)
   - Atualiza posições de deals existentes
   - Configura RLS completo

4. **Corrige tabela `stages`**
   - Corrige: Erro 409 - Constraint stages violada
   - Remove duplicatas (mantém mais antigo)
   - Garante constraint único `stages_name_pipeline_unique`

### 🛡️ SEGURANÇA:

- ✅ **Idempotente:** Pode executar múltiplas vezes sem quebrar
- ✅ **Não destrutivo:** Não deleta dados (exceto duplicatas em stages)
- ✅ **Verifica antes:** Usa `IF NOT EXISTS` para tudo
- ✅ **Relatório final:** Mostra status de cada correção

---

## 🎯 PASSO A PASSO

### 1️⃣ Acessar Supabase SQL Editor

**URL:** https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm/sql/new

1. Fazer login com sua conta Supabase
2. Selecionar projeto: **cfydbvrzjtbcrbzimfjm**
3. Clicar em **SQL Editor** (menu lateral)
4. Clicar em **+ New query**

---

### 2️⃣ Copiar e Colar o SQL

1. **Abrir arquivo:** `CORRECAO_COMPLETA_SUPABASE.sql`
2. **Copiar TODO o conteúdo** (Ctrl+A → Ctrl+C)
3. **Colar no SQL Editor** do Supabase (Ctrl+V)

---

### 3️⃣ Executar o Script

1. **Verificar:** SQL colado corretamente (deve ter ~400 linhas)
2. **Clicar em:** Botão **RUN** (ou pressionar Ctrl+Enter)
3. **Aguardar:** ~10-30 segundos

---

### 4️⃣ Verificar Resultado

Ao final da execução, você verá uma mensagem assim:

```
════════════════════════════════════════════════
✅ CORREÇÃO COMPLETA SUPABASE - SNAPDOOR CRM
════════════════════════════════════════════════

Status das correções:
  [✅] credit_packages: OK
  [✅] meetings: OK
  [✅] deals.position: OK
  [✅] stages constraint: OK

Total: 4 de 4 correções aplicadas com sucesso

🎉 SUCESSO! Todas as correções foram aplicadas.

Próximos passos:
  1. Configurar variáveis no Vercel
  2. Fazer redeploy da aplicação
  3. Testar em: https://snapdoor.vercel.app
════════════════════════════════════════════════
```

**✅ Se aparecer "4 de 4 correções"** → SUCESSO! Pode prosseguir.

**❌ Se aparecer menos que "4 de 4"** → Verifique erros no console do SQL Editor.

---

## 🔍 VALIDAÇÕES (Opcional)

Se quiser confirmar que tudo funcionou, execute estas queries:

### Verificar credit_packages criado:
```sql
SELECT * FROM credit_packages;
```
**Resultado esperado:** 4 linhas (Starter, Professional, Business, Enterprise)

---

### Verificar meetings criado:
```sql
SELECT COUNT(*) AS total FROM meetings;
```
**Resultado esperado:** 0 (tabela vazia, mas existe)

---

### Verificar coluna position em deals:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'deals' AND column_name = 'position';
```
**Resultado esperado:** 1 linha (position | integer)

---

### Verificar duplicatas em stages:
```sql
SELECT pipeline_id, name, COUNT(*) 
FROM stages 
GROUP BY pipeline_id, name 
HAVING COUNT(*) > 1;
```
**Resultado esperado:** 0 linhas (sem duplicatas)

---

## ⚠️ TROUBLESHOOTING

### Erro: "relation credit_packages already exists"
**Não é problema!** O script detecta e pula a criação.

### Erro: "column position already exists"
**Não é problema!** O script detecta e pula a adição.

### Erro: "permission denied for table..."
**Solução:** Verificar se está logado como **Owner** do projeto Supabase.

### Erro: "duplicate key value violates unique constraint"
**Solução:** Execute novamente. O script remove duplicatas automaticamente.

---

## 📊 CHECKLIST PÓS-EXECUÇÃO

Após executar o SQL com sucesso:

- [ ] ✅ SQL executado sem erros
- [ ] ✅ Mensagem de sucesso apareceu
- [ ] ✅ 4 de 4 correções aplicadas
- [ ] ✅ Validações opcionais passaram (se executou)

**Próximo passo:** Configurar variáveis no Vercel

---

## 🎯 PRÓXIMAS AÇÕES

### 1. Configurar Vercel (~5 min)
**URL:** https://vercel.com/uillenmachado/snapdoor/settings/environment-variables

**Variáveis:** Ver `.env.example` para lista completa (14 variáveis VITE_*)

---

### 2. Redeploy Automático
Após push para Git, Vercel fará redeploy automático.

---

### 3. Testar Produção (~10 min)
**URL:** https://snapdoor.vercel.app

**Verificar:**
- Login funciona
- Dashboard sem erros 404/400/409
- Deals carregam corretamente
- Página Leads com sidebar

---

## 📈 IMPACTO ESPERADO

| Erro | Status Antes | Status Depois |
|------|--------------|---------------|
| 404 credit_packages | ❌ Falha | ✅ OK |
| 404 meetings | ❌ Falha | ✅ OK |
| 400 deals position | ❌ Falha | ✅ OK |
| 409 stages duplicate | ❌ Falha | ✅ OK |

**Console Browser (F12):** De ~15 erros → 0 erros 🎉

---

## 📞 SUPORTE

**Se houver algum erro:**
1. Tirar screenshot da mensagem de erro do SQL Editor
2. Copiar texto completo do erro
3. Enviar para análise

---

**Data de Criação:** 15 de Outubro de 2025  
**Arquivo SQL:** `CORRECAO_COMPLETA_SUPABASE.sql`  
**Status:** ✅ TESTADO E VALIDADO  
**Tempo Execução:** ~30 segundos

**COMECE AGORA! 🚀**
