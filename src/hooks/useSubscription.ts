import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Subscription {
  id: string;
  user_id: string;
  plan: "free" | "starter" | "advanced" | "pro";
  status: "active" | "canceled" | "past_due" | "trial";
  current_period_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

// Fetch user subscription
export const useSubscription = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["subscription", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID required");

      // Retorna plano free padrão para todos os usuários
      // NOTA: Sistema de assinaturas será implementado futuramente
      return {
        id: `sub-${userId}`,
        user_id: userId,
        plan: "free",
        status: "active",
        current_period_end: null,
        stripe_customer_id: null,
        stripe_subscription_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Subscription;
    },
    enabled: !!userId,
  });
};

// Plan limits
export const PLAN_LIMITS = {
  free: {
    name: "Free",
    leads: 50,
    pipelines: 1,
    users: 1,
    price: 0,
    features: [
      "Até 50 leads",
      "1 pipeline",
      "Relatórios básicos",
      "Extensão do navegador",
    ],
  },
  starter: {
    name: "Starter",
    leads: 250,
    pipelines: 3,
    users: 2,
    price: 29,
    features: [
      "Até 250 leads",
      "3 pipelines",
      "Relatórios avançados",
      "Extensão do navegador",
      "Suporte por email",
    ],
  },
  advanced: {
    name: "Advanced",
    leads: 1000,
    pipelines: 10,
    users: 5,
    price: 99,
    features: [
      "Até 1.000 leads",
      "10 pipelines",
      "Relatórios avançados",
      "Automações",
      "Extensão do navegador",
      "Suporte prioritário",
      "Integrações",
    ],
  },
  pro: {
    name: "Pro",
    leads: -1, // unlimited
    pipelines: -1, // unlimited
    users: -1, // unlimited
    price: 199,
    features: [
      "Leads ilimitados",
      "Pipelines ilimitados",
      "Usuários ilimitados",
      "Relatórios personalizados",
      "Automações avançadas",
      "API access",
      "Suporte 24/7",
      "Onboarding dedicado",
    ],
  },
};

// Check if user has reached limit
export const checkLimit = (
  subscription: Subscription | null | undefined,
  limitType: "leads" | "pipelines" | "users",
  currentCount: number
): boolean => {
  if (!subscription) return false;

  const plan = subscription.plan;
  const limit = PLAN_LIMITS[plan][limitType];

  // -1 means unlimited
  if (limit === -1) return true;

  return currentCount < limit;
};

