# 🔄 Forçar Rebuild do Vercel

## Problema Identificado

O Vercel está fazendo deploy mas servindo versão antiga (cache).

## Soluções

### 1. Force Rebuild no Dashboard do Vercel

**Passo a passo:**
1. Acesse: https://vercel.com/dashboard
2. Clique no projeto "snapdoor"
3. Vá em "Deployments"
4. Clique nos 3 pontos do último deployment
5. Clique em "Redeploy"
6. **IMPORTANTE:** Marque a opção "Use existing Build Cache" como **DESMARCADA**
7. Clique em "Redeploy"

### 2. Invalidar Cache via Vercel CLI

```bash
# Instalar Vercel CLI (se não tiver)
npm i -g vercel

# Login
vercel login

# Link ao projeto
vercel link

# Forçar redeploy sem cache
vercel --force
```

### 3. Commit Vazio para Forçar Build

```bash
# Criar commit vazio
git commit --allow-empty -m "chore: força rebuild do Vercel"

# Push
git push origin master
```

### 4. Verificar Configuração do Vercel

**No Dashboard → Settings → Build & Development Settings:**

- **Framework Preset:** Vite
- **Build Command:** `bun run build` ou `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `bun install` ou `npm install`

**Variáveis de Ambiente:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 5. Limpar Cache do Navegador

Mesmo com deploy novo, o navegador pode estar com cache:

**Chrome/Edge:**
```
1. Ctrl + Shift + Delete
2. Marcar "Cached images and files"
3. Período: "All time"
4. Clear data
```

**Ou force reload:**
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

---

## 🔍 Verificações

### 1. Confirmar Último Commit no Vercel

No dashboard do Vercel, verificar se o commit hash é: **4073850**

Se for diferente, o Vercel não detectou o push.

### 2. Verificar Logs de Build

No Vercel → Deployments → Último deploy → View Function Logs

Procurar por erros no build.

### 3. Verificar Branch Configurada

No Vercel → Settings → Git

**Production Branch** deve ser: `master`

Se estiver em outra branch (ex: `feat/ui-padrao-pipedrive`), mudar para `master`.

---

## ⚠️ Possíveis Causas

### 1. Vercel não detectou push
**Solução:** Webhook do GitHub pode estar com problema. Fazer redeploy manual.

### 2. Build com erro silencioso
**Solução:** Verificar logs de build no Vercel.

### 3. Cache agressivo
**Solução:** Redeploy sem cache + limpar cache do navegador.

### 4. Branch errada configurada
**Solução:** Configurar production branch para `master`.

### 5. CDN cache
**Solução:** O Vercel usa CDN global. Pode levar até 5 minutos para propagar.

---

## 🚀 Ação Imediata Recomendada

**Execute agora:**

```bash
# 1. Commit vazio para forçar
git commit --allow-empty -m "chore: força rebuild Vercel - limpar cache"
git push origin master

# 2. Aguarde 2-3 minutos

# 3. Force reload no navegador
# Ctrl + Shift + R
```

---

## 📊 Checklist de Diagnóstico

- [ ] Commit `4073850` está no GitHub? (Verificar em github.com/uillenmachado/snapdoor)
- [ ] Vercel detectou o commit? (Ver em Deployments)
- [ ] Build completou com sucesso? (Status "Ready")
- [ ] Branch correta configurada? (master)
- [ ] Limpou cache do navegador? (Ctrl+Shift+R)
- [ ] Esperou 3-5 minutos? (CDN propagation)

---

## 🎯 Se Ainda Não Funcionar

**Último recurso:**

1. No Vercel Dashboard → Settings → General
2. Scroll até o final
3. Clique em "Delete Project" (NÃO FAÇA ISSO AINDA)
4. **OU** simplesmente faça "Redeploy" forçado (opção mais segura)

---

**Arquivo criado:** $(date) 16/10/2025  
**Último commit:** 4073850  
**Status:** Aguardando ação manual no Vercel
