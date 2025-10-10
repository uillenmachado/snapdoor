# 🚪 SnapDoor CRM

**CRM Simples e Inteligente - Inspirado no Pipedrive**

![Status](https://img.shields.io/badge/status-production--ready-green)
![Version](https://img.shields.io/badge/version-2.1.0-blue)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)

Sistema completo de gestão de **negócios e leads** com enriquecimento automático via LinkedIn e Hunter.io. Simples, poderoso e focado em resultados.

---

## 🚀 Quick Start

```bash
# 1. Clone o repositório
git clone https://github.com/uillenmachado/snapdoor.git
cd snapdoor

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas chaves (Supabase, Hunter.io)

# 4. Execute as migrações do banco
npx supabase db push

# 5. Inicie o servidor
npm run dev
```

Acesse: `http://localhost:8080`

---

## ✨ Principais Funcionalidades

- 💼 **Pipeline de Negócios** - Kanban visual para gerenciar oportunidades
- 👥 **Gestão de Leads** - Database completa de pessoas/contatos
- 🤖 **Enriquecimento Automático** - LinkedIn + Hunter.io (3 camadas)
- 📊 **Analytics em Tempo Real** - Métricas e relatórios precisos
- 💰 **Sistema de Créditos** - Controle de uso de API
- 🔐 **100% Seguro** - Row Level Security (RLS) em todas as tabelas

---

## 📚 Documentação Completa

Toda a documentação está em [`docs/`](./docs/):

- **[Documentação Completa](./docs/README.md)** - Overview detalhado
- **[Leads vs Negócios](./docs/LEADS_VS_NEGOCIOS.md)** - Nova estrutura explicada
- **[Sistema de Créditos](./docs/CREDIT_SYSTEM_GUIDE.md)** - Como funciona
- **[Enriquecimento](./docs/LEAD_ENRICHMENT_GUIDE.md)** - Guia técnico
- **[Setup Supabase](./docs/SUPABASE_SETUP_GUIDE.md)** - Backend completo
- **[Melhorias](./docs/MELHORIAS_IMPLEMENTADAS.md)** - Histórico

---

## 🏗️ Stack Tecnológica

| Categoria | Tecnologia |
|-----------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **UI** | TailwindCSS, shadcn/ui, Recharts |
| **Backend** | Supabase (PostgreSQL + Auth + Storage) |
| **Edge Functions** | Deno (LinkedIn Scraper) |
| **Integrações** | Hunter.io, Stripe |
| **Estado** | @tanstack/react-query |
| **Testes** | Vitest + React Testing Library |

---

## 📋 Requisitos

- **Node.js** 18+
- **Conta Supabase** (grátis em supabase.com)
- **Hunter.io API Key** (opcional - para enriquecimento)

---

## 🧪 Desenvolvimento

```bash
npm run dev          # Servidor de desenvolvimento
npm test             # Executar testes
npm run build        # Build para produção
npm run preview      # Preview do build
```

---

## 📝 Licença

MIT License - veja [LICENSE](./LICENSE) para detalhes.

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Veja [CONTRIBUTING.md](./CONTRIBUTING.md) para detalhes.

---

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/uillenmachado/snapdoor/issues)
- **Documentação**: [docs/](./docs/)
- **Email**: uillenmachado@gmail.com

---

**SnapDoor CRM** - Transformando leads em clientes com simplicidade e inteligência.
