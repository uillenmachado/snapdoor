# 🧹 Como Limpar o Cache do Navegador e Service Worker

## ⚠️ Problema Atual

O erro CORS ainda aparece porque o **Service Worker** (`sw.js`) está em cache no navegador e está interceptando as requisições com a versão ANTIGA do código.

Mesmo após fazer Ctrl+Shift+R, o Service Worker continua ativo em segundo plano.

---

## ✅ SOLUÇÃO DEFINITIVA (3 Passos)

### 1️⃣ Abra as DevTools (F12)

### 2️⃣ Vá para a Aba "Application" (ou "Aplicativo")

### 3️⃣ Limpe TUDO:

#### A. Service Workers
```
Application > Service Workers > 
Clique em "Unregister" (Cancelar registro) ao lado de "sw.js"
```

#### B. Cache Storage
```
Application > Storage > Cache Storage >
Clique direito > "Clear"
```

#### C. Local Storage
```
Application > Storage > Local Storage >
Clique direito > "Clear"
```

#### D. Session Storage
```
Application > Storage > Session Storage >
Clique direito > "Clear"
```

#### E. Limpar Tudo de Uma Vez
```
Application > Storage >
Clique no botão "Clear site data" (no topo)
✅ Marque TODAS as opções
✅ Clique em "Clear site data"
```

### 4️⃣ Feche e Reabra o Navegador

**IMPORTANTE:** Não é suficiente apenas recarregar! Feche completamente o navegador e abra novamente.

```
1. Feche TODAS as abas do localhost:8080
2. Feche o navegador completamente
3. Abra o navegador novamente
4. Acesse http://localhost:8080
```

---

## 🚀 ALTERNATIVA MAIS RÁPIDA

### Use o Modo Anônimo (Incognito)

O modo anônimo não tem Service Workers ou cache:

**Chrome/Edge:**
```
Ctrl + Shift + N
```

**Firefox:**
```
Ctrl + Shift + P
```

**Safari:**
```
Cmd + Shift + N
```

Depois acesse: `http://localhost:8080`

---

## 🔍 Como Verificar se Funcionou

### Console do DevTools deve mostrar:

✅ **SEM** estas mensagens:
```
❌ Access to fetch at 'https://api.hunter.io/...' has been blocked by CORS policy
❌ Request header field content-type is not allowed
❌ sw.js:26 Uncaught (in promise) TypeError: Failed to fetch
```

✅ **COM** estas mensagens:
```
✅ 🔍 Domínio extraído da empresa "IVI B2B": ivi-b2b.com
✅ 🔍 Enriquecendo por LinkedIn handle: uillenmachado
✅ Status 200 (requisição bem-sucedida)
✅ Lead enriquecido com sucesso!
```

### Na Aba Network (Rede):

1. Abra F12 > Network
2. Clique em "Enriquecer Lead"
3. Veja as requisições para `api.hunter.io`
4. Status deve ser **200** (não 404 ou ERR_FAILED)
5. Response deve ter JSON com dados

---

## 🛠️ Se AINDA Não Funcionar

### Desabilite Service Workers Temporariamente:

```
1. F12 > Application > Service Workers
2. Marque a checkbox "Bypass for network"
3. Mantenha DevTools aberto
4. Recarregue a página
5. Teste o enriquecimento
```

### Ou Force a Atualização:

```bash
# No terminal PowerShell:
cd "C:\Users\Uillen Machado\Documents\Meus projetos\snapdoor"
npm run build
npm run dev
```

Isso força a reconstrução completa do projeto.

---

## 📝 Observações Importantes

### Nota sobre "404 - Profile does not exist"

Depois de limpar o cache, você pode ver:
```
❌ The profile associated with the provided LinkedIn handle does not exist in our database.
```

**Isso é NORMAL!** Significa que:
- ✅ CORS foi resolvido (requisição chegou na API)
- ❌ Hunter.io não tem seu perfil no banco deles
- ✅ O sistema está funcionando corretamente

**Solução:** Teste com perfis famosos que a Hunter.io conhece:
- `linkedin.com/in/williamhgates` (Bill Gates)
- `linkedin.com/in/satyanadella` (CEO Microsoft)
- `linkedin.com/in/jeffweiner08` (Ex-CEO LinkedIn)

---

## ✅ Checklist Final

- [ ] Abri F12 > Application
- [ ] Cliquei em "Clear site data"
- [ ] Fechei o navegador completamente
- [ ] Abri o navegador novamente
- [ ] Acessei localhost:8080
- [ ] Testei enriquecimento
- [ ] SEM erros CORS no console
- [ ] Requisições com status 200 OU 404 (não ERR_FAILED)

---

**Última Atualização:** 10/10/2025  
**Commit:** b2c6eb6 (CORS corrigido no código)
