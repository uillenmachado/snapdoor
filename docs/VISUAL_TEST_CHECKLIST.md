# ✅ Checklist de Teste Visual - SnapDoor CRM

> Execute todos os testes abaixo para garantir pleno funcionamento do sistema

**Data**: 14 de Janeiro de 2025  
**Servidor**: http://localhost:8080  
**Status**: 🟢 Em Teste

---

## 🔐 1. Autenticação

### 1.1 Página de Login
- [ ] **Acessar** http://localhost:8080/login
- [ ] **Verificar**:
  - [ ] Logo SnapDoor aparece
  - [ ] Campos: Email e Senha
  - [ ] Botão "Entrar"
  - [ ] Link "Não tem conta? Cadastre-se"
  - [ ] Layout responsivo (redimensionar janela)
- [ ] **Testar validação**:
  - [ ] Clicar "Entrar" sem preencher → Mensagens de erro
  - [ ] Email inválido → Erro de validação
  - [ ] Senha curta → Erro de validação

### 1.2 Página de Cadastro
- [ ] **Acessar** http://localhost:8080/signup
- [ ] **Verificar**:
  - [ ] Campos: Nome, Email, Senha, Confirmar Senha
  - [ ] Botão "Criar Conta"
  - [ ] Link "Já tem conta? Faça login"
- [ ] **Testar validação**:
  - [ ] Senhas diferentes → Erro
  - [ ] Email já existe → Erro

### 1.3 Login com Conta de Teste
- [ ] **Email**: `admin@snapdoor.com`
- [ ] **Senha**: `SnapDoor2025!Admin`
- [ ] **Verificar**:
  - [ ] Login bem-sucedido
  - [ ] Redirecionamento para Dashboard
  - [ ] Avatar/nome do usuário no header

---

## 📊 2. Dashboard

### 2.1 Layout Geral
- [ ] **Verificar**:
  - [ ] Sidebar esquerda aparece
  - [ ] Header superior com busca global
  - [ ] Métricas principais (cards):
    - [ ] Total de Leads
    - [ ] Negócios Ativos
    - [ ] Taxa de Conversão
    - [ ] Receita Total
  - [ ] Gráficos carregam:
    - [ ] Funil de Conversão
    - [ ] Performance Mensal
    - [ ] Leads por Fonte

### 2.2 Interações
- [ ] **Busca Global**:
  - [ ] Digitar "test" → Resultados aparecem
  - [ ] Clicar em resultado → Navega para página
- [ ] **Notificações**:
  - [ ] Clicar sino → Dropdown abre
  - [ ] Ver notificações (se houver)
- [ ] **Sidebar**:
  - [ ] Clicar em cada menu → Navega corretamente
  - [ ] Collapse/expand funciona

---

## 👥 3. Gestão de Leads

### 3.1 Lista de Leads
- [ ] **Acessar** Menu > **Leads**
- [ ] **Verificar**:
  - [ ] Lista de leads carrega
  - [ ] Botão "+ Novo Lead" aparece
  - [ ] Filtros funcionam:
    - [ ] Status (Novo, Qualificado, etc)
    - [ ] Temperatura (Quente, Morno, Frio)
    - [ ] Fonte (LinkedIn, Site, etc)
  - [ ] Busca por nome/email funciona
  - [ ] Paginação (se muitos leads)

### 3.2 Criar Novo Lead
- [ ] **Clicar** "+ Novo Lead"
- [ ] **Preencher**:
  - [ ] Nome: "João Silva Teste"
  - [ ] Email: "joao.teste@example.com"
  - [ ] Telefone: "(11) 98765-4321"
  - [ ] Empresa: "Empresa Teste Ltda"
  - [ ] Cargo: "CEO"
  - [ ] Fonte: "LinkedIn"
- [ ] **Clicar** "Salvar"
- [ ] **Verificar**:
  - [ ] Toast de sucesso aparece
  - [ ] Lead aparece na lista
  - [ ] Dados estão corretos

### 3.3 Visualizar Detalhes do Lead
- [ ] **Clicar** no lead criado
- [ ] **Verificar painel lateral**:
  - [ ] Informações básicas corretas
  - [ ] Abas disponíveis:
    - [ ] Informações
    - [ ] Atividades
    - [ ] Notas
    - [ ] Histórico
  - [ ] Botão "🔍 Enriquecer" aparece
  - [ ] Botão "Editar" funciona

### 3.4 Editar Lead
- [ ] **Clicar** "Editar"
- [ ] **Modificar** algum campo (ex: telefone)
- [ ] **Salvar**
- [ ] **Verificar**:
  - [ ] Alteração salva
  - [ ] Toast de sucesso

### 3.5 Enriquecer Lead (se tiver créditos)
- [ ] **Clicar** "🔍 Enriquecer"
- [ ] **Verificar**:
  - [ ] Modal de confirmação aparece
  - [ ] Mostra custo (1 crédito)
  - [ ] Saldo de créditos exibido
- [ ] **Se tiver créditos**:
  - [ ] Confirmar enriquecimento
  - [ ] Loading aparece (15-30s)
  - [ ] Dados atualizados:
    - [ ] LinkedIn URL
    - [ ] Cargo verificado
    - [ ] Empresa confirmada

### 3.6 Ações em Massa
- [ ] **Selecionar** múltiplos leads (checkbox)
- [ ] **Verificar menu de ações**:
  - [ ] Alterar status
  - [ ] Adicionar tag
  - [ ] Exportar CSV
  - [ ] Arquivar
- [ ] **Testar** uma ação (ex: alterar status)

---

## 🎯 4. Pipeline de Negócios

### 4.1 Visualização Kanban
- [ ] **Acessar** Menu > **Negócios**
- [ ] **Verificar**:
  - [ ] Colunas do pipeline aparecem:
    - [ ] Novo
    - [ ] Qualificação
    - [ ] Proposta
    - [ ] Negociação
    - [ ] Fechado
  - [ ] Cards de negócios em cada coluna
  - [ ] Botão "+ Novo Negócio"

### 4.2 Criar Negócio
- [ ] **Clicar** "+ Novo Negócio"
- [ ] **Preencher**:
  - [ ] Título: "Venda Software - Teste"
  - [ ] Valor: R$ 5.000
  - [ ] Lead: Selecionar o lead criado anteriormente
  - [ ] Data prevista: Próximo mês
  - [ ] Probabilidade: 70%
- [ ] **Salvar**
- [ ] **Verificar**:
  - [ ] Card aparece na coluna "Novo"
  - [ ] Informações corretas no card

### 4.3 Mover Negócio (Drag & Drop)
- [ ] **Arrastar** card do negócio
- [ ] **Soltar** na coluna "Qualificação"
- [ ] **Verificar**:
  - [ ] Card moveu de coluna
  - [ ] Status atualizado
  - [ ] Animação suave

### 4.4 Detalhes do Negócio
- [ ] **Clicar** no card do negócio
- [ ] **Verificar página de detalhes**:
  - [ ] Informações do negócio
  - [ ] Lead associado
  - [ ] Atividades relacionadas
  - [ ] Timeline
  - [ ] Botão "Fechar Negócio"

### 4.5 Fechar Negócio
- [ ] **Clicar** "Fechar Negócio"
- [ ] **Selecionar** "Ganho" ✅
- [ ] **Preencher** valor final (se diferente)
- [ ] **Salvar**
- [ ] **Verificar**:
  - [ ] Card move para "Fechado - Ganho"
  - [ ] Badge verde "Ganho"
  - [ ] Métricas do dashboard atualizam

---

## 📅 5. Atividades & Tarefas

### 5.1 Lista de Atividades
- [ ] **Acessar** Menu > **Atividades**
- [ ] **Verificar**:
  - [ ] Lista de atividades carrega
  - [ ] Abas funcionam:
    - [ ] Hoje
    - [ ] Atrasadas
    - [ ] Próximas
    - [ ] Concluídas
  - [ ] Botão "+ Nova Atividade"

### 5.2 Criar Atividade
- [ ] **Clicar** "+ Nova Atividade"
- [ ] **Selecionar tipo**: Reunião
- [ ] **Preencher**:
  - [ ] Título: "Demo SnapDoor - Teste"
  - [ ] Data: Amanhã 14:00
  - [ ] Duração: 1 hora
  - [ ] Lead: Selecionar lead teste
  - [ ] Descrição: "Demonstração do produto"
- [ ] **Marcar** "Criar lembrete"
- [ ] **Salvar**
- [ ] **Verificar**:
  - [ ] Atividade aparece na lista
  - [ ] Lembrete agendado

### 5.3 Visualização Calendário
- [ ] **Clicar** em "Visualização: Calendário"
- [ ] **Verificar**:
  - [ ] Calendário carrega
  - [ ] Atividade criada aparece
  - [ ] Navegar entre meses funciona
  - [ ] Clicar na atividade abre detalhes

### 5.4 Marcar como Concluída
- [ ] **Na lista**, clicar checkbox da atividade
- [ ] **Adicionar resultado**: "Reunião realizada com sucesso"
- [ ] **Salvar**
- [ ] **Verificar**:
  - [ ] Atividade marcada como concluída
  - [ ] Move para aba "Concluídas"
  - [ ] Histórico atualizado no lead

---

## ⚙️ 6. Automações

### 6.1 Lista de Automações
- [ ] **Acessar** Menu > **Configurações** > **Automações**
- [ ] **Verificar**:
  - [ ] Lista de automações (se houver)
  - [ ] Botão "+ Nova Automação"
  - [ ] Toggle ativar/desativar funciona

### 6.2 Criar Automação Simples
- [ ] **Clicar** "+ Nova Automação"
- [ ] **Preencher**:
  - [ ] Nome: "Follow-up automático - Teste"
  - [ ] Gatilho: "Lead criado"
  - [ ] Condição: "Email presente"
  - [ ] Ação: "Criar tarefa"
  - [ ] Configurar tarefa:
    - [ ] Título: "Enviar email de boas-vindas"
    - [ ] Prazo: 1 dia depois
- [ ] **Ativar** automação
- [ ] **Salvar**
- [ ] **Verificar**:
  - [ ] Automação aparece na lista
  - [ ] Status: Ativa

### 6.3 Testar Automação
- [ ] **Criar novo lead** (para disparar gatilho)
- [ ] **Aguardar** alguns segundos
- [ ] **Verificar**:
  - [ ] Tarefa foi criada automaticamente
  - [ ] Histórico de execução registrado

---

## 📊 7. Relatórios & Analytics

### 7.1 Dashboard de Relatórios
- [ ] **Acessar** Menu > **Relatórios**
- [ ] **Verificar**:
  - [ ] Seletor de período funciona
  - [ ] Gráficos carregam:
    - [ ] Funil de Conversão
    - [ ] Performance por Período
    - [ ] Fontes de Leads
    - [ ] Distribuição de Temperatura
    - [ ] Atividades por Tipo

### 7.2 Filtros de Período
- [ ] **Selecionar** "Esta semana"
- [ ] **Verificar**: Gráficos atualizam
- [ ] **Selecionar** "Este mês"
- [ ] **Verificar**: Gráficos atualizam
- [ ] **Selecionar** "Personalizado"
- [ ] **Escolher** intervalo de datas
- [ ] **Verificar**: Gráficos atualizam

### 7.3 Exportar Relatório
- [ ] **Clicar** "Exportar"
- [ ] **Selecionar formato**: PDF
- [ ] **Verificar**:
  - [ ] Download inicia
  - [ ] PDF gerado corretamente
  - [ ] Gráficos aparecem no PDF

---

## 🔧 8. Configurações

### 8.1 Perfil do Usuário
- [ ] **Acessar** Avatar > **Configurações** > **Perfil**
- [ ] **Verificar campos**:
  - [ ] Nome completo
  - [ ] Email
  - [ ] Telefone
  - [ ] Upload de foto de perfil
  - [ ] Fuso horário
- [ ] **Editar** nome
- [ ] **Salvar**
- [ ] **Verificar**: Alteração aplicada

### 8.2 Alterar Senha
- [ ] **Acessar** aba **Senha**
- [ ] **Preencher**:
  - [ ] Senha atual
  - [ ] Nova senha
  - [ ] Confirmar nova senha
- [ ] **Salvar**
- [ ] **Verificar**: Toast de sucesso

### 8.3 Notificações
- [ ] **Acessar** aba **Notificações**
- [ ] **Verificar toggles**:
  - [ ] Email de novos leads
  - [ ] Email de novos negócios
  - [ ] Lembretes de atividades
  - [ ] Relatórios semanais
- [ ] **Alternar** algumas opções
- [ ] **Salvar**
- [ ] **Verificar**: Preferências salvas

### 8.4 Integrações
- [ ] **Acessar** aba **Integrações**
- [ ] **Verificar**:
  - [ ] Hunter.io status (conectado/desconectado)
  - [ ] LinkedIn Scraper status
  - [ ] Stripe status
  - [ ] Botão "Conectar" para cada integração

### 8.5 Tema (Light/Dark)
- [ ] **Acessar** aba **Aparência**
- [ ] **Selecionar** "Modo Escuro"
- [ ] **Verificar**: Interface muda para dark mode
- [ ] **Selecionar** "Modo Claro"
- [ ] **Verificar**: Interface volta para light mode
- [ ] **Selecionar** "Sistema"
- [ ] **Verificar**: Segue preferência do SO

---

## 💳 9. Sistema de Créditos (se configurado)

### 9.1 Visualizar Saldo
- [ ] **Clicar** ícone de créditos (header)
- [ ] **Verificar**:
  - [ ] Saldo atual exibido
  - [ ] Histórico de uso
  - [ ] Botão "Comprar Créditos"

### 9.2 Comprar Créditos (se Stripe configurado)
- [ ] **Clicar** "Comprar Créditos"
- [ ] **Selecionar** pacote (ex: 50 créditos)
- [ ] **Verificar**:
  - [ ] Redirecionamento para Stripe Checkout
  - [ ] Valores corretos
- [ ] **Não completar** compra (ambiente de teste)

---

## 🎨 10. Responsividade & Performance

### 10.1 Mobile (< 768px)
- [ ] **Redimensionar** janela para 375px largura
- [ ] **Verificar**:
  - [ ] Sidebar colapsa em hamburger menu
  - [ ] Cards empilham verticalmente
  - [ ] Tabelas têm scroll horizontal
  - [ ] Botões são clicáveis
  - [ ] Formulários usáveis

### 10.2 Tablet (768px - 1024px)
- [ ] **Redimensionar** janela para 768px largura
- [ ] **Verificar**:
  - [ ] Layout ajusta adequadamente
  - [ ] Gráficos redimensionam
  - [ ] Navegação funcional

### 10.3 Desktop (> 1024px)
- [ ] **Maximizar** janela
- [ ] **Verificar**:
  - [ ] Layout aproveita espaço
  - [ ] Gráficos legíveis
  - [ ] Sem elementos cortados

### 10.4 Performance
- [ ] **Abrir** DevTools (F12) > **Lighthouse**
- [ ] **Executar** audit
- [ ] **Verificar scores**:
  - [ ] Performance > 80
  - [ ] Accessibility > 90
  - [ ] Best Practices > 90
  - [ ] SEO > 80

---

## 🐛 11. Tratamento de Erros

### 11.1 Sem Conexão
- [ ] **Desconectar** internet
- [ ] **Tentar** criar lead
- [ ] **Verificar**:
  - [ ] Mensagem de erro clara
  - [ ] Toast vermelho
  - [ ] Não quebra a aplicação

### 11.2 Erro de API
- [ ] **Tentar** enriquecer lead sem créditos
- [ ] **Verificar**:
  - [ ] Modal de "Créditos insuficientes"
  - [ ] Opção de comprar créditos
  - [ ] Mensagem clara

### 11.3 Validação de Formulários
- [ ] **Tentar** criar lead sem nome
- [ ] **Verificar**: Erro de validação
- [ ] **Tentar** criar lead com email inválido
- [ ] **Verificar**: Erro de validação

---

## 🔍 12. Sentry (Monitoramento)

### 12.1 Console do Browser
- [ ] **Abrir** DevTools (F12) > **Console**
- [ ] **Verificar**:
  - [ ] Mensagem `[Sentry] Inicializado em ambiente: development`
  - [ ] Ou `[Sentry] DSN não configurado - monitoramento desabilitado`
  - [ ] Sem erros críticos no console

### 12.2 Forçar Erro de Teste (opcional)
- [ ] **Abrir** console
- [ ] **Executar**: `throw new Error('Teste Sentry')`
- [ ] **Aguardar** 30 segundos
- [ ] **Verificar** no Sentry (se configurado):
  - [ ] Erro aparece no dashboard
  - [ ] Stack trace correto

---

## ✅ Resultado do Teste Visual

### Resumo
- **Total de Testes**: ~120 verificações
- **Testes Passados**: ___/120
- **Testes Falhados**: ___/120
- **Problemas Encontrados**: (listar abaixo)

### Problemas Críticos 🔴
1. 
2. 
3. 

### Problemas Menores 🟡
1. 
2. 
3. 

### Melhorias Sugeridas 💡
1. 
2. 
3. 

---

## 📝 Notas

**Testado por**: _______________________  
**Data**: ___/___/2025  
**Navegador**: _______________________  
**Resolução**: _______________________  
**Sistema Operacional**: _______________________

---

**Status Final**: 
- [ ] ✅ Aprovado - Pronto para produção
- [ ] ⚠️ Aprovado com ressalvas - Pequenos ajustes necessários
- [ ] ❌ Reprovado - Problemas críticos encontrados

---

**Próximos Passos**:
1. Corrigir problemas encontrados
2. Re-testar funcionalidades afetadas
3. Documentar bugs no GitHub Issues
4. Preparar para deploy em staging
