# ✅ GUIA DE VALIDAÇÃO PÓS-DEPLOY

**Use este checklist após cada deploy para garantir que tudo está funcionando.**

---

## 🚀 PASSO 1: Verificar Deploy Vercel

### Acessar Dashboard Vercel
1. Acesse: https://vercel.com/dashboard
2. Clique no projeto **snapdoor**
3. Verifique status do último deploy:
   - ✅ **Ready** (verde) = Deploy bem-sucedido
   - 🟡 **Building** (amarelo) = Aguarde (3-5 min)
   - ❌ **Error** (vermelho) = Ver logs de erro

### Obter URL de Produção
```
https://snapdoor-<hash>-uillens-projects.vercel.app
```

**Exemplo:**
```
https://snapdoor-2y5hhb2v3-uillens-projects.vercel.app
```

---

## 🔍 PASSO 2: Validação Visual (5 min)

### A. Console Browser (CRÍTICO)
1. Abrir URL de produção
2. Pressionar **F12** (DevTools)
3. Clicar em **Console**

**✅ Deve estar 100% LIMPO:**
- [ ] Sem erros vermelhos
- [ ] Sem warnings amarelos
- [ ] Sem erros 401 (PWA manifest)
- [ ] Sem erros createContext

**❌ Se aparecer QUALQUER erro:**
- Copiar mensagem completa
- Tirar screenshot
- Reportar no GitHub Issues

### B. Network Tab
1. DevTools > **Network** tab
2. Recarregar página (Ctrl+Shift+R)
3. Verificar:
   - [ ] `index.html` - **200 OK** (< 2 KB)
   - [ ] `vendor-xxx.js` - **200 OK** (~743 KB gzipped)
   - [ ] `vendor-charts-xxx.js` - **200 OK** (~59 KB gzipped)
   - [ ] `index-xxx.js` - **200 OK** (~11 KB gzipped)
   - [ ] `index-xxx.css` - **200 OK** (~15 KB gzipped)

**⚠️ Se algum arquivo 404:**
- Verificar `vercel.json` rewrites
- Rebuild e redeploy

### C. Performance Tab
1. DevTools > **Lighthouse**
2. Rodar audit (Mobile)
3. Verificar scores:
   - [ ] **Performance:** > 90 (target: 95+)
   - [ ] **Accessibility:** > 90 (target: 95+)
   - [ ] **Best Practices:** > 90 (target: 100)
   - [ ] **SEO:** > 90 (target: 100)

**🎯 Target Score Total:** > 360/400

---

## 🧪 PASSO 3: Testes Funcionais (10 min)

### A. Autenticação
1. **Signup (Criar Conta)**
   ```
   URL: /signup
   Email: teste@example.com
   Senha: Teste123!@#
   ```
   - [ ] Formulário aparece
   - [ ] Validação de email funciona
   - [ ] Validação de senha funciona (mínimo 8 chars)
   - [ ] Botão "Criar Conta" funciona
   - [ ] Redireciona para `/dashboard` após signup

2. **Login**
   ```
   URL: /login
   Email: teste@example.com
   Senha: Teste123!@#
   ```
   - [ ] Formulário aparece
   - [ ] Botão "Entrar" funciona
   - [ ] Redireciona para `/dashboard`
   - [ ] Sidebar aparece (menu lateral)

3. **Logout**
   - [ ] Clicar em avatar (canto superior direito)
   - [ ] Clicar em "Sair"
   - [ ] Redireciona para `/login`

### B. Dashboard
1. **Acesso**
   ```
   URL: /dashboard
   ```
   - [ ] Página carrega < 3s
   - [ ] 4 cards de métricas aparecem
   - [ ] Gráfico de pipeline aparece
   - [ ] Gráfico de atividades aparece
   - [ ] Busca global funciona (topo)

2. **Métricas**
   - [ ] **Total Leads:** número correto
   - [ ] **Deals Abertos:** número correto
   - [ ] **Atividades:** número correto
   - [ ] **Taxa de Conversão:** % correto

3. **Gráficos**
   - [ ] Pipeline chart (barras) aparece
   - [ ] Activities chart (linha) aparece
   - [ ] Recharts carrega sem erro

### C. Leads
1. **Lista de Leads**
   ```
   URL: /leads
   ```
   - [ ] Tabela de leads aparece
   - [ ] Coluna "Nome" aparece
   - [ ] Coluna "Empresa" aparece
   - [ ] Coluna "Email" aparece
   - [ ] Filtros funcionam (temperatura, status)
   - [ ] Busca funciona (campo de texto)

2. **Criar Lead**
   - [ ] Botão "+ Novo Lead" aparece
   - [ ] Dialog de criação abre
   - [ ] Campos: nome, email, empresa, cargo
   - [ ] Salvar funciona
   - [ ] Lead aparece na lista

3. **Detalhes do Lead**
   - [ ] Clicar em um lead da lista
   - [ ] Redireciona para `/leads/:id`
   - [ ] Informações do lead aparecem
   - [ ] Timeline de atividades aparece
   - [ ] Botões de ação aparecem

### D. Pipeline (Kanban)
```
URL: /deals
```
- [ ] Board Kanban aparece
- [ ] Colunas (stages) aparecem
- [ ] Cards de deals aparecem
- [ ] Drag & drop funciona
- [ ] Botão "+ Novo Deal" funciona

### E. Sidebar Navigation
- [ ] Dashboard (link funciona)
- [ ] Leads (link funciona)
- [ ] Deals (link funciona)
- [ ] Activities (link funciona)
- [ ] Reports (link funciona)
- [ ] Settings (link funciona)
- [ ] Ícones aparecem (Lucide icons)

---

## 📱 PASSO 4: Responsividade (5 min)

### Mobile (375px - iPhone SE)
1. DevTools > **Device Mode** (Ctrl+Shift+M)
2. Selecionar: **iPhone SE**
3. Verificar:
   - [ ] Sidebar collapse (menu hambúrguer)
   - [ ] Tabelas responsivas (scroll horizontal)
   - [ ] Botões touch-friendly (mínimo 44px)
   - [ ] Texto legível (fonte mínima 14px)

### Tablet (768px - iPad)
1. Selecionar: **iPad**
2. Verificar:
   - [ ] Sidebar visível (parcialmente)
   - [ ] Grid 2 colunas (dashboard)
   - [ ] Kanban funciona (drag & drop)

### Desktop (1920px)
1. Selecionar: **Responsive** → 1920x1080
2. Verificar:
   - [ ] Sidebar expandido
   - [ ] Grid 3-4 colunas (dashboard)
   - [ ] Sem espaços em branco excessivos

---

## ⚡ PASSO 5: Performance (3 min)

### A. Bundle Size
1. DevTools > **Network** tab
2. Filtrar: **JS**
3. Verificar tamanhos (gzipped):
   - [ ] `vendor.js` ≈ 743 KB
   - [ ] `vendor-charts.js` ≈ 59 KB
   - [ ] `index.js` ≈ 11 KB

**⚠️ Se vendor.js > 1 MB:**
- Revisar `vite.config.ts` manualChunks
- Considerar code splitting

### B. Loading Time
1. DevTools > **Network** tab
2. Recarregar (Ctrl+Shift+R)
3. Ver bottom status:
   - [ ] **DOMContentLoaded:** < 2s
   - [ ] **Load:** < 5s
   - [ ] **Finish:** < 10s

### C. Lighthouse Score
```bash
Performance:     > 90 ✅
Accessibility:   > 90 ✅
Best Practices:  > 90 ✅
SEO:             > 90 ✅
```

---

## 🐛 PASSO 6: Error Tracking (Sentry)

### Validar Integração Sentry
1. Acesse: https://sentry.io/projects/snapdoor/
2. Verificar:
   - [ ] Projeto existe
   - [ ] Source maps uploadados (release)
   - [ ] Nenhum erro nos últimos 10 min

### Forçar Erro de Teste (Opcional)
```javascript
// Console browser
throw new Error("Test error from production");
```
- [ ] Erro aparece no Sentry dashboard
- [ ] Stack trace correto (source maps)
- [ ] Environment: `production`

---

## 📋 CHECKLIST FINAL

### ✅ Deploy Bem-Sucedido Se:
- [ ] Console browser 100% limpo
- [ ] Login/Signup funcionam
- [ ] Dashboard carrega < 3s
- [ ] Leads CRUD funciona
- [ ] Kanban funciona
- [ ] Sidebar navigation funciona
- [ ] Responsivo (mobile/tablet/desktop)
- [ ] Lighthouse score > 360/400
- [ ] Sentry recebe eventos

### ❌ Deploy Falhou Se:
- [ ] Erros no console (createContext, 401, etc)
- [ ] Páginas não carregam (500, 404)
- [ ] Funcionalidades quebradas
- [ ] Performance < 60
- [ ] Sentry não recebe eventos

---

## 🚨 TROUBLESHOOTING

### Erro: "Cannot read properties of undefined (reading 'createContext')"
**Causa:** Chunk splitting incorreto  
**Solução:**
```bash
# 1. Verificar vite.config.ts manualChunks
# 2. Rebuild local
npm run build

# 3. Commit + push
git add vite.config.ts
git commit -m "fix: Corrige chunk splitting"
git push origin master
```

### Erro: "401 PWA Manifest"
**Causa:** Vercel não serve arquivos public/  
**Solução:**
```bash
# 1. Verificar vercel.json headers
# 2. Remover <link rel="manifest"> do index.html
# 3. Commit + push
git add index.html vercel.json
git commit -m "fix: Remove PWA manifest temporário"
git push origin master
```

### Erro: "Supabase connection failed"
**Causa:** Variáveis de ambiente não configuradas  
**Solução:**
1. Vercel Dashboard > Settings > Environment Variables
2. Adicionar:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGc...
   ```
3. Redeploy: Deployments > ⋮ > Redeploy

### Página 404 (Not Found)
**Causa:** SPA routing não configurado  
**Solução:**
1. Verificar `vercel.json` rewrites:
   ```json
   "rewrites": [
     { "source": "/(.*)", "destination": "/index.html" }
   ]
   ```
2. Commit + push

### Performance Score < 60
**Causa:** Bundle muito grande  
**Solução:**
1. Lighthouse > View Treemap
2. Identificar chunks grandes
3. Adicionar dynamic imports:
   ```typescript
   const Reports = lazy(() => import("@/pages/Reports"));
   ```

---

## 📚 RECURSOS

### Documentação
- `docs/DEPLOY_AUDIT_REPORT.md` - Auditoria completa
- `docs/VISUAL_TEST_CHECKLIST.md` - 120 testes manuais
- `docs/SAAS_READY_CHECKLIST.md` - Roadmap 9 fases
- `docs/SENTRY_SETUP_GUIDE.md` - Setup Sentry

### Links Úteis
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Sentry Dashboard:** https://sentry.io/projects/snapdoor/
- **Supabase Dashboard:** https://supabase.com/dashboard
- **GitHub Actions:** https://github.com/uillenmachado/snapdoor/actions

### Comandos Úteis
```bash
# Build local
npm run build

# Preview build local
npm run preview

# Dev server
npm run dev

# Testes
npm test

# Lint
npm run lint
```

---

## 🎯 PRÓXIMA AÇÃO

Após validar **TODOS** os itens acima:

1. ✅ Marcar task "Deploy Test" no TODO
2. ✅ Executar `VISUAL_TEST_CHECKLIST.md` (120 checks)
3. ✅ Iniciar `SAAS_READY_CHECKLIST.md` FASE 1 (Configurações Técnicas)

---

**Tempo total estimado:** 20-25 minutos  
**Frequência recomendada:** A cada deploy (automático via CI/CD)

🚀 **Boa validação!**
