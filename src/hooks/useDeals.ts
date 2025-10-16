import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types
export interface Deal {
  id: string;
  user_id: string;
  pipeline_id: string;
  stage_id: string;
  
  // Informações básicas
  title: string;
  value: number;
  currency: string;
  
  // Empresa
  company_id: string | null;
  company_name: string | null;
  
  // Status
  status: 'open' | 'won' | 'lost';
  probability: number;
  
  // Datas
  expected_close_date: string | null;
  closed_date: string | null;
  
  // Responsável
  owner_id: string | null;
  
  // Campos adicionais
  description: string | null;
  lost_reason: string | null;
  source: string | null;
  tags: string[] | null;
  custom_fields: any;
  is_favorite: boolean | null;
  
  // Posição no pipeline
  position: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface DealParticipant {
  id: string;
  deal_id: string;
  lead_id: string;
  user_id: string;
  role: 'decision_maker' | 'influencer' | 'user' | 'technical' | 'champion' | 'participant';
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

// Fetch all deals for a user
export const useDeals = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["deals", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID required");

      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .eq("user_id", userId)
        .order("position", { ascending: true });

      if (error) throw error;
      return data as Deal[];
    },
    enabled: !!userId,
  });
};

// Fetch deals by stage
export const useDealsByStage = (stageId: string | undefined) => {
  return useQuery({
    queryKey: ["deals", "stage", stageId],
    queryFn: async () => {
      if (!stageId) throw new Error("Stage ID required");

      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .eq("stage_id", stageId)
        .order("position", { ascending: true });

      if (error) throw error;
      return data as Deal[];
    },
    enabled: !!stageId,
  });
};

// Fetch single deal
export const useDeal = (dealId: string | undefined) => {
  return useQuery({
    queryKey: ["deal", dealId],
    queryFn: async () => {
      if (!dealId) throw new Error("Deal ID required");

      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .eq("id", dealId)
        .single();

      if (error) throw error;
      return data as Deal;
    },
    enabled: !!dealId,
  });
};

// Create a new deal
export const useCreateDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newDeal: {
      user_id: string;
      pipeline_id: string;
      stage_id: string;
      title: string;
      value?: number;
      company_name?: string;
      company_id?: string;
      expected_close_date?: string;
      probability?: number;
      description?: string;
      source?: string;
      tags?: string[];
      position?: number;
    }) => {
      const { data, error } = await supabase
        .from("deals")
        .insert(newDeal as any)
        .select()
        .single();

      if (error) throw error;
      return data as Deal;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deals", "stage", data.stage_id] });
      toast.success("Negócio criado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar negócio: ${error.message}`);
    },
  });
};

// Update a deal
export const useUpdateDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<Deal, "id" | "user_id" | "created_at" | "updated_at">>;
    }) => {
      const { data, error } = await supabase
        .from("deals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Deal;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deal", data.id] });
      queryClient.invalidateQueries({ queryKey: ["deals", "stage", data.stage_id] });
      toast.success("Negócio atualizado!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
    },
  });
};

// Delete a deal
export const useDeleteDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dealId: string) => {
      const { error } = await supabase
        .from("deals")
        .delete()
        .eq("id", dealId);

      if (error) throw error;
      return dealId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Negócio removido!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover: ${error.message}`);
    },
  });
};

// Move deal to different stage
export const useMoveDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dealId,
      fromStageId,
      toStageId,
      position,
    }: {
      dealId: string;
      fromStageId: string;
      toStageId: string;
      position: number;
    }) => {
      const { data, error} = await supabase
        .from("deals")
        .update({
          stage_id: toStageId,
          position: position,
        })
        .eq("id", dealId)
        .select()
        .single();

      if (error) throw error;
      return data as Deal;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deals", "stage", variables.fromStageId] });
      queryClient.invalidateQueries({ queryKey: ["deals", "stage", variables.toStageId] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao mover negócio: ${error.message}`);
    },
  });
};

// Mark deal as won
export const useMarkDealAsWon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dealId,
      closedDate,
    }: {
      dealId: string;
      closedDate?: string;
    }) => {
      const { data, error } = await supabase
        .from("deals")
        .update({
          status: 'won',
          probability: 100,
          closed_date: closedDate || new Date().toISOString(),
        })
        .eq("id", dealId)
        .select()
        .single();

      if (error) throw error;
      return data as Deal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("🎉 Negócio ganho! Parabéns!");
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
};

// Mark deal as lost
export const useMarkDealAsLost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dealId,
      lostReason,
    }: {
      dealId: string;
      lostReason?: string;
    }) => {
      const { data, error } = await supabase
        .from("deals")
        .update({
          status: 'lost',
          probability: 0,
          lost_reason: lostReason,
          closed_date: new Date().toISOString(),
        })
        .eq("id", dealId)
        .select()
        .single();

      if (error) throw error;
      return data as Deal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      toast.success("Negócio marcado como perdido");
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
};

// ========================================
// DEAL PARTICIPANTS (Participantes)
// ========================================

// Fetch participants of a deal
export const useDealParticipants = (dealId: string | undefined) => {
  return useQuery({
    queryKey: ["deal-participants", dealId],
    queryFn: async () => {
      if (!dealId) throw new Error("Deal ID required");

      const { data, error } = await supabase
        .from("deal_participants")
        .select(`
          *,
          lead:leads(*)
        `)
        .eq("deal_id", dealId);

      if (error) throw error;
      return data;
    },
    enabled: !!dealId,
  });
};

// Add participant to deal
export const useAddDealParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      dealId,
      leadId,
      userId,
      role,
      isPrimary,
    }: {
      dealId: string;
      leadId: string;
      userId: string;
      role?: string;
      isPrimary?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("deal_participants")
        .insert({
          deal_id: dealId,
          lead_id: leadId,
          user_id: userId,
          role: role || 'participant',
          is_primary: isPrimary || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["deal-participants", variables.dealId] });
      toast.success("Participante adicionado ao negócio!");
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
};

// Remove participant from deal
export const useRemoveDealParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      participantId,
      dealId,
    }: {
      participantId: string;
      dealId: string;
    }) => {
      const { error } = await supabase
        .from("deal_participants")
        .delete()
        .eq("id", participantId);

      if (error) throw error;
      return participantId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["deal-participants", variables.dealId] });
      toast.success("Participante removido");
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
};

// ========================================
// FAVORITAR / DUPLICAR
// ========================================

// Toggle favorite status
export const useToggleFavoriteDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dealId, isFavorite }: { dealId: string; isFavorite: boolean }) => {
      const { data, error } = await supabase
        .from("deals")
        .update({ is_favorite: !isFavorite } as any)
        .eq("id", dealId)
        .select()
        .single();

      if (error) throw error;
      return data as Deal;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deal", data.id] });
      toast.success(data.is_favorite ? "⭐ Adicionado aos favoritos" : "Removido dos favoritos");
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
};

// Duplicate deal
export const useDuplicateDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dealId }: { dealId: string }) => {
      // Fetch original deal
      const { data: originalDeal, error: fetchError } = await supabase
        .from("deals")
        .select("*")
        .eq("id", dealId)
        .single();

      if (fetchError) throw fetchError;

      // Create duplicate (remove id and timestamps, add " - Cópia" to title)
      const { id, created_at, updated_at, closed_date, ...dealData } = originalDeal;
      
      const { data: newDeal, error: createError } = await supabase
        .from("deals")
        .insert({
          ...dealData,
          title: `${dealData.title} - Cópia`,
          status: 'open', // Reset to open
          probability: dealData.probability || 50,
          closed_date: null,
          lost_reason: null,
          is_favorite: false, // Don't carry favorite status
        })
        .select()
        .single();

      if (createError) throw createError;
      return newDeal as Deal;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      queryClient.invalidateQueries({ queryKey: ["deals", "stage", data.stage_id] });
      toast.success(`📋 Oportunidade duplicada: "${data.title}"`);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao duplicar: ${error.message}`);
    },
  });
};

