# 🔌 Guia de Edge Functions do Stripe

Este guia mostra como implementar as Edge Functions necessárias para integração com Stripe.

## 📋 Pré-requisitos

1. Conta no Stripe configurada
2. Supabase CLI instalado: `npm install -g supabase`
3. Variáveis de ambiente configuradas no Supabase Dashboard

## 🔑 Variáveis de Ambiente (Supabase Dashboard)

Configure em: **Project Settings > Edge Functions**

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
```

## 🛠️ Edge Functions a Criar

### 1. create-checkout-session

Cria uma sessão de checkout do Stripe.

**Arquivo**: `supabase/functions/create-checkout-session/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  try {
    const { priceId, successUrl, cancelUrl } = await req.json()

    // Obter usuário autenticado
    const authHeader = req.headers.get('Authorization')!
    // TODO: Validar token JWT do Supabase

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      // metadata: {
      //   userId: user.id,
      // },
    })

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

### 2. create-billing-portal-session

Cria uma sessão do portal de cobrança do Stripe.

**Arquivo**: `supabase/functions/create-billing-portal-session/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  try {
    const { returnUrl } = await req.json()

    // TODO: Obter customerId do usuário no banco
    const customerId = 'cus_...' // Buscar do banco

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

### 3. stripe-webhooks

Processa webhooks do Stripe para sincronizar assinaturas.

**Arquivo**: `supabase/functions/stripe-webhooks/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.0.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!
  const body = await req.text()

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    )

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription)
        break

      case 'customer.subscription.deleted':
        const deletedSub = event.data.object as Stripe.Subscription
        await handleSubscriptionCanceled(deletedSub)
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        console.log('Pagamento bem-sucedido:', invoice.id)
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(failedInvoice)
        break
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 })
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    )
  }
})

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId
  const plan = getPlanFromPriceId(subscription.items.data[0].price.id)

  await supabase
    .from('subscriptions')
    .update({
      plan,
      status: subscription.status,
      stripe_customer_id: subscription.customer as string,
      stripe_subscription_id: subscription.id,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('user_id', userId)
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId

  await supabase
    .from('subscriptions')
    .update({
      plan: 'free',
      status: 'canceled',
      stripe_subscription_id: null,
    })
    .eq('user_id', userId)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  // TODO: Notificar usuário sobre falha no pagamento
  console.log('Pagamento falhou para invoice:', invoice.id)
}

function getPlanFromPriceId(priceId: string): string {
  // Mapear price IDs para planos
  const priceMap: Record<string, string> = {
    'price_starter_monthly': 'starter',
    'price_advanced_monthly': 'advanced',
    'price_pro_monthly': 'pro',
  }
  return priceMap[priceId] || 'free'
}
```

## 🚀 Deploy das Functions

```bash
# Deploy todas as funções
supabase functions deploy create-checkout-session
supabase functions deploy create-billing-portal-session
supabase functions deploy stripe-webhooks

# Ou deploy todas de uma vez
supabase functions deploy
```

## 🔗 Configurar Webhooks no Stripe

1. Acesse: https://dashboard.stripe.com/webhooks
2. Clique em **Add endpoint**
3. URL: `https://seu-projeto.supabase.co/functions/v1/stripe-webhooks`
4. Eventos:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copie o **Signing secret** para `STRIPE_WEBHOOK_SECRET`

## ✅ Testar Localmente

```bash
# Iniciar funções localmente
supabase functions serve

# Em outro terminal, teste com curl
curl -X POST http://localhost:54321/functions/v1/create-checkout-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"priceId":"price_starter_monthly","successUrl":"http://localhost:5173/settings","cancelUrl":"http://localhost:5173/pricing"}'
```

## 📊 Atualizar Tabela de Subscriptions

Adicione estas colunas se ainda não existirem:

```sql
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;
```

## 🔐 Segurança

- ✅ Sempre valide assinaturas de webhooks
- ✅ Use HTTPS em produção
- ✅ Valide tokens JWT do Supabase
- ✅ Nunca exponha `STRIPE_SECRET_KEY` no frontend
- ✅ Use service role key apenas em edge functions

## 📚 Recursos

- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)

---

**Tempo estimado**: 2-3 horas
**Dificuldade**: ⭐⭐⭐ Intermediário

