# 📖 Guia do Usuário - SnapDoor CRM

> Guia completo para usar todas as funcionalidades do SnapDoor CRM

## 📑 Índice

1. [Primeiros Passos](#primeiros-passos)
2. [Gestão de Leads](#gestão-de-leads)
3. [Pipeline de Negócios](#pipeline-de-negócios)
4. [Enriquecimento Automático](#enriquecimento-automático)
5. [Atividades & Tarefas](#atividades--tarefas)
6. [Automações](#automações)
7. [Relatórios & Analytics](#relatórios--analytics)
8. [Configurações](#configurações)
9. [Dicas & Melhores Práticas](#dicas--melhores-práticas)

---

## 🚀 Primeiros Passos

### 1. Criar uma Conta

1. Acesse o SnapDoor CRM
2. Clique em **"Cadastre-se"**
3. Preencha:
   - Nome completo
   - Email profissional
   - Senha segura (mínimo 8 caracteres)
4. Confirme seu email
5. Faça login

### 2. Configurar Perfil

1. Clique no seu **avatar** (canto superior direito)
2. Selecione **"Configurações"**
3. Complete seu perfil:
   - Foto de perfil
   - Telefone
   - Cargo
   - Fuso horário
4. Salve as alterações

### 3. Dashboard Inicial

Após o login, você verá:

- **Métricas principais**: Leads, negócios, taxa de conversão
- **Atividades recentes**: Últimas interações
- **Próximas tarefas**: Lembretes e follow-ups
- **Gráficos de performance**: Evolução no tempo

---

## 👥 Gestão de Leads

### Adicionar um Lead Manualmente

1. Vá para **Leads** no menu lateral
2. Clique em **"+ Novo Lead"**
3. Preencha as informações:
   - **Nome** (obrigatório)
   - **Email** (obrigatório)
   - Telefone
   - Empresa
   - Cargo
   - Fonte (LinkedIn, Site, Indicação, etc.)
4. Clique em **"Salvar"**

### Visualizar Detalhes do Lead

1. Clique em qualquer **lead** na lista
2. No painel lateral, você verá:
   - **Informações básicas**: Nome, email, telefone
   - **Dados enriquecidos**: Cargo, empresa, LinkedIn
   - **Histórico de atividades**: Emails, ligações, reuniões
   - **Notas**: Anotações internas
   - **Score**: Temperatura (Quente 🔥 / Morno 🟡 / Frio ❄️)

### Filtrar e Buscar Leads

#### Busca Rápida
- Use a **barra de busca** no topo
- Digite nome, email ou empresa
- Resultados aparecem em tempo real

#### Filtros Avançados
1. Clique em **"Filtros"**
2. Selecione critérios:
   - Status (Novo, Qualificado, Negociação, etc.)
   - Fonte (LinkedIn, Site, Indicação)
   - Temperatura (Quente, Morno, Frio)
   - Período (Criados hoje, última semana, etc.)
3. Clique em **"Aplicar"**

### Organizar Leads

#### Por Status
- **Novo**: Lead recém-adicionado
- **Qualificado**: Lead validado
- **Em Negociação**: Proposta enviada
- **Ganho**: Negócio fechado ✅
- **Perdido**: Negócio não concretizado ❌

#### Por Temperatura
- 🔥 **Quente**: Alta probabilidade de conversão
- 🟡 **Morno**: Interesse médio, requer nutrição
- ❄️ **Frio**: Baixo interesse, long-term follow-up

### Ações em Massa

1. Selecione vários leads (checkbox)
2. Clique no menu de ações:
   - **Alterar status**
   - **Adicionar tag**
   - **Exportar para CSV**
   - **Atribuir a usuário**
   - **Arquivar/Desarquivar**

---

## 🎯 Pipeline de Negócios

### Visualização Kanban

1. Vá para **Negócios** no menu
2. Veja o **pipeline visual** com colunas:
   - **Novo**: Negócio iniciado
   - **Qualificação**: Validação de interesse
   - **Proposta**: Orçamento enviado
   - **Negociação**: Ajustes finais
   - **Fechado**: Ganho ou Perdido

### Criar um Negócio

1. Clique em **"+ Novo Negócio"**
2. Preencha:
   - **Título** (ex: "Venda Software - Empresa X")
   - **Valor** (R$ estimado)
   - **Lead associado** (selecione da lista)
   - **Data prevista de fechamento**
   - **Probabilidade** (0-100%)
3. Clique em **"Criar"**

### Mover Negócio no Pipeline

#### Arrastar e Soltar
1. Clique no **card do negócio**
2. Arraste para a coluna desejada
3. Solte na nova posição
4. Status é atualizado automaticamente

#### Menu de Contexto
1. Clique no **⋮** (três pontos) no card
2. Selecione **"Mover para..."**
3. Escolha o novo estágio
4. Confirme

### Detalhes do Negócio

Ao clicar em um negócio, você vê:

- **Informações**: Valor, probabilidade, data prevista
- **Lead associado**: Dados do contato
- **Atividades**: Histórico de interações
- **Tarefas**: Próximos passos
- **Documentos**: Propostas, contratos anexados
- **Notas**: Anotações internas

### Fechar um Negócio

#### Ganho ✅
1. Mova para a coluna **"Fechado - Ganho"**
2. Confirme o **valor final**
3. Adicione notas de fechamento
4. Lead é marcado como **Cliente**

#### Perdido ❌
1. Mova para **"Fechado - Perdido"**
2. Selecione o **motivo**:
   - Preço muito alto
   - Escolheu concorrente
   - Timing inadequado
   - Não tinha budget
3. Adicione observações
4. Lead volta para nutrição

---

## 🤖 Enriquecimento Automático

### Como Funciona

O SnapDoor enriquece leads automaticamente usando:

- **Hunter.io**: Verifica e-mails, encontra contatos adicionais
- **LinkedIn Scraper**: Extrai cargo, empresa, localização
- **SnapDoor AI**: Analisa perfil e sugere estratégias

### Enriquecer um Lead

#### Manualmente
1. Abra o **perfil do lead**
2. Clique em **"🔍 Enriquecer"**
3. Aguarde (15-30 segundos)
4. Dados são atualizados automaticamente:
   - ✅ Cargo verificado
   - ✅ Empresa confirmada
   - ✅ LinkedIn atualizado
   - ✅ Telefones adicionais
   - ✅ Score de qualificação

#### Automático
1. Vá para **Configurações > Automações**
2. Ative **"Enriquecer leads novos"**
3. Defina critérios:
   - Enriquecer apenas leads com email
   - Aguardar 5 minutos após criação
4. Salve

### Custo de Créditos

Cada enriquecimento consome **1 crédito**:

- **Plano Free**: 10 créditos/mês
- **Plano Pro**: 100 créditos/mês
- **Plano Enterprise**: Créditos ilimitados

### Verificar Saldo de Créditos

1. Clique no **ícone de créditos** (topo direito)
2. Veja saldo atual
3. Clique em **"Comprar Créditos"** se necessário
4. Histórico de uso disponível

---

## 📅 Atividades & Tarefas

### Tipos de Atividades

- **📧 Email**: Comunicação por email
- **📞 Ligação**: Chamada telefônica
- **👥 Reunião**: Encontro presencial ou virtual
- **✅ Tarefa**: To-do interno
- **📝 Nota**: Anotação rápida

### Adicionar uma Atividade

1. Abra o **perfil do lead**
2. Clique em **"+ Nova Atividade"**
3. Selecione o tipo
4. Preencha:
   - **Título** (ex: "Follow-up proposta")
   - **Data/Hora**
   - **Duração** (para reuniões)
   - **Descrição**
   - **Participantes** (opcional)
5. Marque **"Criar lembrete"** se quiser notificação
6. Clique em **"Salvar"**

### Visualizar Atividades

#### Lista de Atividades
1. Vá para **Atividades** no menu
2. Veja todas as atividades:
   - **Hoje**: Atividades de hoje
   - **Atrasadas**: Pendentes
   - **Próximas**: Agenda futura
3. Filtre por:
   - Tipo (Email, Ligação, Reunião)
   - Status (Pendente, Concluída)
   - Usuário responsável

#### Calendário
1. Clique na **visualização Calendário**
2. Veja atividades no formato agenda
3. Arraste para reagendar
4. Clique para ver detalhes

### Marcar como Concluída

1. Localize a atividade na lista
2. Marque o **checkbox** ✅
3. Adicione resultado (opcional):
   - **Sucesso**: Objetivo alcançado
   - **Reagendar**: Precisa de follow-up
   - **Sem sucesso**: Não atendeu/respondeu
4. Salve

---

## ⚙️ Automações

### O que são Automações?

Regras que executam ações automaticamente quando condições específicas são atendidas.

### Criar uma Automação

1. Vá para **Configurações > Automações**
2. Clique em **"+ Nova Automação"**
3. Configure:
   - **Nome** (ex: "Follow-up leads frios")
   - **Gatilho** (quando executar):
     - Lead criado
     - Lead atualizado
     - Negócio movido
     - Data específica
   - **Condições** (quando aplicar):
     - Status = Frio
     - Sem atividade há > 7 dias
   - **Ações** (o que fazer):
     - Enviar email
     - Criar tarefa
     - Alterar temperatura
     - Notificar usuário
4. Clique em **"Ativar"**

### Exemplos de Automações

#### 1. Enriquecer Leads Novos
- **Gatilho**: Lead criado
- **Condição**: Email presente
- **Ação**: Enriquecer automaticamente

#### 2. Follow-up Após Reunião
- **Gatilho**: Reunião concluída
- **Condição**: Tipo = "Demonstração"
- **Ação**: Criar tarefa "Enviar proposta" (2 dias depois)

#### 3. Alertar Negócios Parados
- **Gatilho**: Todo dia às 9h
- **Condição**: Negócio sem atividade há > 7 dias
- **Ação**: Notificar responsável

#### 4. Mover Lead para Qualificado
- **Gatilho**: Lead atualizado
- **Condição**: Score > 70
- **Ação**: Alterar status para "Qualificado"

### Gerenciar Automações

1. Vá para **Configurações > Automações**
2. Veja lista de automações:
   - **Ativas**: Em execução (toggle verde)
   - **Inativas**: Pausadas (toggle cinza)
3. Clique para editar/duplicar/excluir
4. Veja histórico de execuções

---

## 📊 Relatórios & Analytics

### Dashboard de Analytics

1. Vá para **Relatórios** no menu
2. Selecione período:
   - Hoje
   - Esta semana
   - Este mês
   - Personalizado
3. Veja métricas:
   - **Leads gerados**: Total de novos leads
   - **Taxa de conversão**: Leads → Negócios
   - **Ticket médio**: Valor médio de negócios ganhos
   - **Ciclo de vendas**: Tempo médio para fechar
   - **Funil de vendas**: Por etapa do pipeline

### Gráficos Disponíveis

#### 1. Funil de Conversão
- Visualiza quantos leads estão em cada etapa
- Identifica gargalos no processo

#### 2. Performance por Período
- Gráfico de linha com evolução mensal
- Compare meses/trimestres

#### 3. Fontes de Leads
- Gráfico de pizza: LinkedIn, Site, Indicação, etc.
- Identifique canais mais eficazes

#### 4. Distribuição de Temperatura
- Quantos leads Quentes/Mornos/Frios
- Planeje ações de nutrição

#### 5. Atividades por Tipo
- Quantos emails, ligações, reuniões realizadas
- Analise produtividade da equipe

### Exportar Relatórios

1. Configure o relatório desejado
2. Clique em **"Exportar"**
3. Selecione formato:
   - **PDF**: Para apresentações
   - **Excel**: Para análise avançada
   - **CSV**: Para integração com outras ferramentas
4. Download é iniciado automaticamente

---

## 🔧 Configurações

### Perfil

- **Dados pessoais**: Nome, email, telefone
- **Foto de perfil**: Upload de imagem
- **Senha**: Alterar senha de acesso
- **Notificações**: Preferências de email/push
- **Fuso horário**: Ajustar para sua região

### Equipe (apenas Admin)

#### Adicionar Usuário
1. Vá para **Configurações > Equipe**
2. Clique em **"+ Convidar"**
3. Digite email do novo usuário
4. Selecione permissão:
   - **Admin**: Acesso total
   - **Vendedor**: Ver/editar leads e negócios
   - **Visualizador**: Apenas leitura
5. Envie convite

#### Gerenciar Usuários
- Ver lista de usuários ativos
- Alterar permissões
- Desativar/reativar usuários
- Ver histórico de atividades

### Integrações

#### Hunter.io
1. Vá para **Configurações > Integrações**
2. Clique em **"Conectar Hunter.io"**
3. Cole sua **API Key**
4. Teste conexão
5. Salve

#### Supabase (Admin)
- Configurar database
- Gerenciar storage
- Ver logs de Edge Functions

### Tema

1. Vá para **Configurações > Aparência**
2. Selecione:
   - **Claro**: Tema padrão
   - **Escuro**: Modo noturno
   - **Sistema**: Seguir configuração do SO
3. Ajuste é salvo automaticamente

---

## 💡 Dicas & Melhores Práticas

### 🎯 Gestão de Leads

✅ **Padronize a entrada de dados**
- Use campos obrigatórios (Nome, Email)
- Valide informações antes de salvar
- Mantenha consistência em nomes de empresas

✅ **Enriqueça rapidamente**
- Enriqueça leads assim que criar
- Verifique emails para evitar bounces
- Use dados enriquecidos para personalização

✅ **Organize por temperatura**
- Quente: Ação imediata (hoje/amanhã)
- Morno: Follow-up em 3-5 dias
- Frio: Nutrição de longo prazo (mensal)

### 🎯 Pipeline de Negócios

✅ **Mantenha o pipeline limpo**
- Mova negócios regularmente
- Feche negócios antigos (ganho ou perdido)
- Remova duplicatas

✅ **Atualize valores realisticamente**
- Ajuste valor conforme negociação
- Reduza probabilidade se estagnar
- Revise datas previstas semanalmente

✅ **Registre todas as interações**
- Adicione nota após cada reunião
- Documente objeções e respostas
- Anexe propostas e contratos

### 🎯 Atividades

✅ **Planeje sua semana**
- Segunda-feira: Revise pipeline
- Terça-Quarta: Follow-ups
- Quinta: Demonstrações
- Sexta: Prospecção

✅ **Use lembretes**
- Configure alertas 1h antes de reuniões
- Crie tarefas para follow-ups importantes
- Revise diariamente sua lista de pendências

✅ **Seja consistente**
- Registre TODAS as atividades (não só as bem-sucedidas)
- Marque como concluída assim que terminar
- Adicione próximos passos

### 🎯 Automações

✅ **Comece simples**
- Crie 1-2 automações inicialmente
- Teste antes de ativar
- Monitore execuções nas primeiras semanas

✅ **Evite spam**
- Não envie emails automáticos diariamente
- Personalize mensagens (use variáveis)
- Respeite opt-out/unsubscribe

✅ **Revise regularmente**
- Desative automações que não funcionam
- Ajuste condições conforme aprende
- Duplique e modifique em vez de começar do zero

### 🎯 Relatórios

✅ **Defina métricas chave**
- Taxa de conversão Lead → Negócio
- Ticket médio
- Ciclo de vendas
- Custo por lead (CAC)

✅ **Analise tendências**
- Compare mês a mês (não dia a dia)
- Identifique sazonalidades
- Ajuste estratégias com base em dados

✅ **Compartilhe com a equipe**
- Reunião semanal de review
- Celebre vitórias (negócios ganhos)
- Aprenda com perdas (motivos de perda)

---

## 🆘 Precisa de Ajuda?

### Suporte Técnico
- **Email**: uillenmachado4@gmail.com
- **GitHub**: [github.com/uillenmachado/snapdoor](https://github.com/uillenmachado/snapdoor)

### Documentação Adicional
- [START_HERE.md](./START_HERE.md) - Visão geral do projeto
- [SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md) - Configuração do backend
- [CREDIT_SYSTEM_GUIDE.md](./CREDIT_SYSTEM_GUIDE.md) - Sistema de créditos
- [LEAD_ENRICHMENT_GUIDE.md](./LEAD_ENRICHMENT_GUIDE.md) - Enriquecimento avançado

### Tutoriais em Vídeo
*(Em breve)*

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.0.0
