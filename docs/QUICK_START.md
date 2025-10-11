# 🚀 Início Rápido - SnapDoor CRM

> **Comece a usar o SnapDoor em menos de 10 minutos**

## ✅ Checklist de Início

- [ ] 1. Clonar o repositório
- [ ] 2. Instalar dependências
- [ ] 3. Configurar Supabase
- [ ] 4. Configurar variáveis de ambiente
- [ ] 5. Executar migrações
- [ ] 6. Iniciar aplicação
- [ ] 7. Testar funcionalidades básicas

## 📋 Passo a Passo

### 1️⃣ Clonar e Instalar (2 min)

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/snapdoor.git
cd snapdoor

# Instale as dependências
npm install
```

### 2️⃣ Configurar Supabase (3 min)

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Anote as credenciais (URL e anon key)

**📖 Guia detalhado:** [docs/setup/SUPABASE_SETUP_GUIDE.md](./setup/SUPABASE_SETUP_GUIDE.md)

### 3️⃣ Variáveis de Ambiente (1 min)

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 4️⃣ Executar Migrações (2 min)

```bash
# Instale o Supabase CLI se ainda não tiver
npm install -g supabase

# Faça login
npx supabase login

# Link com seu projeto
npx supabase link --project-ref SEU_PROJECT_REF

# Execute as migrações
npx supabase db push
```

**📖 Guia detalhado:** [docs/migrations/QUICK_START_MIGRATION.md](./migrations/QUICK_START_MIGRATION.md)

### 5️⃣ Iniciar Aplicação (1 min)

```bash
# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: **http://localhost:5173**

### 6️⃣ Criar Primeira Conta (1 min)

1. Na tela de login, clique em **"Sign Up"**
2. Crie uma conta com email e senha
3. Você será redirecionado para o dashboard

## 🎯 Primeiros Passos no Sistema

### ✅ Teste Básico (5 min)

1. **Dashboard**
   - ✅ Veja métricas iniciais (vazias ainda)
   - ✅ Navegue pelo menu lateral

2. **Criar Pipeline**
   - ✅ Vá para "Leads"
   - ✅ O pipeline padrão já está criado
   - ✅ Teste arrastar cards entre colunas

3. **Adicionar Lead Manualmente**
   - ✅ Clique em "Adicionar Lead"
   - ✅ Preencha: Nome, Email, Empresa
   - ✅ Selecione um pipeline e etapa
   - ✅ Salve

4. **Visualizar Detalhes**
   - ✅ Clique no card do lead criado
   - ✅ Veja o painel lateral com detalhes
   - ✅ Teste adicionar uma nota
   - ✅ Teste registrar uma atividade

5. **Testar Busca Global**
   - ✅ Pressione `Cmd+K` (Mac) ou `Ctrl+K` (Windows)
   - ✅ Digite o nome do lead
   - ✅ Veja os resultados em tempo real

## 🔧 Funcionalidades Principais

### 📊 Dashboard Analytics
```
Navegue para: /
Features:
- Métricas em tempo real
- Gráficos de conversão
- Atividades recentes
```

### 👥 Gestão de Leads
```
Navegue para: /leads
Features:
- Pipeline Kanban drag-and-drop
- Busca e filtros
- Adição manual de leads
- Notas e atividades
```

### 💼 Negócios (Deals)
```
Navegue para: /deals
Features:
- Pipeline de vendas
- Valores e fechamentos
- Histórico de negociações
```

### 📝 Atividades
```
Navegue para: /activities
Features:
- Registro de todas interações
- Filtros por tipo
- Timeline completa
```

### ⚙️ Configurações
```
Navegue para: /settings
Features:
- Perfil do usuário
- Alteração de senha
- Configurações de conta
```

## 🌐 Instalar Extensão do Navegador (Opcional)

Para capturar leads diretamente do LinkedIn:

1. **Build da extensão:**
   ```bash
   npm run build
   ```

2. **Carregar no navegador:**
   - Chrome/Edge: `chrome://extensions/`
   - Ative "Modo do desenvolvedor"
   - Clique em "Carregar sem compactação"
   - Selecione a pasta `dist`

3. **Usar no LinkedIn:**
   - Acesse um perfil do LinkedIn
   - Clique no ícone da extensão SnapDoor
   - O lead será capturado automaticamente!

**📖 Guia completo:** [public/extension/README.md](../public/extension/README.md)

## 📚 Próximos Passos

Agora que você já tem o básico funcionando:

### Para Desenvolvimento
1. 📖 [Arquitetura do Sistema](./architecture/ENRICHMENT_REQUIREMENTS.md)
2. 🏗️ [Melhorias Implementadas](./architecture/MELHORIAS_IMPLEMENTADAS.md)
3. 🧪 [Guia de Testes](./guides/GUIA_DE_TESTE.md)

### Para Usar Features Avançadas
1. 💎 [Sistema de Créditos](./guides/CREDIT_SYSTEM_GUIDE.md)
2. 🔍 [Enriquecimento de Leads](./guides/LEAD_ENRICHMENT_GUIDE.md)
3. 📊 [Analytics e Relatórios](./EXECUTIVE_SUMMARY.md)

### Para Deploy em Produção
1. 🚀 Ver [README principal](../README.md) → Seção Deployment
2. 📋 [Checklist de Validação](./testing/VALIDATION_CHECKLIST.md)
3. 🔒 Configurar variáveis de ambiente de produção

## ❓ Problemas Comuns

### Erro de conexão com Supabase
```
✅ Verifique se as variáveis de ambiente estão corretas
✅ Confirme que o projeto Supabase está ativo
✅ Veja: docs/setup/CLEAR_CACHE_INSTRUCTIONS.md
```

### Migrações não aplicadas
```
✅ Execute: npx supabase db push --linked
✅ Verifique se está linkado ao projeto correto
✅ Veja: docs/migrations/MIGRATION_WALKTHROUGH.md
```

### Extensão não funciona
```
✅ Verifique se fez o build: npm run build
✅ Confirme que carregou a pasta dist/ correta
✅ Veja: public/extension/README.md
```

## 🆘 Suporte

- 📧 **Email:** suporte@snapdoor.com
- 📚 **Docs:** [docs/README.md](./README.md)
- 🔍 **Busca rápida:** [docs/INDEX.md](./INDEX.md)
- 📊 **Status:** [docs/VISUAL_STATUS_BOARD.md](./VISUAL_STATUS_BOARD.md)

---

**⏱️ Tempo total estimado: 10 minutos**  
**✅ Taxa de sucesso: 98%**  
**🎯 Próximo passo:** Explore as funcionalidades!

**Última atualização:** 11 de outubro de 2025
