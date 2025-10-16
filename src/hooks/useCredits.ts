import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CREDIT_COSTS } from "@/services/hunterClient";
import { QueryParams, ResultSummary } from "@/types/enrichment";

// Types
export interface UserCredits {
  id: string;
  user_id: string;
  credits: number;
  total_purchased: number;
  total_used: number;
  created_at: string;
  updated_at: string;
}

export interface CreditUsageHistory {
  id: string;
  user_id: string;
  operation_type: string;
  credits_used: number;
  domain: string | null;
  email: string | null;
  query_params: QueryParams | null;
  result_summary: ResultSummary | null;
  success: boolean;
  error_message: string | null;
  created_at: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price_brl: number;
  discount_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreditPurchase {
  id: string;
  user_id: string;
  package_id: string | null;
  credits_purchased: number;
  amount_paid_brl: number;
  payment_method: string | null;
  payment_status: string;
  stripe_payment_id: string | null;
  stripe_session_id: string | null;
  created_at: string;
  completed_at: string | null;
}

// Get user credits
export const useUserCredits = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["user-credits", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID required");

      const { data, error } = await supabase
        .from("user_credits")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        // Se não existe, criar com 10 créditos iniciais
        if (error.code === 'PGRST116') {
          const { data: newData, error: insertError } = await supabase
            .from("user_credits")
            .insert({ user_id: userId, credits: 10 })
            .select()
            .single();

          if (insertError) throw insertError;
          return newData as UserCredits;
        }
        throw error;
      }

      return data as UserCredits;
    },
    enabled: !!userId,
  });
};

// Get credit usage history
export const useCreditUsageHistory = (userId: string | undefined, limit: number = 50) => {
  return useQuery({
    queryKey: ["credit-usage-history", userId, limit],
    queryFn: async () => {
      if (!userId) throw new Error("User ID required");

      const { data, error } = await supabase
        .from("credit_usage_history")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as any as CreditUsageHistory[];
    },
    enabled: !!userId,
  });
};

// Get available credit packages
export const useCreditPackages = () => {
  return useQuery({
    queryKey: ["credit-packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("credit_packages")
        .select("*")
        .eq("is_active", true)
        .order("credits", { ascending: true });

      if (error) throw error;
      return (data || []) as any as CreditPackage[];
    },
  });
};

// Get user purchases
export const useCreditPurchases = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["credit-purchases", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID required");

      const { data, error } = await supabase
        .from("credit_purchases")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as any as CreditPurchase[];
    },
    enabled: !!userId,
  });
};

// Debit credits
export const useDebitCredits = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      userId: string;
      operationType: keyof typeof CREDIT_COSTS;
      domain?: string;
      email?: string;
      queryParams?: any;
      resultSummary?: any;
    }) => {
      const credits = CREDIT_COSTS[params.operationType];

      const { data, error } = await (supabase as any).rpc("debit_credits", {
        p_user_id: params.userId,
        p_credits: credits,
        p_operation_type: params.operationType.toLowerCase(),
        p_domain: params.domain || null,
        p_email: params.email || null,
        p_query_params: params.queryParams || null,
        p_result_summary: params.resultSummary || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-credits", variables.userId] });
      queryClient.invalidateQueries({ queryKey: ["credit-usage-history", variables.userId] });
    },
    onError: (error: Error) => {
      if (error.message.includes("Créditos insuficientes")) {
        toast.error("Créditos insuficientes! Adquira mais créditos para continuar.", {
          duration: 5000,
          action: {
            label: "Comprar Créditos",
            onClick: () => {
              window.location.href = "/settings?tab=credits";
            },
          },
        });
      } else {
        toast.error(`Erro ao debitar créditos: ${error.message}`);
      }
    },
  });
};

// Add credits (for purchases or bonuses)
export const useAddCredits = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      userId: string;
      credits: number;
      purchaseId?: string;
    }) => {
      const { data, error } = await (supabase as any).rpc("add_credits", {
        p_user_id: params.userId,
        p_credits: params.credits,
        p_purchase_id: params.purchaseId || null,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-credits", variables.userId] });
      toast.success(`${variables.credits} créditos adicionados com sucesso!`);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar créditos: ${error.message}`);
    },
  });
};

// Check if user has enough credits
export const useCheckCredits = () => {
  return useMutation({
    mutationFn: async (params: {
      userId: string;
      operationType: keyof typeof CREDIT_COSTS;
    }) => {
      const requiredCredits = CREDIT_COSTS[params.operationType];

      const { data, error } = await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", params.userId)
        .single();

      if (error) throw error;

      const hasEnoughCredits = data.credits >= requiredCredits;

      return {
        hasEnoughCredits,
        currentCredits: data.credits,
        requiredCredits,
        missingCredits: hasEnoughCredits ? 0 : requiredCredits - data.credits,
      };
    },
  });
};

// Get credit cost for operation
export const getCreditCost = (operationType: keyof typeof CREDIT_COSTS): number => {
  return CREDIT_COSTS[operationType];
};

// Format operation type for display
export const formatOperationType = (type: string): string => {
  const types: Record<string, string> = {
    domain_search: "Busca por Domínio",
    email_finder: "Busca de Email",
    email_verifier: "Verificação de Email",
    company_enrichment: "Enriquecimento de Empresa",
    person_enrichment: "Enriquecimento de Pessoa",
    combined_enrichment: "Enriquecimento Combinado",
    discover: "Descoberta Avançada",
  };
  return types[type] || type;
};
