# 🧹 Guia de Manutenção Contínua - SnapDoor CRM

> **Como manter o projeto limpo e profissional ao longo do tempo**

---

## 📋 Checklist Semanal

Execute estes comandos toda semana para manter a qualidade:

```bash
# 1. Verificar tipos TypeScript
npm run type-check

# 2. Executar lint
npm run lint

# 3. Rodar testes
npm run test

# 4. Build de produção (validar)
npm run build

# 5. Verificar dependências desatualizadas
npm outdated
```

---

## 🔍 Checklist Mensal

### 1. Limpeza de Arquivos

```bash
# Procurar arquivos temporários
Get-ChildItem -Recurse -File | Where-Object { 
  $_.Name -match "\.tmp$|\.temp$|\.bak$|\.OLD\." 
} | Select-Object FullName

# Procurar console.log desnecessários
npx grep-cli "console.log" src/

# Procurar TODOs e FIXMEs
npx grep-cli "TODO:|FIXME:|XXX:" src/
```

### 2. Auditoria de Dependências

```bash
# Verificar vulnerabilidades
npm audit

# Corrigir vulnerabilidades automáticas
npm audit fix

# Atualizar dependências (cuidado!)
npm update

# Remover dependências não usadas
npx depcheck
```

### 3. Análise de Bundle

```bash
# Analisar tamanho do bundle
npm run build
npx vite-bundle-visualizer

# Verificar code splitting
npm run preview
```

---

## 🗄️ Checklist Trimestral

### 1. Auditoria Supabase

```bash
# Gerar types atualizados
npx supabase gen types typescript --linked > src/integrations/supabase/types.ts

# Verificar migrations pendentes
npx supabase db diff

# Revisar RLS policies
npx supabase db push --dry-run
```

### 2. Refatoração de Código

- [ ] Revisar e tipar todos os `any` encontrados
- [ ] Atualizar testes com nova cobertura
- [ ] Revisar e otimizar queries Supabase
- [ ] Verificar performance com Lighthouse

### 3. Documentação

- [ ] Atualizar README.md com novas features
- [ ] Documentar novas APIs em `docs/api/`
- [ ] Atualizar CHANGELOG.md
- [ ] Revisar `docs/ROADMAP_TO_10.md`

---

## ⚠️ Sinais de Alerta

### 🔴 Crítico - Resolver Imediatamente

- ❌ Erros de TypeScript compilation
- ❌ Testes falhando
- ❌ Vulnerabilidades de segurança (npm audit)
- ❌ Build de produção quebrado
- ❌ Migrations do Supabase fora de sync

### 🟡 Importante - Resolver em 1 Semana

- ⚠️ Warnings de TypeScript > 100
- ⚠️ Cobertura de testes < 70%
- ⚠️ Bundle size > 500KB
- ⚠️ Lighthouse score < 90
- ⚠️ Dependências > 6 meses desatualizadas

### 🟢 Melhoria - Resolver em 1 Mês

- 💡 console.log em produção
- 💡 Comentários TODO/FIXME
- 💡 Componentes duplicados
- 💡 Performance médio/baixo
- 💡 Documentação incompleta

---

## 🛠️ Comandos Úteis

### Limpeza Rápida

```bash
# Limpar node_modules e reinstalar
rm -rf node_modules
npm install

# Limpar cache do npm
npm cache clean --force

# Limpar dist
rm -rf dist

# Rebuild completo
npm run build
```

### Análise de Código

```bash
# Contar linhas de código
npx cloc src/

# Analisar complexidade
npx eslint src/ --ext .ts,.tsx --format stylish

# Verificar imports não usados
npx ts-prune

# Encontrar código morto
npx unimported
```

### Performance

```bash
# Analisar bundle
npx vite-bundle-visualizer

# Lighthouse CI
npx lighthouse http://localhost:8080 --view

# Analisar dependências pesadas
npx webpack-bundle-analyzer
```

---

## 📊 Métricas de Qualidade Alvo

### Código

| Métrica | Mínimo | Ideal | Atual |
|---------|--------|-------|-------|
| **Type Coverage** | 90% | 98% | ~85% |
| **Test Coverage** | 70% | 90% | ~80% |
| **ESLint Errors** | 0 | 0 | 0 ✅ |
| **ESLint Warnings** | <20 | 0 | 67 ⚠️ |

### Performance

| Métrica | Mínimo | Ideal | Atual |
|---------|--------|-------|-------|
| **Lighthouse Score** | 85 | 95+ | 95+ ✅ |
| **Bundle Size** | <500KB | <300KB | ~350KB ✅ |
| **First Load** | <2s | <1s | <1s ✅ |
| **Hot Reload** | <500ms | <200ms | <200ms ✅ |

### Segurança

| Aspecto | Status Atual |
|---------|--------------|
| **npm audit** | ✅ 0 vulnerabilidades |
| **RLS Policies** | ✅ Implementado |
| **Input Validation** | ✅ Zod |
| **XSS Protection** | ✅ React |
| **CSRF Protection** | ✅ Supabase |

---

## 🔄 Processo de PR/MR

### Antes de Commitar

```bash
# 1. Lint
npm run lint

# 2. Type check
npm run type-check

# 3. Testes
npm run test

# 4. Build
npm run build

# 5. Preview
npm run preview
```

### Padrão de Commit

```
<tipo>(<escopo>): <descrição curta>

[corpo opcional]

[footer opcional]
```

**Tipos:**
- `feat:` Nova feature
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação (não afeta código)
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

**Exemplo:**
```bash
git commit -m "feat(leads): adicionar filtro por data de criação

- Implementado DatePicker no LeadsPage
- Adicionado query param para filtro
- Atualizado testes

Closes #123"
```

---

## 📅 Roteiro de Melhorias

### Próximos 30 Dias

- [ ] Reduzir warnings ESLint de 67 para <20
- [ ] Aumentar cobertura de testes para 85%
- [ ] Adicionar E2E tests básicos
- [ ] Melhorar acessibilidade (ARIA labels)

### Próximos 60 Dias

- [ ] Implementar Storybook
- [ ] Code splitting por rota
- [ ] Otimizar bundle size para <300KB
- [ ] Adicionar monitoring (Sentry)

### Próximos 90 Dias

- [ ] Tipar todos os `any` (59 ocorrências)
- [ ] Cobertura de testes 90%
- [ ] Lighthouse score 98+
- [ ] Documentação completa da API

---

## 🆘 Troubleshooting Comum

### "Build quebrou após atualização"

```bash
# 1. Limpar tudo
rm -rf node_modules dist
npm install

# 2. Verificar types
npx supabase gen types typescript --linked > src/integrations/supabase/types.ts

# 3. Rebuildar
npm run build
```

### "Testes falhando"

```bash
# 1. Limpar cache de testes
npm run test:clean

# 2. Rodar com verbose
npm run test -- --verbose

# 3. Rodar um teste específico
npm run test -- LeadCard.test.tsx
```

### "Supabase fora de sync"

```bash
# 1. Pull migrations remotas
npx supabase db pull

# 2. Aplicar migrations
npx supabase db push

# 3. Gerar types
npx supabase gen types typescript --linked > src/integrations/supabase/types.ts
```

---

## 📚 Recursos Úteis

### Documentação

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

### Ferramentas

- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Bundle Analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)

### Comunidade

- [GitHub Discussions](https://github.com/seu-usuario/snapdoor/discussions)
- [Discord](https://discord.gg/seu-servidor)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/snapdoor)

---

## ✅ Template de Auditoria Rápida

Copie e cole em issues/PRs:

```markdown
## 🔍 Checklist de Auditoria

- [ ] TypeScript compila sem erros
- [ ] ESLint passa (warnings < 20)
- [ ] Testes passam (cobertura > 70%)
- [ ] Build de produção funciona
- [ ] Sem console.log desnecessários
- [ ] Sem arquivos temporários
- [ ] Documentação atualizada
- [ ] Performance testada (Lighthouse > 90)
- [ ] Sem vulnerabilidades (npm audit)
- [ ] RLS policies validadas

## 📊 Métricas

- Type Coverage: ___%
- Test Coverage: ___%
- ESLint Warnings: ___
- Bundle Size: ___KB
- Lighthouse Score: ___

## 📝 Notas

[Adicione observações aqui]
```

---

**📅 Última Atualização:** 11 de outubro de 2025  
**👨‍💻 Responsável:** Equipe SnapDoor  
**🔄 Próxima Revisão:** 11 de novembro de 2025

---

**💡 Dica:** Adicione este guia aos seus favoritos e revise mensalmente!
