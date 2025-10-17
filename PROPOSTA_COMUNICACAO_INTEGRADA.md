# 📧 **PROPOSTA: Sistema de Comunicação Integrado - SnapDoor CRM**

**Data**: 17 de outubro de 2025
**Objetivo**: Enriquecer a página de Oportunidades com comunicação rastreada (Email, WhatsApp, Calls)

---

## 🎯 **VISÃO GERAL**

### **Conceito (inspirado em Pipedrive/HubSpot)**:
A página de detalhes da oportunidade é o **hub central** onde acontecem todas as interações:

```
┌─────────────────────────────────────────────────────┐
│  DETALHES DA OPORTUNIDADE                            │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  │
│  │   EMPRESA    │  │    LEADS     │  │  VALOR   │  │
│  │   Acme Corp  │  │  3 contatos  │  │ R$ 50k   │  │
│  └──────────────┘  └──────────────┘  └──────────┘  │
│                                                       │
│  ┌─────────────────────────────────────────────────┐│
│  │  TIMELINE DE ATIVIDADES                         ││
│  ├─────────────────────────────────────────────────┤│
│  │  📧 Email enviado - "Proposta comercial"       ││
│  │     Para: joao@acme.com                         ││
│  │     Aberto: Sim | Clicou: Não                   ││
│  │     Há 2 horas                                   ││
│  ├─────────────────────────────────────────────────┤│
│  │  📞 Ligação realizada - 15min                   ││
│  │     Com: Maria (CFO)                             ││
│  │     Notas: "Interessada, pediu desconto"        ││
│  │     Ontem às 14:30                               ││
│  ├─────────────────────────────────────────────────┤│
│  │  💬 WhatsApp - "Follow-up proposta"            ││
│  │     Entregue ✓✓ | Lido ✓✓                      ││
│  │     Anteontem                                    ││
│  └─────────────────────────────────────────────────┘│
│                                                       │
│  ┌─────────────────────────────────────────────────┐│
│  │  [📧 Enviar Email] [📞 Registrar Ligação]      ││
│  │  [💬 WhatsApp]     [📝 Adicionar Nota]         ││
│  └─────────────────────────────────────────────────┘│
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

## 🔍 **ANÁLISE DAS APIs DISPONÍVEIS**

### **✅ APIs JÁ CONFIGURADAS** (no .env):

#### **1. Supabase** ✅
- **Status**: Configurado e funcionando
- **Uso**: Banco de dados, auth, storage
- **Potencial**: 
  - ✅ Armazenar emails enviados
  - ✅ Timeline de atividades
  - ✅ Anexos de emails
  - ✅ Real-time updates

#### **2. Resend** ✅ **PERFEITO PARA EMAILS**
```env
RESEND_API_KEY=re_BZM9Y2pf_9emjJJ3vkSjqCurb15kmd6K4
RESEND_FROM_EMAIL=onboarding@resend.dev
RESEND_FROM_NAME="SnapDoor CRM"
```

**Capacidades**:
- ✅ Enviar emails transacionais
- ✅ Rastrear aberturas (open tracking)
- ✅ Rastrear cliques (click tracking)
- ✅ Webhooks para status de entrega
- ✅ Templates personalizáveis
- ✅ Anexos
- ✅ **DOMÍNIO PRÓPRIO** (onboarding@resend.dev → comercial@snapdoor.com.br)

**Preço**: Grátis até 100 emails/dia, depois $20/mês

#### **3. Hunter.io** ✅
```env
VITE_HUNTER_API_KEY=c2e0acf158a10a3c0253b49c006a80979679cc5c
```

**Capacidades**:
- ✅ Descobrir emails de empresas
- ✅ Verificar validade de emails
- ✅ Enriquecer dados de contatos

#### **4. Stripe** ✅
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```
- Já configurado para pagamentos

#### **5. Sentry** ✅
- Monitoramento de erros

---

### **❌ APIs QUE PRECISAMOS ADICIONAR**:

#### **1. Para WhatsApp - Twilio** ⚠️ RECOMENDADO
**Por quê?**
- API oficial do WhatsApp Business
- Rastreamento de mensagens
- Webhooks para status (enviado, entregue, lido)
- Templates aprovados pelo Meta

**Configuração necessária**:
```env
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**Preço**: 
- $0.005 por mensagem (R$ 0,025)
- Viável para CRM

**Alternativa**: **WPPConnect** (self-hosted, gratuito, mas menos estável)

#### **2. Para Ligações - Twilio Voice** ⚠️ RECOMENDADO
**Por quê?**
- Gravação de chamadas
- Transcrição automática (IA)
- Call tracking
- Integração com CRM

**Configuração**:
```env
TWILIO_PHONE_NUMBER=+5511999999999
```

**Preço**:
- Ligações: $0.02/min (R$ 0,10/min)
- Gravações: incluídas

---

## 💡 **PROPOSTA DE SOLUÇÃO - FASE 1 (MVP)**

### **🎯 Objetivo**: Sistema de Email integrado com rastreamento

### **Stack Recomendada**:

```
Frontend (React)
├─ Composer de Email (rich text editor)
├─ Modal de envio
├─ Timeline de emails
└─ Indicadores de status (aberto, clicado)

Backend (Supabase Edge Functions)
├─ /send-email → Integra com Resend
├─ /email-webhook → Recebe status do Resend
└─ /track-open → Pixel de rastreamento

Database (Supabase)
├─ activities (emails, calls, whatsapp, notas)
├─ email_threads (conversas agrupadas)
└─ email_tracking (opens, clicks)
```

---

## 📊 **ESTRUTURA DO BANCO DE DADOS**

### **Tabela: `activities`** (já existe, vamos expandir)

```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  
  -- Tipo de atividade
  type TEXT NOT NULL CHECK (type IN (
    'email', 'call', 'whatsapp', 'meeting', 
    'note', 'task', 'linkedin_message'
  )),
  
  -- Direção (para emails/whatsapp)
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  
  -- Dados da atividade (JSONB flexível)
  data JSONB DEFAULT '{}',
  -- Para EMAIL: {
  --   subject: "Proposta comercial",
  --   body_html: "<p>Olá!</p>",
  --   to: ["joao@acme.com"],
  --   cc: [],
  --   bcc: [],
  --   attachments: [],
  --   message_id: "resend-id-123",
  --   thread_id: "uuid"
  -- }
  -- Para CALL: {
  --   duration: 900, // segundos
  --   recording_url: "https://...",
  --   notes: "Cliente interessado"
  -- }
  -- Para WHATSAPP: {
  --   message: "Olá, tudo bem?",
  --   media_url: "https://...",
  --   status: "delivered"
  -- }
  
  -- Status da atividade
  status TEXT DEFAULT 'completed',
  -- Para emails: 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed'
  -- Para calls: 'scheduled', 'completed', 'missed', 'cancelled'
  
  -- Rastreamento (apenas para emails)
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  
  -- Metadata
  scheduled_for TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_activities_deal_id ON activities(deal_id);
CREATE INDEX idx_activities_type ON activities(type);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
```

---

## 🚀 **IMPLEMENTAÇÃO PROPOSTA**

### **FASE 1: Email Tracking** (2-3 dias)

#### **1.1 - Estrutura do Banco** ✅
```sql
-- Migration já proposta acima
```

#### **1.2 - Supabase Edge Function: send-email**
```typescript
// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
  try {
    const { dealId, to, subject, html, userId } = await req.json()
    
    // 1. Enviar email via Resend
    const { data, error } = await resend.emails.send({
      from: 'comercial@snapdoor.com.br',
      to: to,
      subject: subject,
      html: html,
      // Habilitar tracking
      headers: {
        'X-Entity-Ref-ID': dealId, // Para rastrear
      },
    })
    
    if (error) throw error
    
    // 2. Salvar no banco
    const supabase = createClient(...)
    await supabase.from('activities').insert({
      user_id: userId,
      deal_id: dealId,
      type: 'email',
      direction: 'outbound',
      status: 'sent',
      data: {
        subject,
        body_html: html,
        to: [to],
        message_id: data.id,
      },
    })
    
    return new Response(JSON.stringify({ success: true }))
  } catch (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
})
```

#### **1.3 - Componente React: EmailComposer**
```tsx
// src/components/EmailComposer.tsx
export function EmailComposer({ dealId, leadEmail }) {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const sendMutation = useMutation({
    mutationFn: async () => {
      const { data } = await supabase.functions.invoke('send-email', {
        body: { dealId, to: leadEmail, subject, html: body }
      })
      return data
    },
    onSuccess: () => {
      toast.success('Email enviado!')
    }
  })
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Mail className="h-4 w-4 mr-2" />
          Enviar Email
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Enviar Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input 
            placeholder="Assunto" 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <ReactQuill 
            value={body} 
            onChange={setBody}
            modules={{ toolbar: [...] }}
          />
          <Button onClick={() => sendMutation.mutate()}>
            Enviar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

#### **1.4 - Timeline de Atividades**
```tsx
// src/components/ActivityTimeline.tsx
export function ActivityTimeline({ dealId }) {
  const { data: activities } = useQuery({
    queryKey: ['activities', dealId],
    queryFn: async () => {
      const { data } = await supabase
        .from('activities')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false })
      return data
    }
  })
  
  return (
    <div className="space-y-4">
      {activities?.map(activity => (
        <Card key={activity.id}>
          <CardHeader>
            <div className="flex items-center gap-2">
              {activity.type === 'email' && <Mail />}
              {activity.type === 'call' && <Phone />}
              {activity.type === 'whatsapp' && <MessageCircle />}
              <span className="font-medium">
                {activity.data.subject || activity.type}
              </span>
              {activity.opened_at && (
                <Badge variant="success">Aberto</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p>{activity.data.body_text}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {formatDistanceToNow(activity.created_at)} atrás
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

---

### **FASE 2: WhatsApp Integration** (3-4 dias)

**Opção A: Twilio (Profissional)**
- Setup: Criar conta Twilio
- Aprovação do Meta (2-7 dias)
- Templates pré-aprovados
- Webhooks para status

**Opção B: WPPConnect (Open Source)**
- Self-hosted (Docker)
- Mais controle
- Menos estável
- Gratuito

---

### **FASE 3: Call Tracking** (2-3 dias)

**Recursos**:
- Botão "Registrar Ligação"
- Campos: Duração, Notas, Participantes
- Upload de gravação (opcional)
- Integração com Twilio Voice (futuro)

---

## 💰 **CUSTOS ESTIMADOS**

### **Resend (Email)**:
- Grátis: 100 emails/dia (3.000/mês)
- Pro: $20/mês (50.000 emails)
- **Recomendação**: Começar no free tier

### **Twilio (WhatsApp + Voice)**:
- WhatsApp: $0.005/msg (~R$ 0,025)
- Voice: $0.02/min (~R$ 0,10/min)
- **Estimativa**: R$ 50-200/mês (uso moderado)

### **Total**: ~R$ 100-300/mês para operação completa

---

## 📋 **ROADMAP SUGERIDO**

### **Sprint 1 (Esta semana)**:
- [x] Análise de APIs ✅
- [ ] Migration: activities table expandida
- [ ] Supabase Function: send-email
- [ ] Componente: EmailComposer
- [ ] Componente: ActivityTimeline

### **Sprint 2 (Próxima semana)**:
- [ ] Webhook Resend (tracking de aberturas)
- [ ] Testes de envio de email
- [ ] Templates de email pré-definidos
- [ ] Histórico de emails por lead

### **Sprint 3**:
- [ ] Integração WhatsApp (Twilio ou WPPConnect)
- [ ] Call logging
- [ ] Upload de gravações

### **Sprint 4**:
- [ ] Email threading (conversas agrupadas)
- [ ] Respostas inline
- [ ] Integração com Gmail/Outlook (OAuth2)

---

## ❓ **DECISÕES NECESSÁRIAS**

### **1. Email - Domínio Próprio?**
- ❓ Usar `comercial@snapdoor.com.br`?
- ❓ Ou `noreply@snapdoor.com.br`?
- **Ação**: Configurar DNS do domínio no Resend

### **2. WhatsApp - Qual solução?**
- ✅ **Twilio**: Profissional, estável, pago
- ⚠️ **WPPConnect**: Gratuito, self-hosted, risco de ban

### **3. Rich Text Editor?**
- ✅ **React-Quill**: Simples, leve
- ⚠️ **TipTap**: Moderno, mais features
- ⚠️ **Draft.js**: Complexo

---

## 🎯 **PRÓXIMOS PASSOS IMEDIATOS**

1. ✅ **Você decide**: 
   - Começar com Email (Resend)?
   - Configurar domínio próprio?
   - Qual solução de WhatsApp?

2. **Eu implemento**:
   - Migration da tabela activities
   - Supabase Edge Function
   - Componentes React

3. **Testamos juntos**:
   - Envio de email
   - Rastreamento
   - Timeline

---

**Aguardo suas decisões para começarmos! 🚀**

Qual fase você quer priorizar?
1. 📧 Email (mais fácil, rápido)
2. 💬 WhatsApp (requer setup)
3. 📞 Call Tracking (simples registro)
