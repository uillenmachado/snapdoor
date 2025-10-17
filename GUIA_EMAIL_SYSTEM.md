# 📧 **SISTEMA DE EMAIL INTEGRADO - Guia de Implementação**

**Data**: 17 de outubro de 2025
**Status**: ✅ Código pronto para aplicar

---

## 🎯 **O QUE FOI CRIADO**

### **1. Migration SQL** ✅
**Arquivo**: `supabase/migrations/20251017000002_create_activities_system.sql`

**O que faz**:
- ✅ Cria tabela `activities` para registrar todas as atividades
- ✅ Suporta: emails, ligações, reuniões, notas
- ✅ Rastreia aberturas e cliques de emails
- ✅ Índices otimizados para performance
- ✅ RLS (Row Level Security) configurado
- ✅ View `email_analytics` para métricas

### **2. Supabase Edge Function** ✅
**Arquivo**: `supabase/functions/send-email/index.ts`

**O que faz**:
- ✅ Integra com Resend API
- ✅ Envia emails autenticados
- ✅ Salva automaticamente em `activities`
- ✅ Retorna `message_id` para rastreamento

### **3. Componente EmailComposer** ✅
**Arquivo**: `src/components/EmailComposer.tsx`

**Features**:
- ✅ Modal para compor emails
- ✅ Templates pré-definidos
- ✅ Campos: Para, CC, CCO, Assunto, Mensagem
- ✅ Validação de formulário
- ✅ Loading states
- ✅ Toast de sucesso/erro

### **4. Componente ActivityTimeline** ✅
**Arquivo**: `src/components/ActivityTimeline.tsx`

**Features**:
- ✅ Timeline de todas as atividades
- ✅ Badges de status (aberto, clicado)
- ✅ Preview de emails
- ✅ Atualização em tempo real (10s)
- ✅ Design inspirado em Pipedrive

---

## 🚀 **COMO APLICAR**

### **PASSO 1: Aplicar Migration no Supabase**

1. **Acesse**: https://supabase.com/dashboard
2. **Vá em**: SQL Editor
3. **Cole**: Conteúdo de `supabase/migrations/20251017000002_create_activities_system.sql`
4. **Execute**: Clique em "Run"
5. **Aguarde**: "Success. No rows returned"

✅ **Resultado**: Tabela `activities` criada com todos os índices

---

### **PASSO 2: Deploy da Edge Function**

**Opção A: Via CLI** (Recomendado)
```powershell
cd "c:\Users\Uillen Machado\Documents\Meus projetos\snapdoor"
npx supabase functions deploy send-email
```

**Opção B: Via Dashboard**
1. Acesse: https://supabase.com/dashboard/project/_/functions
2. Clique: "Create a new function"
3. Nome: `send-email`
4. Cole código de `supabase/functions/send-email/index.ts`
5. Deploy!

✅ **Resultado**: Function disponível em `/send-email`

---

### **PASSO 3: Configurar Variáveis de Ambiente**

No **Supabase Dashboard** → **Settings** → **Edge Functions** → **Secrets**:

Adicione:
```
RESEND_API_KEY=re_BZM9Y2pf_9emjJJ3vkSjqCurb15kmd6K4
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME=SnapDoor CRM
```

✅ **Resultado**: Edge Function pode enviar emails

---

### **PASSO 4: Integrar na Página DealDetail**

Abra: `src/pages/DealDetail.tsx`

**Adicione os imports**:
```typescript
import { EmailComposer } from '@/components/EmailComposer';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
```

**Adicione na seção de ações** (onde estão os botões):
```typescript
{/* Botão de Email */}
<EmailComposer
  dealId={deal.id}
  leadId={participants[0]?.lead_id}
  companyId={deal.company_id}
  defaultTo={participants[0]?.email}
  defaultSubject={`Re: ${deal.title}`}
/>
```

**Adicione a Timeline** (em uma nova Tab):
```typescript
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
    <TabsTrigger value="activities">Atividades</TabsTrigger>
  </TabsList>

  <TabsContent value="overview">
    {/* Conteúdo atual da página */}
  </TabsContent>

  <TabsContent value="activities">
    <ActivityTimeline dealId={deal.id} />
  </TabsContent>
</Tabs>
```

---

## 🧪 **COMO TESTAR**

### **1. Enviar Email de Teste**

1. Abra uma oportunidade: `http://localhost:8080/deals/[ID]`
2. Clique: **"Enviar Email"**
3. Preencha:
   - **Para**: seu-email@gmail.com
   - **Assunto**: "Teste do CRM"
   - **Mensagem**: "Olá, teste de envio!"
4. Clique: **"Enviar Email"**

**Resultado esperado**:
- ✅ Toast: "📧 Email enviado com sucesso!"
- ✅ Email chega na caixa de entrada
- ✅ Aparece na Timeline automaticamente

### **2. Verificar Timeline**

1. Vá na tab **"Atividades"**
2. Deve aparecer:
   - 📧 Card do email enviado
   - Badge: "Enviado"
   - Preview da mensagem
   - Timestamp relativo ("há 2 minutos")

### **3. Verificar Rastreamento**

1. **Abra o email** que você recebeu
2. **Aguarde ~30 segundos**
3. **Recarregue** a página da oportunidade
4. Deve aparecer:
   - Badge verde: **"Aberto (1x)"**
   - Timestamp: "Aberto pela primeira vez: há 1 minuto"

---

## 📊 **ESTRUTURA FINAL**

```
DealDetail.tsx
├─ Header (título, valor, status)
├─ Actions Bar
│  ├─ [Marcar como Ganho]
│  ├─ [Marcar como Perdido]
│  └─ [📧 Enviar Email] ← NOVO
│
└─ Tabs
   ├─ Visão Geral
   │  ├─ Empresa
   │  ├─ Participantes
   │  └─ Notas
   │
   └─ Atividades ← NOVO
      └─ ActivityTimeline
         ├─ 📧 Email: "Proposta comercial"
         │  └─ Aberto (2x) | Clicado (1x)
         ├─ 📞 Ligação: 15 minutos
         └─ 📝 Nota: "Cliente pediu desconto"
```

---

## 🎨 **TEMPLATES DE EMAIL INCLUÍDOS**

1. **Em branco** - Criar do zero
2. **Apresentação inicial** - Primeiro contato
3. **Follow-up** - Retomar conversa
4. **Envio de proposta** - Anexar proposta comercial

Cada template tem placeholders:
- `{{contact_name}}`
- `{{company_name}}`
- `{{sender_name}}`
- `{{topic}}`

---

## 🔥 **PRÓXIMOS PASSOS** (Futuro)

### **Webhook Resend** (tracking avançado)
```typescript
// supabase/functions/resend-webhook/index.ts
// Recebe notificações de:
// - email.delivered
// - email.opened
// - email.clicked
// - email.bounced

// Atualiza activities:
UPDATE activities 
SET 
  opened_at = NOW(),
  opened_count = opened_count + 1
WHERE data->>'message_id' = 'resend-id'
```

### **Rich Text Editor**
```bash
npm install react-quill
```

### **Anexos**
```typescript
// Upload para Supabase Storage
const { data } = await supabase.storage
  .from('email-attachments')
  .upload(`${userId}/${fileName}`, file)
```

---

## ✅ **CHECKLIST**

- [ ] Migration aplicada no Supabase
- [ ] Edge Function deployada
- [ ] Variáveis de ambiente configuradas
- [ ] EmailComposer integrado em DealDetail
- [ ] ActivityTimeline adicionada
- [ ] Teste de envio realizado
- [ ] Email recebido com sucesso
- [ ] Timeline atualizada
- [ ] Rastreamento de abertura funcionando

---

## 🆘 **TROUBLESHOOTING**

### **Email não enviou**
1. Verifique se `RESEND_API_KEY` está configurada
2. Cheque logs da Edge Function no Supabase Dashboard
3. Verifique console do navegador (F12)

### **Timeline não atualiza**
1. Verifique se migration foi aplicada
2. Confira RLS policies (deve permitir leitura)
3. Cheque query key em `useQuery`

### **Rastreamento não funciona**
1. Resend tem delay de ~30s para tracking
2. Alguns emails bloqueiam pixels de rastreamento
3. Verifique se `message_id` foi salvo corretamente

---

**Tudo pronto para começar! 🚀**

Aplique as migrations e me avise se tiver algum erro!
