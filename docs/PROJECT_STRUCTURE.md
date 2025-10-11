# 📂 Estrutura do Projeto SnapDoor

> **Visão geral da organização completa do projeto**

## 🌳 Árvore de Diretórios Principal

```
snapdoor/
│
├── 📄 README.md                    → Documentação principal do projeto
├── 📄 package.json                 → Dependências e scripts
├── 📄 vite.config.ts              → Configuração do Vite
├── 📄 tsconfig.json               → Configuração do TypeScript
├── 📄 tailwind.config.ts          → Configuração do Tailwind CSS
├── 📄 components.json             → Configuração do shadcn/ui
│
├── 📁 public/                     → Arquivos públicos estáticos
│   ├── extension/                 → Extensão do navegador (Chrome/Edge)
│   ├── manifest.json              → PWA manifest
│   └── robots.txt
│
├── 📁 src/                        → Código-fonte principal
│   ├── components/                → Componentes React
│   │   ├── ui/                    → Componentes shadcn/ui (40+)
│   │   └── *.tsx                  → Componentes customizados
│   ├── hooks/                     → React Hooks customizados
│   ├── pages/                     → Páginas da aplicação
│   ├── services/                  → Serviços e integrações
│   ├── integrations/              → Integração Supabase
│   ├── lib/                       → Utilitários e helpers
│   ├── types/                     → Definições TypeScript
│   ├── test/                      → Testes automatizados
│   └── data/                      → Dados mock
│
├── 📁 supabase/                   → Backend Supabase
│   ├── migrations/                → Migrações do banco de dados
│   ├── functions/                 → Edge Functions
│   └── config.toml                → Configuração Supabase
│
├── 📁 scripts/                    → Scripts de automação
│   └── *.ts                       → Scripts TypeScript
│
└── 📁 docs/                       → 📚 DOCUMENTAÇÃO COMPLETA
    ├── README.md                  → Índice principal da documentação
    ├── INDEX.md                   → Índice rápido com busca
    │
    ├── 📂 setup/                  → Configuração e instalação
    │   ├── SUPABASE_SETUP_GUIDE.md
    │   ├── DEV_ACCOUNT_SETUP.md
    │   ├── SETUP_SUMMARY.md
    │   └── CLEAR_CACHE_INSTRUCTIONS.md
    │
    ├── 📂 guides/                 → Guias de uso
    │   ├── LEAD_ENRICHMENT_GUIDE.md
    │   ├── USER_ENRICHMENT_GUIDE.md
    │   ├── CREDIT_SYSTEM_GUIDE.md
    │   └── GUIA_DE_TESTE.md
    │
    ├── 📂 architecture/           → Arquitetura técnica
    │   ├── ENRICHMENT_REQUIREMENTS.md
    │   ├── SUPABASE_DOCS_INDEX.md
    │   └── MELHORIAS_IMPLEMENTADAS.md
    │
    ├── 📂 migrations/             → Documentação de migrações
    │   ├── MIGRATION_WALKTHROUGH.md
    │   ├── EXECUTE_MIGRATION_NOW.md
    │   ├── APPLY_MIGRATION_NOW.md
    │   └── QUICK_START_MIGRATION.md
    │
    ├── 📂 testing/                → Testes e validação
    │   ├── VALIDATION_CHECKLIST.md
    │   └── FIX_LOG.md
    │
    ├── 📂 audits/                 → Auditorias e análises
    │   ├── AUDITORIA_COMPLETA_PROJETO.md
    │   ├── AUDITORIA_RESUMO.md
    │   └── AUDITORIA_SUPABASE_COMPLETA.md
    │
    ├── 📂 api/                    → Documentação de APIs
    │   └── (reservado para futuro)
    │
    └── 📄 Status & Relatórios     → Documentos executivos
        ├── EXECUTIVE_SUMMARY.md
        ├── VISUAL_STATUS_BOARD.md
        ├── ROADMAP_TO_10.md
        ├── FINAL_CELEBRATION.md
        ├── MONETIZATION_READY.md
        ├── AUDITORIA_FINAL.md
        ├── SISTEMA_COMPLETO_CELEBRACAO.md
        ├── STATUS_FINAL_10_10.md
        └── STATUS_VISUAL.md
```

## 📊 Estatísticas da Estrutura

### Código-Fonte (`src/`)
- **Componentes:** 40+ componentes React (UI + customizados)
- **Hooks:** 15+ hooks customizados
- **Páginas:** 12+ páginas principais
- **Serviços:** 6+ serviços integrados
- **Testes:** Suite completa com Vitest

### Backend (`supabase/`)
- **Migrações:** 30+ migrations aplicadas
- **Tabelas:** 12+ tabelas principais
- **Functions:** Edge Functions para integrações
- **RLS:** Row Level Security completo

### Documentação (`docs/`)
- **Total:** 28 documentos markdown
- **Categorias:** 7 categorias organizadas
- **Cobertura:** 100% do sistema documentado

## 🎯 Navegação Rápida

### Para Desenvolvedores
```
📁 src/
  ├── components/     → Componentes reutilizáveis
  ├── hooks/          → Lógica de negócio
  ├── pages/          → Rotas da aplicação
  └── services/       → Integrações externas

📁 docs/setup/        → Configuração inicial
📁 docs/guides/       → Como usar features
📁 docs/architecture/ → Decisões técnicas
```

### Para DevOps
```
📁 supabase/
  ├── migrations/     → Versionamento do DB
  ├── functions/      → Serverless functions
  └── config.toml     → Configuração ambiente

📁 docs/migrations/   → Guias de migração
📁 docs/testing/      → Validação e QA
```

### Para Stakeholders
```
📁 docs/
  ├── EXECUTIVE_SUMMARY.md     → Resumo executivo
  ├── VISUAL_STATUS_BOARD.md   → Status visual
  ├── ROADMAP_TO_10.md         → Planejamento
  └── MONETIZATION_READY.md    → Modelo de negócio
```

## 🔍 Convenções de Nomenclatura

### Arquivos TypeScript/React
- **Components:** PascalCase → `LeadCard.tsx`
- **Hooks:** camelCase com prefixo `use` → `useLeads.ts`
- **Services:** camelCase com sufixo `Service` → `leadEnrichmentService.ts`
- **Types:** camelCase → `lead.ts`

### Documentação
- **Guias principais:** MAIÚSCULAS_UNDERSCORE → `SETUP_GUIDE.md`
- **Índices:** TITLE_CASE → `README.md`, `INDEX.md`
- **Status:** DESCRITIVO → `STATUS_FINAL_10_10.md`

### Banco de Dados
- **Tabelas:** snake_case plural → `leads`, `user_credits`
- **Colunas:** snake_case → `first_name`, `created_at`
- **Migrations:** timestamp + descrição → `20251010_add_leads_table.sql`

## 📦 Principais Pacotes

### Frontend
```json
{
  "react": "^18.x",
  "typescript": "^5.x",
  "vite": "^5.x",
  "tailwindcss": "^3.x",
  "@tanstack/react-query": "latest",
  "shadcn/ui": "latest"
}
```

### Backend
```json
{
  "@supabase/supabase-js": "^2.x",
  "stripe": "latest"
}
```

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor dev (port 5173)
npm run build            # Build de produção
npm run preview          # Preview do build

# Testes
npm run test             # Executa testes
npm run test:ui          # UI de testes
npm run test:coverage    # Cobertura de testes

# Qualidade
npm run lint             # Linter ESLint
npm run type-check       # Verificação TypeScript

# Supabase
npm run supabase:start   # Inicia Supabase local
npm run supabase:stop    # Para Supabase local
npm run supabase:reset   # Reset do banco local
```

## 📝 Próximos Passos

1. **Ver documentação completa:** [docs/README.md](./docs/README.md)
2. **Setup inicial:** [docs/setup/SUPABASE_SETUP_GUIDE.md](./docs/setup/SUPABASE_SETUP_GUIDE.md)
3. **Guia de uso:** [docs/guides/LEAD_ENRICHMENT_GUIDE.md](./docs/guides/LEAD_ENRICHMENT_GUIDE.md)
4. **Arquitetura:** [docs/architecture/ENRICHMENT_REQUIREMENTS.md](./docs/architecture/ENRICHMENT_REQUIREMENTS.md)

---

**Última atualização:** 11 de outubro de 2025  
**Versão:** 1.0.0  
**Mantido por:** Equipe SnapDoor
