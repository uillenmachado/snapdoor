/**
 * Stripe Integration Hook
 * 
 * Este hook gerencia a integração com Stripe para pagamentos e assinaturas.
 * 
 * 🚧 STATUS: Estrutura pronta, aguardando configuração do Stripe
 * 
 * COMO USAR:
 * 
 * 1. Configure as variáveis de ambiente:
 *    - VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... (ou pk_live_...)
 *    - STRIPE_SECRET_KEY=sk_test_... (apenas backend/edge functions)
 *    - STRIPE_WEBHOOK_SECRET=whsec_... (para webhooks)
 * 
 * 2. Instale o Stripe SDK:
 *    npm install @stripe/stripe-js @stripe/react-stripe-js
 * 
 * 3. Crie produtos no Stripe Dashboard:
 *    - Starter: R$ 29/mês
 *    - Advanced: R$ 99/mês
 *    - Pro: R$ 199/mês
 * 
 * 4. Configure webhooks no Stripe:
 *    - Endpoint: https://seu-dominio.com/api/webhooks/stripe
 *    - Eventos: customer.subscription.*, invoice.payment_*
 * 
 * 5. Descomente o código abaixo e ajuste conforme necessário
 */

import { useState } from 'react';
// import { loadStripe } from '@stripe/stripe-js';
// import { supabase } from '@/integrations/supabase/client';

// Planos Stripe (IDs dos preços criados no Stripe Dashboard)
export const STRIPE_PRICE_IDS = {
  starter: 'price_starter_monthly', // Substituir pelo ID real do Stripe
  advanced: 'price_advanced_monthly', // Substituir pelo ID real do Stripe
  pro: 'price_pro_monthly', // Substituir pelo ID real do Stripe
};

// Inicializar Stripe (descomente quando tiver a chave)
// const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * Hook para checkout do Stripe
 * 
 * Exemplo de uso:
 * 
 * ```tsx
 * const { createCheckoutSession, loading } = useStripeCheckout();
 * 
 * const handleUpgrade = async (plan: 'starter' | 'advanced' | 'pro') => {
 *   await createCheckoutSession(plan);
 * };
 * ```
 */
export const useStripeCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCheckoutSession = async (plan: 'starter' | 'advanced' | 'pro') => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Implementar quando Stripe estiver configurado
      
      // 1. Chamar Edge Function do Supabase para criar sessão de checkout
      // const { data, error: functionError } = await supabase.functions.invoke('create-checkout-session', {
      //   body: {
      //     priceId: STRIPE_PRICE_IDS[plan],
      //     successUrl: `${window.location.origin}/settings?session_id={CHECKOUT_SESSION_ID}`,
      //     cancelUrl: `${window.location.origin}/pricing`,
      //   },
      // });

      // if (functionError) throw functionError;

      // 2. Redirecionar para checkout do Stripe
      // const stripe = await stripePromise;
      // if (!stripe) throw new Error('Stripe não inicializado');
      
      // const { error: stripeError } = await stripe.redirectToCheckout({
      //   sessionId: data.sessionId,
      // });

      // if (stripeError) throw stripeError;

      console.log('Checkout iniciado para plano:', plan);
      alert('Integração Stripe pendente. Configure as variáveis de ambiente e descomente o código.');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar sessão de checkout';
      setError(errorMessage);
      console.error('Erro no checkout:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    createCheckoutSession,
    loading,
    error,
  };
};

/**
 * Hook para gerenciar portal de cobrança do Stripe
 * 
 * Exemplo de uso:
 * 
 * ```tsx
 * const { openBillingPortal, loading } = useStripeBillingPortal();
 * 
 * <Button onClick={openBillingPortal}>
 *   Gerenciar Assinatura
 * </Button>
 * ```
 */
export const useStripeBillingPortal = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openBillingPortal = async () => {
    setLoading(true);
    setError(null);

    try {
      // TODO: Implementar quando Stripe estiver configurado
      
      // 1. Chamar Edge Function para criar sessão do portal
      // const { data, error: functionError } = await supabase.functions.invoke('create-billing-portal-session', {
      //   body: {
      //     returnUrl: `${window.location.origin}/settings`,
      //   },
      // });

      // if (functionError) throw functionError;

      // 2. Redirecionar para portal de cobrança
      // window.location.href = data.url;

      console.log('Abrindo portal de cobrança');
      alert('Integração Stripe pendente. Configure as variáveis de ambiente e descomente o código.');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao abrir portal de cobrança';
      setError(errorMessage);
      console.error('Erro ao abrir portal:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    openBillingPortal,
    loading,
    error,
  };
};

/**
 * EDGE FUNCTIONS NECESSÁRIAS (Supabase)
 * 
 * Crie estas funções em supabase/functions/:
 * 
 * 1. create-checkout-session/index.ts
 * 2. create-billing-portal-session/index.ts
 * 3. stripe-webhooks/index.ts
 * 
 * Veja exemplos em: supabase/functions/STRIPE_FUNCTIONS_GUIDE.md
 */

