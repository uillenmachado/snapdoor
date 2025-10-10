# 📚 Documentação SnapDoor CRM

Bem-vindo à documentação oficial do **SnapDoor CRM** - Um sistema completo de gestão de leads com enriquecimento via LinkedIn e Hunter.io.

## 📖 Índice

- [Sistema de Créditos](./CREDIT_SYSTEM_GUIDE.md)
- [Enriquecimento de Leads](./LEAD_ENRICHMENT_GUIDE.md)
- [Guia do Usuário - Enriquecimento](./USER_ENRICHMENT_GUIDE.md)
- [Configuração do Supabase](./SUPABASE_SETUP_GUIDE.md)
- [Melhorias Implementadas](./MELHORIAS_IMPLEMENTADAS.md)

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+
- Conta no Supabase
- Chaves de API: Hunter.io, Stripe (opcional)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/uillenmachado/snapdoor.git
cd snapdoor

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas chaves

# 4. Execute as migrações do Supabase
npx supabase db push

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

## 🏗️ Arquitetura

### Tecnologias Principais

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Edge Functions**: Deno (LinkedIn Scraper)
- **Integrações**: Hunter.io, Stripe
- **Estilização**: TailwindCSS + shadcn/ui

### Estrutura do Projeto

```
snapdoor/
├── src/
│   ├── components/      # Componentes React reutilizáveis
│   ├── pages/           # Páginas da aplicação
│   ├── hooks/           # Custom hooks
│   ├── services/        # Serviços de integração
│   ├── lib/             # Utilitários e helpers
│   └── integrations/    # Configuração Supabase
├── supabase/
│   ├── migrations/      # Migrações SQL
│   └── functions/       # Edge Functions (LinkedIn Scraper)
├── docs/                # Documentação do projeto
└── public/              # Arquivos estáticos
```

## 📊 Funcionalidades Principais

### 1. Gestão de Leads
- ✅ Kanban Board com drag-and-drop
- ✅ Múltiplos pipelines personalizáveis
- ✅ Campos customizados e tags
- ✅ Histórico de atividades

### 2. Enriquecimento de Dados
- ✅ Enriquecimento via Email (Hunter.io)
- ✅ Enriquecimento via LinkedIn Handle (Hunter.io)
- ✅ Scraping de perfis públicos do LinkedIn (Fallback)
- ✅ Extração automática de: cargo, empresa, localização, educação, conexões

### 3. Sistema de Contatos
- ✅ Múltiplos emails por lead
- ✅ Múltiplos telefones por lead
- ✅ Marcação de contato preferencial
- ✅ Verificação de emails (Hunter.io)

### 4. Informações Comerciais
- ✅ Valor do negócio (revenue)
- ✅ Dashboard com métricas reais
- ✅ Relatórios precisos
- ✅ Taxa de conversão

### 5. Sistema de Créditos
- ✅ Controle de uso de API
- ✅ Planos: Essential, Advanced, Professional
- ✅ Integração com Stripe
- ✅ Monitoramento de consumo

## 🔐 Segurança

- ✅ Row Level Security (RLS) em todas as tabelas
- ✅ Autenticação via Supabase Auth
- ✅ Chaves de API criptografadas
- ✅ HTTPS obrigatório

## 🧪 Testes

```bash
# Executar testes
npm test

# Cobertura
npm run test:coverage
```

## 📦 Build para Produção

```bash
# Build otimizado
npm run build

# Preview local
npm run preview
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m '✨ Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/uillenmachado/snapdoor/issues)
- **Documentação**: [docs/](./docs/)
- **Email**: suporte@snapdoor.com

## 🗺️ Roadmap

- [ ] Integração com WhatsApp Business
- [ ] Automações avançadas
- [ ] Relatórios exportáveis (PDF, Excel)
- [ ] Integração com Google Calendar
- [ ] App Mobile (React Native)

---

**SnapDoor CRM** - Transformando leads em clientes com inteligência artificial.
