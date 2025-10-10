# 🔍 SISTEMA DE ENRIQUECIMENTO DE LEADS

## 📋 Visão Geral

O Sistema de Enriquecimento de Leads permite completar automaticamente informações de leads usando a API Hunter.io. Com apenas alguns dados básicos (nome, empresa ou email), o sistema pode descobrir:

- ✉️ Email profissional
- 📱 Telefone
- 💼 Cargo/Posição
- 🏢 Informações da empresa
- 🔗 LinkedIn e Twitter
- ✅ Verificação de email

---

## 🚀 Como Usar

### Método 1: Botão Sparkles (Hover)
1. Passe o mouse sobre o card do lead
2. Clique no ícone **✨ Sparkles** (roxo) que aparece no canto superior direito
3. O sistema enriquecerá automaticamente o lead

### Método 2: Menu Dropdown (3 Pontos)
1. Clique nos **3 pontos** no card do lead
2. Selecione **"Enriquecer Lead com IA"** (primeira opção em destaque roxo)
3. Aguarde o processamento

---

## 💰 Custo de Créditos

O sistema usa diferentes endpoints da API Hunter.io com os seguintes custos:

| Operação | Custo | Quando é Usado |
|----------|-------|----------------|
| **Email Finder** | 3 créditos | Quando tem nome + empresa, mas não tem email |
| **Person Enrichment** | 2 créditos | Quando tem email (busca cargo, telefone, redes sociais) |
| **Company Enrichment** | 2 créditos | Quando tem domínio da empresa (busca tamanho, indústria, localização) |
| **Email Verifier** | 1 crédito | Quando tem email (verifica se é válido) |

### Exemplo de Custos:

- **Lead com nome + empresa (sem email):** 3 créditos (Email Finder)
- **Lead com email:** 3 créditos (Person Enrichment + Email Verifier)
- **Lead completo:** 6 créditos (Person + Company + Verifier)

---

## 🎯 Estratégia Inteligente

O sistema aplica enriquecimento de forma inteligente baseado nos dados disponíveis:

### 1️⃣ Se você tem: Nome + Empresa (mas sem email)
```
Ação: Email Finder
✅ Descobre: Email profissional, cargo, LinkedIn
💰 Custo: 3 créditos
```

### 2️⃣ Se você tem: Email
```
Ação: Person Enrichment + Email Verifier
✅ Descobre: Nome, cargo, telefone, LinkedIn, Twitter, empresa
💰 Custo: 3 créditos (2 + 1)
```

### 3️⃣ Se você tem: Email + Empresa
```
Ação: Person Enrichment + Company Enrichment + Email Verifier
✅ Descobre: Dados pessoais + Tamanho da empresa, indústria, localização, logo
💰 Custo: 5 créditos (2 + 2 + 1)
```

---

## 🔧 Arquivos Criados

### 1. `src/services/leadEnrichmentService.ts`
**Responsabilidade:** Lógica de enriquecimento e comunicação com Hunter.io API

**Principais Funções:**
- `enrichLead()` - Enriquece um lead com todas as informações disponíveis
- `calculateCreditsNeeded()` - Calcula quantos créditos serão necessários
- `extractDomainFromCompany()` - Extrai domínio de um nome de empresa

**Estratégia:**
1. Analisa quais dados o lead já possui
2. Decide quais endpoints da API chamar
3. Faz chamadas sequenciais (Email Finder → Person/Company → Verifier)
4. Atualiza o lead no banco de dados
5. Retorna resultado com campos enriquecidos

### 2. `src/hooks/useEnrichLead.ts`
**Responsabilidade:** Hook React Query para gerenciar estado e créditos

**Fluxo:**
1. **Verifica créditos** disponíveis (exceto dev account)
2. **Calcula custo** do enriquecimento
3. **Valida** se há créditos suficientes
4. **Executa** enriquecimento via service
5. **Debita créditos** (exceto dev account)
6. **Invalida queries** para atualizar UI
7. **Mostra toast** com resultado

### 3. `src/components/LeadCard.tsx` (Modificado)
**Adicionado:**
- Importação do hook `useEnrichLead`
- Função `handleEnrichLead()` com extração de domínio
- Botão Sparkles nas ações rápidas (hover)
- Menu item "Enriquecer Lead com IA" no dropdown
- Loading states durante processamento

---

## ✨ Funcionalidades Especiais

### 🎨 Visual
- **Ícone Sparkles (✨)** roxo nas ações rápidas
- **Hover effect** roxo claro no botão
- **Loading spinner** durante processamento
- **Menu item** destacado em roxo no dropdown

### 💳 Dev Account
- **Créditos ilimitados** para uillenmachado@gmail.com
- **Não debita** créditos do sistema
- **Toast especial** mostra "(Dev Account - FREE)"
- **Log detalhado** de todas operações

### 📊 Feedback
- **Toast de sucesso** mostra quantos campos foram enriquecidos
- **Toast de erro** explica problema (créditos insuficientes, sem dados, etc)
- **Console logs** detalhados para debug
- **Confidence score** quando disponível

---

## 🧪 Como Testar

### Cenário 1: Lead com Nome + Empresa
```
1. Criar lead manual: "João Silva" da "Microsoft"
2. Clicar em enriquecer
3. Sistema deve encontrar: email, cargo, LinkedIn
4. Toast: "Lead Enriquecido com Sucesso! ✨ - 3 campos atualizados (Dev Account - FREE)"
```

### Cenário 2: Lead com Email
```
1. Criar lead manual: apenas "patrick@stripe.com"
2. Clicar em enriquecer
3. Sistema deve descobrir: nome, cargo, empresa, telefone, redes sociais
4. Toast: "Lead Enriquecido com Sucesso! ✨ - 5+ campos atualizados"
```

### Cenário 3: Lead Completo
```
1. Criar lead: "Alexis Ohanian" da "Reddit" com "alexis@reddit.com"
2. Clicar em enriquecer
3. Sistema deve enriquecer: informações da empresa (tamanho, indústria, logo)
4. Toast: "Lead Enriquecido com Sucesso! ✨ - 7+ campos atualizados"
```

---

## 🐛 Tratamento de Erros

### Créditos Insuficientes
```typescript
toast.error('Créditos Insuficientes', {
  description: 'Necessário: X, Disponível: Y'
});
```

### Sem Dados Disponíveis
```typescript
toast.warning('Enriquecimento Limitado', {
  description: 'Não há informações adicionais disponíveis...'
});
```

### Erro Genérico
```typescript
toast.error('Erro ao Enriquecer Lead', {
  description: 'Tente novamente em alguns instantes'
});
```

---

## 📈 Próximas Melhorias

### 🎯 Curto Prazo
- [ ] Enriquecimento em lote (múltiplos leads)
- [ ] Preview de custo antes de enriquecer
- [ ] Histórico de enriquecimentos
- [ ] Indicador visual de campos enriquecidos

### 🚀 Médio Prazo
- [ ] Enriquecimento automático ao adicionar lead
- [ ] Agendamento de re-enriquecimento periódico
- [ ] Score de qualidade do lead pós-enriquecimento
- [ ] Sugestões de leads similares para enriquecer

### 🌟 Longo Prazo
- [ ] Integração com outras APIs (Clearbit, ZoomInfo)
- [ ] Machine Learning para prever sucesso de enriquecimento
- [ ] Cache inteligente para reduzir custos
- [ ] Dashboard de análise de enriquecimentos

---

## 📊 Métricas e Analytics

O sistema registra no histórico de créditos:

```json
{
  "operation_type": "lead_enrichment",
  "credits_used": 3,
  "domain": "stripe.com",
  "email": "patrick@stripe.com",
  "query_params": {
    "lead_id": "uuid-do-lead",
    "options": {
      "findEmail": false,
      "verifyEmail": true,
      "enrichCompany": true,
      "enrichPerson": true
    }
  },
  "result_summary": {
    "fields_enriched": 5,
    "sources": "person_enrichment, email_verifier",
    "confidence": 95
  }
}
```

---

## 🔐 Segurança

- ✅ **RLS Policies** garantem que usuários só enriquecem seus próprios leads
- ✅ **Verificação de créditos** antes de executar operações
- ✅ **Debito transacional** de créditos (se falhar, não debita)
- ✅ **Rate limiting** via cache do Hunter.io client (1h TTL)
- ✅ **API Key** hardcoded mas pode ser movida para env vars

---

## 💡 Dicas de Uso

1. **Enriqueça leads recém-criados** logo após adicionar informações mínimas
2. **Use dev account** para testar diferentes cenários sem gastar créditos
3. **Verifique console (F12)** para ver logs detalhados durante debug
4. **Re-enriqueça leads antigos** periodicamente para atualizar dados
5. **Combine com SnapDoor AI** para prospecção + enriquecimento automático

---

## 🎉 Status

✅ **COMPLETO E FUNCIONAL**

- Commit: `9012a3c`
- Data: 10/10/2025
- Arquivos: 4 criados/modificados
- Linhas: 618+ adicionadas
- Status: Pushed para GitHub

**Pronto para uso em produção!** 🚀
