# 👋 Bem-vindo ao SnapDoor CRM!

> **Você está no lugar certo! Este é o ponto de partida único para entender e trabalhar com o projeto.**

## 🎯 O que é o SnapDoor?

**SnapDoor** é um CRM completo e moderno para gestão de leads do LinkedIn, com:
- 📊 Pipeline Kanban visual e interativo
- 🔍 Enriquecimento automático de dados
- 🌐 Extensão de navegador para captura
- 💼 Sistema completo de negócios (deals)
- 📈 Analytics e relatórios em tempo real

## 🚀 Eu sou novo aqui, por onde começo?

### Para Desenvolvedores (Setup Técnico)

#### ⏱️ Tenho 10 minutos?
**📖 Leia:** [QUICK_START.md](./QUICK_START.md)
- Setup completo passo a passo
- Configuração do ambiente
- Primeiro teste

#### ⏱️ Tenho 30 minutos?
**Faça nesta ordem:**
1. 📖 [QUICK_START.md](./QUICK_START.md) - Setup inicial
2. 📂 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Estrutura do código
3. 🏗️ [architecture/ENRICHMENT_REQUIREMENTS.md](./architecture/ENRICHMENT_REQUIREMENTS.md) - Arquitetura
4. 🧪 [guides/GUIA_DE_TESTE.md](./guides/GUIA_DE_TESTE.md) - Testar funcionalidades

#### ⏱️ Tenho 2 horas?
**Estudo completo:**
1. ✅ Tudo acima +
2. 📊 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Visão geral completa
3. 🔄 [migrations/MIGRATION_WALKTHROUGH.md](./migrations/MIGRATION_WALKTHROUGH.md) - Banco de dados
4. 🏛️ [architecture/MELHORIAS_IMPLEMENTADAS.md](./architecture/MELHORIAS_IMPLEMENTADAS.md) - Features
5. 🔍 [INDEX.md](./INDEX.md) - Navegar pela documentação

### Para Stakeholders (Visão Executiva)

#### ⏱️ Tenho 5 minutos?
**📖 Leia:** [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)
- Métricas e status
- Features principais
- Modelo de negócio

#### ⏱️ Tenho 15 minutos?
**Faça nesta ordem:**
1. 📊 [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - Overview
2. 📈 [EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md) - Resumo executivo
3. 📋 [VISUAL_STATUS_BOARD.md](./VISUAL_STATUS_BOARD.md) - Status visual
4. 🗺️ [ROADMAP_TO_10.md](./ROADMAP_TO_10.md) - Planejamento

## 🎯 Navegação Rápida por Perfil

### 👨‍💻 Sou Desenvolvedor Frontend

```
📚 Leia nesta ordem:
1. docs/QUICK_START.md                    → Setup ambiente
2. docs/PROJECT_STRUCTURE.md              → Entender o código
3. src/components/                        → Componentes React
4. src/hooks/                             → Hooks customizados
5. src/pages/                             → Páginas/Rotas
```

**Dica:** Comece criando um novo componente em `src/components/` para entender o padrão!

### 👨‍💻 Sou Desenvolvedor Backend

```
📚 Leia nesta ordem:
1. docs/setup/SUPABASE_SETUP_GUIDE.md     → Configurar Supabase
2. docs/migrations/MIGRATION_WALKTHROUGH.md → Entender migrations
3. supabase/migrations/                   → Ver schema atual
4. src/integrations/supabase/             → Client integration
5. docs/audits/AUDITORIA_SUPABASE_COMPLETA.md → Auditoria DB
```

**Dica:** Execute `npx supabase db diff` para ver mudanças no schema!

### 🎨 Sou Designer/UX

```
📚 Leia nesta ordem:
1. docs/PROJECT_SUMMARY.md                → Entender o produto
2. src/components/ui/                     → Componentes shadcn/ui
3. tailwind.config.ts                     → Design system
4. src/pages/                             → Telas do sistema
```

**Dica:** A UI usa shadcn/ui + Tailwind. Todos componentes são customizáveis!

### 🧪 Sou QA/Tester

```
📚 Leia nesta ordem:
1. docs/guides/GUIA_DE_TESTE.md           → Guia de testes
2. docs/testing/VALIDATION_CHECKLIST.md   → Checklist validação
3. src/test/                              → Testes automatizados
4. docs/testing/FIX_LOG.md                → Log de bugs
```

**Dica:** Execute `npm run test` para rodar os testes automatizados!

### 🚀 Sou DevOps/SRE

```
📚 Leia nesta ordem:
1. docs/setup/SETUP_SUMMARY.md            → Configurações
2. supabase/config.toml                   → Config Supabase
3. docs/migrations/                       → Gerenciar migrations
4. vite.config.ts                         → Build config
```

**Dica:** Use `npm run build` e valide com `npm run preview` antes de deploy!

### 📊 Sou Product Manager

```
📚 Leia nesta ordem:
1. docs/PROJECT_SUMMARY.md                → Overview completo
2. docs/EXECUTIVE_SUMMARY.md              → Resumo executivo
3. docs/ROADMAP_TO_10.md                  → Planejamento
4. docs/guides/CREDIT_SYSTEM_GUIDE.md     → Monetização
```

**Dica:** O roadmap está em `docs/ROADMAP_TO_10.md` com features priorizadas!

## 📚 Documentação Completa

### Estrutura dos `docs/`

```
docs/
├── 📄 START_HERE.md              ← VOCÊ ESTÁ AQUI! 🎯
├── 📄 README.md                  → Índice principal da documentação
├── 📄 INDEX.md                   → Índice rápido com busca
├── 📄 QUICK_START.md             → Comece em 10 minutos
├── 📄 PROJECT_STRUCTURE.md       → Estrutura completa do projeto
├── 📄 PROJECT_SUMMARY.md         → Visão geral executiva
│
├── 📂 setup/                     → Configuração e instalação (4 docs)
├── 📂 guides/                    → Guias de uso (4 docs)
├── 📂 architecture/              → Arquitetura técnica (3 docs)
├── 📂 migrations/                → Banco de dados (4 docs)
├── 📂 testing/                   → Testes e QA (2 docs)
├── 📂 audits/                    → Auditorias (3 docs)
└── 📈 Status Reports             → Relatórios executivos (8 docs)
```

**📖 Ver índice completo:** [INDEX.md](./INDEX.md)

## ❓ Perguntas Frequentes

### Como faço para...

#### ...rodar o projeto localmente?
📖 [QUICK_START.md](./QUICK_START.md) → Seção "Passo a Passo"

#### ...entender a estrutura do código?
📖 [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

#### ...aplicar uma migration no banco?
📖 [migrations/APPLY_MIGRATION_NOW.md](./migrations/APPLY_MIGRATION_NOW.md)

#### ...testar uma funcionalidade?
📖 [guides/GUIA_DE_TESTE.md](./guides/GUIA_DE_TESTE.md)

#### ...adicionar uma nova feature?
1. Estude a arquitetura: [architecture/](./architecture/)
2. Veja features existentes: [architecture/MELHORIAS_IMPLEMENTADAS.md](./architecture/MELHORIAS_IMPLEMENTADAS.md)
3. Crie branch: `git checkout -b feature/nome-da-feature`
4. Desenvolva seguindo os padrões do código
5. Teste: `npm run test`
6. PR com descrição detalhada

#### ...resolver um problema?
1. Cache: [setup/CLEAR_CACHE_INSTRUCTIONS.md](./setup/CLEAR_CACHE_INSTRUCTIONS.md)
2. Migrations: [migrations/MIGRATION_WALKTHROUGH.md](./migrations/MIGRATION_WALKTHROUGH.md)
3. Bugs conhecidos: [testing/FIX_LOG.md](./testing/FIX_LOG.md)

## 🛠️ Comandos Essenciais

```bash
# Desenvolvimento
npm run dev              # Iniciar servidor (localhost:5173)
npm run build            # Build de produção
npm run preview          # Preview do build

# Testes
npm run test             # Rodar testes
npm run test:ui          # UI de testes (browser)

# Qualidade
npm run lint             # Lint do código
npm run type-check       # Verificar tipos TypeScript

# Supabase (requer Supabase CLI)
npx supabase start       # Supabase local
npx supabase db push     # Aplicar migrations
npx supabase db diff     # Ver diferenças no schema
npx supabase gen types typescript --local > src/integrations/supabase/types.ts
```

## 🎯 Próximos Passos Recomendados

1. ✅ **Agora:** Leia [QUICK_START.md](./QUICK_START.md) e rode o projeto
2. ✅ **Hoje:** Explore [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
3. ✅ **Esta semana:** Leia toda documentação em [INDEX.md](./INDEX.md)
4. ✅ **Próxima semana:** Contribua com uma feature ou correção!

## 💡 Dicas Importantes

- 🔍 Use `Ctrl+F` para buscar neste documento
- 📑 Favorita [INDEX.md](./INDEX.md) para busca rápida
- 🎯 Sempre comece pelo [QUICK_START.md](./QUICK_START.md)
- 📖 Documentação está sempre atualizada
- 🤝 Dúvidas? Abra uma issue no GitHub

## 🎉 Você está pronto!

**Parabéns por chegar até aqui!** 🚀

Agora você sabe exatamente por onde começar. Escolha seu perfil acima e siga o caminho recomendado.

### 🎯 Recomendação Final

**Para TODOS os perfis:**
1. 📖 Leia [QUICK_START.md](./QUICK_START.md) primeiro
2. 📂 Depois vá para [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
3. 🔍 Use [INDEX.md](./INDEX.md) como referência constante

---

**Bem-vindo ao time! 🙌**

**📧 Dúvidas?** uillenmachado@gmail.com  
**📚 Documentação completa:** [docs/README.md](./README.md)  
**🔍 Busca rápida:** [docs/INDEX.md](./INDEX.md)  

**Última atualização:** 11 de outubro de 2025  
**Versão:** 1.0.0
