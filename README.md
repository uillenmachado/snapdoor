# 🚪 SnapDoor CRM

[![CI/CD](https://github.com/uillenmachado/snapdoor/actions/workflows/ci.yml/badge.svg)](https://github.com/uillenmachado/snapdoor/actions/workflows/ci.yml)
[![Deploy](https://img.shields.io/badge/deploy-vercel-black)](https://vercel.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

> **CRM Simples e Inteligente** - Gestão completa de leads, negócios e automações com enriquecimento automático via IA.

---

## ✨ Features

### 🎯 **Core Features**
- ✅ **Gestão de Leads** - Captura, organização e tracking completo
- ✅ **Pipeline de Negócios** - Kanban board com drag & drop
- ✅ **Enriquecimento via IA** - Dados automáticos de LinkedIn, Hunter.io
- ✅ **Automações** - Workflows customizáveis para tarefas repetitivas
- ✅ **Análises & Reports** - Dashboards com métricas em tempo real
- ✅ **Multi-tenant** - Suporte a times e permissões

### 🚀 **Advanced Features**
- ⚡ **Performance Otimizada** - Lazy loading, code splitting, virtual scrolling
- 🎨 **UI Moderna** - shadcn/ui com Tailwind CSS
- 📱 **Responsive** - Mobile-first design
- 🔐 **Autenticação Segura** - Supabase Auth com RLS
- 📊 **Scraper Avançado** - Queue system com retry logic e rate limiting
- 🎭 **Modos Tema** - Light/Dark mode

---

## 🏗️ Tech Stack

### **Frontend**
- **Framework:** React 18 + TypeScript 5.8
- **Build Tool:** Vite 5.4 (SWC compiler)
- **Routing:** React Router v6
- **State:** TanStack Query (React Query)
- **UI:** shadcn/ui + Radix UI + Tailwind CSS
- **Charts:** Recharts
- **Calendar:** React Big Calendar
- **DnD:** @dnd-kit
- **Forms:** React Hook Form + Zod

### **Backend & Database**
- **BaaS:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Runtime:** Deno (Edge Functions)
- **APIs:** Hunter.io, LinkedIn Scraper

### **DevOps & Tools**
- **CI/CD:** GitHub Actions
- **Deploy:** Vercel
- **Tests:** Vitest + Testing Library
- **Linting:** ESLint + Prettier
- **Version Control:** Git + GitHub

---

## 🚀 Quick Start

### **Pré-requisitos**
- Node.js 20+
- npm ou bun
- Conta no Supabase
- (Opcional) Conta no Hunter.io

### **1. Clone e Instale**

```bash
git clone https://github.com/uillenmachado/snapdoor.git
cd snapdoor
npm install
```

### **2. Configure Ambiente**

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_HUNTER_API_KEY=your-hunter-key  # Opcional
```

### **3. Execute Migrações**

```bash
# Se usando Supabase CLI local
npx supabase db push

# Ou aplique via Dashboard do Supabase
# Copie e execute os arquivos de supabase/migrations/
```

### **4. Inicie o Servidor**

```bash
npm run dev
```

Acesse: **http://localhost:8080**

---

## � Scripts Disponíveis

```bash
npm run dev          # Inicia servidor de desenvolvimento (porta 8080)
npm run build        # Build de produção
npm run preview      # Preview do build de produção
npm run lint         # Roda ESLint
npm test             # Executa testes com Vitest
npm run test:ui      # UI de testes (Vitest UI)
npm run test:coverage # Gera relatório de cobertura
```

---

## 📚 Documentação

Toda documentação está na pasta **[`docs/`](./docs/)**:

| Documento | Descrição |
|-----------|-----------|
| [📖 START_HERE.md](./docs/START_HERE.md) | Guia de início rápido |
| [🎯 USER_GUIDE.md](./docs/USER_ENRICHMENT_GUIDE.md) | Manual do usuário |
| [🔧 DEVELOPER_GUIDE.md](./docs/PROJECT_SUMMARY.md) | Guia técnico para devs |
| [🗄️ SUPABASE_SETUP_GUIDE.md](./docs/SUPABASE_SETUP_GUIDE.md) | Setup do Supabase |
| [💳 CREDIT_SYSTEM_GUIDE.md](./docs/CREDIT_SYSTEM_GUIDE.md) | Sistema de créditos |
| [📊 FASE_13_CONCLUIDA.md](./docs/FASE_13_CONCLUIDA.md) | Otimizações de performance |

---

## 🏛️ Arquitetura

```
snapdoor/
├── src/
│   ├── components/     # Componentes React reutilizáveis
│   ├── pages/          # Páginas da aplicação (lazy loaded)
│   ├── hooks/          # Custom React hooks
│   ├── services/       # Serviços e integrações (API clients)
│   ├── lib/            # Utilitários e helpers
│   ├── types/          # TypeScript type definitions
│   └── integrations/   # Supabase client e types
├── supabase/
│   ├── migrations/     # Database migrations (SQL)
│   └── functions/      # Edge Functions (Deno)
├── docs/               # Documentação completa
├── .github/
│   └── workflows/      # CI/CD pipelines
└── dist/               # Build de produção

```

### **Performance Optimizations** (FASE 13)
- ✅ Lazy loading de 11 páginas (React.lazy + Suspense)
- ✅ Code splitting em 7+ vendor chunks (react, charts, supabase, etc)
- ✅ Debouncing de buscas (300ms delay)
- ✅ Virtual scrolling para tabelas grandes
- ✅ Image optimization (lazy loading, WebP, srcset)
- ✅ Component memoization (React.memo)
- ✅ Bundle: ~800KB gzipped (initial load ~70% menor)

---

## 🚀 Deploy

### **Vercel (Recomendado)**

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy automático em push para `master`

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/uillenmachado/snapdoor)

### **Outras Plataformas**

<details>
<summary><b>Netlify</b></summary>

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
</details>

<details>
<summary><b>Docker</b></summary>

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "run", "preview"]
```
</details>

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga estas etapas:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add: amazing feature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### **Padrões de Commit**
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação de código
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Manutenção

---

## 📈 Roadmap

- [ ] **v1.1** - Integrações de email (SendGrid/Resend)
- [ ] **v1.2** - Mobile app (React Native)
- [ ] **v1.3** - Webhooks & API pública
- [ ] **v1.4** - AI Assistant (ChatGPT integration)
- [ ] **v1.5** - Advanced reporting (PDF/Excel export)
- [ ] **v2.0** - White-label support

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

---

## 👤 Autor

**Uillen Machado**
- GitHub: [@uillenmachado](https://github.com/uillenmachado)
- LinkedIn: [Uillen Machado](https://linkedin.com/in/uillenmachado)

---

## 🙏 Agradecimentos

- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI incríveis
- [Supabase](https://supabase.com/) - Backend as a Service
- [Vercel](https://vercel.com/) - Hospedagem e deploy
- [Vite](https://vitejs.dev/) - Build tool super rápido

---

<div align="center">

**⭐ Se este projeto foi útil, deixe uma estrela!**

Made with ❤️ by Uillen Machado

</div>
