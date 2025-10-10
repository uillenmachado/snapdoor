# 📋 Requisitos Mínimos para Enriquecimento de Leads

## 🎯 Dados Necessários

O sistema de enriquecimento funciona com **diferentes combinações de dados**. Veja abaixo:

---

## ✅ Cenários de Enriquecimento

### 🟢 CENÁRIO 1: Nome Completo + Empresa
**Dados necessários:**
- ✅ Primeiro Nome (ex: "João")
- ✅ Sobrenome (ex: "Silva")
- ✅ Nome da Empresa (ex: "Microsoft", "Nubank", "Google")

**O que acontece:**
1. Sistema extrai domínio do nome da empresa:
   - "Microsoft" → "microsoft.com"
   - "Nubank" → "nubank.com.br"
   - "Google LLC" → "google.com"
2. Busca email usando **Email Finder** (3 créditos)
3. Se encontrar email, enriquece dados da pessoa (2 créditos)
4. Enriquece dados da empresa (2 créditos)

**Total:** 3 a 7 créditos

**Exemplo:**
```javascript
Lead inicial:
{
  first_name: "Alexis",
  last_name: "Ohanian",
  company: "Reddit"
}

Após enriquecimento:
{
  first_name: "Alexis",
  last_name: "Ohanian",
  company: "Reddit",
  email: "alexis@reddit.com",        // ✨ NOVO
  job_title: "Co-Founder",           // ✨ NOVO
  linkedin_url: "...",               // ✨ NOVO
  phone: "+1...",                    // ✨ NOVO
  company_size: 500,                 // ✨ NOVO
  company_industry: "Social Media"   // ✨ NOVO
}
```

---

### 🟢 CENÁRIO 2: Apenas Email
**Dados necessários:**
- ✅ Email válido (ex: "patrick@stripe.com")

**O que acontece:**
1. Extrai domínio do email: "stripe.com"
2. Enriquece dados da pessoa usando **Person Enrichment** (2 créditos)
3. Verifica email usando **Email Verifier** (1 crédito)
4. Enriquece dados da empresa usando **Company Enrichment** (2 créditos)

**Total:** 5 créditos

**Exemplo:**
```javascript
Lead inicial:
{
  first_name: "Patrick",
  last_name: "Collison",
  email: "patrick@stripe.com"
}

Após enriquecimento:
{
  first_name: "Patrick",
  last_name: "Collison",
  email: "patrick@stripe.com",
  job_title: "CEO & Co-Founder",     // ✨ NOVO
  phone: "+1...",                    // ✨ NOVO
  linkedin_url: "...",               // ✨ NOVO
  company: "Stripe",                 // ✨ NOVO
  company_size: 8000,                // ✨ NOVO
  company_industry: "Financial Tech" // ✨ NOVO
}
```

---

### 🟡 CENÁRIO 3: Email + Nome + Empresa (COMPLETO)
**Dados necessários:**
- ✅ Primeiro Nome
- ✅ Sobrenome
- ✅ Email
- ✅ Empresa

**O que acontece:**
1. Enriquece pessoa usando email (2 créditos)
2. Verifica email (1 crédito)
3. Enriquece empresa usando domínio (2 créditos)

**Total:** 5 créditos

**Resultado:** Dados mais precisos e completos

---

### 🔴 CENÁRIO 4: Dados Insuficientes (NÃO ENRIQUECE)
**Casos que NÃO funcionam:**
- ❌ Apenas Primeiro Nome
- ❌ Apenas Empresa
- ❌ Apenas Telefone
- ❌ Nome sem Sobrenome + Empresa

**Mensagem exibida:**
```
⚠️ Dados Insuficientes para Enriquecimento

Para enriquecer este lead, você precisa de:
• Nome completo + Empresa (para buscar email)
• OU Email válido (para buscar dados da pessoa e empresa)
```

---

## 🛠️ Extração Automática de Domínio

O sistema é **inteligente** e extrai domínio automaticamente de nomes de empresa:

### ✅ Empresas Globais
```
"Microsoft Corporation" → "microsoft.com"
"Google LLC" → "google.com"
"Stripe Inc." → "stripe.com"
"Apple Inc." → "apple.com"
"Amazon.com, Inc." → "amazon.com"
```

### ✅ Empresas Brasileiras
```
"Nubank S.A." → "nubank.com.br"
"Magazine Luiza" → "magazine-luiza.com.br"
"Itaú Unibanco" → "itau.com.br"
"Bradesco LTDA" → "bradesco.com.br"
```

### 🧹 Limpeza Automática
Remove automaticamente:
- Sufixos corporativos: LTDA, Inc., Corp., S.A., LLC, etc.
- Caracteres especiais
- Espaços extras
- Palavras como "Holding", "Group", "Internacional"

---

## 📊 Tabela de Custos por Operação

| Operação | Custo | Quando Usa |
|----------|-------|------------|
| **Email Finder** | 3 créditos | Nome + Sobrenome + Empresa (sem email) |
| **Person Enrichment** | 2 créditos | Quando tem email |
| **Company Enrichment** | 2 créditos | Quando tem domínio/empresa |
| **Email Verifier** | 1 crédito | Quando tem email |

---

## 💡 Dicas para Máximo Enriquecimento

### 🥇 Melhor Estratégia
1. **Adicione leads com nome completo + empresa**
   - Sistema busca email automaticamente
   - Se encontrar, enriquece tudo

2. **OU adicione leads com email válido**
   - Sistema enriquece pessoa e empresa
   - Descobre cargo, telefone, LinkedIn, etc.

### 📝 Exemplo de Fluxo Ideal
```
1. Você adiciona lead básico:
   Nome: "Elon"
   Sobrenome: "Musk"
   Empresa: "Tesla"

2. Clica em "Enriquecer Lead com IA"

3. Sistema:
   ✅ Extrai domínio: "tesla.com"
   ✅ Busca email: Encontra "elon@tesla.com"
   ✅ Enriquece pessoa: Descobre cargo, LinkedIn, etc.
   ✅ Enriquece empresa: Tamanho, indústria, localização
   ✅ Verifica email: Confirma validade

4. Lead completo em segundos! 🎉
```

---

## 🚫 Casos de Erro e Soluções

### ❌ "Dados Insuficientes"
**Problema:** Faltam dados mínimos

**Solução:**
1. Clique em "Editar" no dossiê do lead
2. Adicione pelo menos:
   - Nome completo + Empresa
   - OU Email válido
3. Salve e tente enriquecer novamente

### ❌ "Email not found"
**Problema:** API não encontrou email para aquela pessoa/empresa

**Solução:**
1. Adicione o email manualmente se souber
2. OU use outras fontes (LinkedIn, site da empresa)
3. Depois enriqueça com o email preenchido

### ❌ "Company not found"
**Problema:** API não conhece aquela empresa

**Solução:**
1. Verifique se o nome da empresa está correto
2. Tente nome mais simples (ex: "IBM" ao invés de "IBM Corporation")
3. OU adicione domínio manualmente no email

---

## 🎯 Resumo Visual

```
┌─────────────────────────────────────────────────────┐
│  DADOS MÍNIMOS PARA ENRIQUECIMENTO                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ✅ OPÇÃO 1: Nome Completo + Empresa               │
│     • first_name: "João"                           │
│     • last_name: "Silva"                           │
│     • company: "Microsoft"                         │
│     → Sistema busca email e enriquece tudo         │
│                                                     │
│  ✅ OPÇÃO 2: Apenas Email                          │
│     • email: "joao@microsoft.com"                  │
│     → Sistema descobre nome, cargo, empresa        │
│                                                     │
│  ❌ NÃO FUNCIONA:                                   │
│     • Apenas nome (sem empresa)                    │
│     • Apenas empresa (sem nome)                    │
│     • Apenas telefone                              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 🔍 Logs do Console (F12)

Quando você tenta enriquecer, veja no console:

```javascript
📊 Dados disponíveis para enriquecimento:
{
  first_name: true,
  last_name: true,
  email: false,
  company: true,
  company_domain: true  // ✨ Extraído automaticamente
}

🔍 Domínio extraído da empresa "Microsoft Corporation": microsoft.com
🔍 Buscando email para João Silva @ microsoft.com
✅ Email encontrado: joao.silva@microsoft.com (score: 95)
✅ Pessoa enriquecida: Senior Sales Manager
✅ Empresa enriquecida: Microsoft
✅ Email verificado: deliverable (score: 100)
✅ Lead enriquecido com sucesso! 7 créditos usados
```

---

## 📞 Suporte

Se tiver dúvidas sobre enriquecimento:
1. Veja os logs no console (F12)
2. Verifique este guia
3. Teste com leads de empresas conhecidas primeiro

**Dev Account:** Créditos ilimitados para testes! 🎉
