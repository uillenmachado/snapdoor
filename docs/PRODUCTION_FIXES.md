# 🚀 CORREÇÕES DE PRODUÇÃO - SNAPDOOR

**Data**: 11 de outubro de 2025  
**Status**: AÇÕES NECESSÁRIAS  
**Prioridade**: CRÍTICA

---

## ❌ PROBLEMAS IDENTIFICADOS

### 1. Service Worker Quebrando (sw.js)
**Erro**: `sw.js:26 Uncaught (in promise) TypeError: Failed to fetch`  
**Causa**: Service Worker registrado em cache do navegador mas arquivo não existe  
**Impacto**: Spam de erros no console (não afeta funcionalidade)  
**Status**: ✅ Já corrigido no código

**Solução para usuários**:
1. Chrome DevTools > Application > Service Workers
2. Click "Unregister" em qualquer service worker listado
3. Hard refresh (Ctrl+Shift+R)

---

### 2. Erro 400 ao Salvar Dados no Banco ❌ CRÍTICO
**Erro**: `Failed to load resource: the server responded with a status of 400`  
**Causa**: Campos `headline` e `about` não existem na tabela `leads`  
**Impacto**: Enriquecimento falha completamente mesmo quando Edge Function funciona  
**Status**: ⚠️ **REQUER AÇÃO MANUAL**

**📋 AÇÃO NECESSÁRIA**:

1. Acesse [Supabase Dashboard - SQL Editor](https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm/sql/new)

2. Execute o SQL abaixo:

```sql
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS headline TEXT,
  ADD COLUMN IF NOT EXISTS about TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS education TEXT,
  ADD COLUMN IF NOT EXISTS connections TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS seniority TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT,
  ADD COLUMN IF NOT EXISTS company_size TEXT,
  ADD COLUMN IF NOT EXISTS company_industry TEXT,
  ADD COLUMN IF NOT EXISTS company_location TEXT;
```

3. Click "Run" (F5)

4. Verifique se retornou "Success. No rows returned"

**Arquivo pronto**: `apply-migration-now.sql` (cópia do SQL acima)

---

### 3. Edge Function Não Extrai Dados ⚠️ EM INVESTIGAÇÃO
**Erro**: `Não foi possível extrair dados do perfil`  
**Causa**: Parsing HTML do LinkedIn falhando  
**Impacto**: Enriquecimento via LinkedIn scraper não funciona  
**Status**: 🔄 Edge Function deployada com logs para diagnóstico

**Deployado**: v10 (com logs detalhados)

**Como ver logs**:
1. [Supabase Dashboard - Functions](https://supabase.com/dashboard/project/cfydbvrzjtbcrbzimfjm/functions)
2. Click em `linkedin-scraper`
3. Tab "Logs"
4. Procurar por:
   - `🔍 Meta tags extraídas:`
   - `og:title:`
   - `og:description:`

---

## ✅ O QUE JÁ FUNCIONA

1. ✅ **fetch() direto ao Edge Function** (corrigido do bug do supabase.functions.invoke)
2. ✅ **Extração de cargo do "about"** quando título não tem padrão "Cargo at Empresa"
3. ✅ **Proxy fallback** para contornar bloqueio do LinkedIn
4. ✅ **Hunter.io API** integrado e funcionando
5. ✅ **Sistema de 3 camadas** de enriquecimento

---

## 📊 RESULTADOS DOS TESTES

### Teste 1: Marcio Gonçalves (privado)
- ❌ Hunter.io: 404 (não existe no banco deles)
- ❌ Edge Function: "Não foi possível extrair dados"
- **Status**: Esperado para perfil privado

### Teste 2: Andre Oliveira (público)
- ❌ Hunter.io: 404 (não existe no banco deles)
- ✅ Edge Function: **FUNCIONOU!**
  - Nome: Andre Oliveira
  - Cargo: (vazio - precisa investigar)
  - Empresa: Oliva Marketing
  - Local: Belo Horizonte
  - Educação: UFSJ
  - Conexões: 500+
- ❌ Salvar no banco: **ERRO 400** (campos não existem)

---

## 🎯 PRÓXIMOS PASSOS

### IMEDIATO (VOCÊ PRECISA FAZER AGORA):

1. **Aplicar Migration SQL** (instruções acima)
2. **Hard Refresh** (Ctrl+Shift+R)
3. **Testar enriquecimento** com Andre Oliveira novamente
4. **Verificar logs** da Edge Function no Supabase Dashboard

### APÓS MIGRATION:

1. Testar com Uillen Machado (público, deve funcionar 100%)
2. Testar com Marcio Gonçalves (privado, deve retornar mensagem apropriada)
3. Validar todos os dados salvam corretamente

---

## 🔧 ARQUIVOS MODIFICADOS

- ✅ `supabase/functions/linkedin-scraper/index.ts` (v10 - logs detalhados)
- ✅ `apply-migration-now.sql` (script pronto para executar)
- ✅ Commit: `80baf26` - "fix(prod): adicionar logs na Edge Function + script de migration"

---

## 📞 SUPORTE

Se após aplicar a migration ainda houver erros:

1. Compartilhe screenshot do console (erros completos)
2. Compartilhe screenshot dos logs da Edge Function
3. Informe qual perfil do LinkedIn testou

---

## ⚠️ LEMBRETES IMPORTANTES

- **NÃO USE soluções temporárias** em produção
- **SEMPRE aplique migrations** antes de deployar código que usa novos campos
- **SEMPRE teste** em ambiente de desenvolvimento primeiro
- **Service Workers** podem causar problemas de cache - sempre desregistrar ao debugar

---

**Status Final**: ⚠️ AGUARDANDO APLICAÇÃO DE MIGRATION MANUAL
