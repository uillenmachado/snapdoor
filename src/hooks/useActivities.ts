import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types
export interface Activity {
  id: string;
  lead_id: string;
  user_id: string;
  type: "message" | "email" | "call" | "meeting" | "comment";
  description: string;
  completed: boolean | null;
  created_at: string;
}

// Fetch activities for a lead
export const useActivities = (leadId: string | undefined) => {
  return useQuery({
    queryKey: ["activities", leadId],
    queryFn: async () => {
      if (!leadId) throw new Error("Lead ID required");

      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Activity[];
    },
    enabled: !!leadId,
  });
};

// Fetch all activities for a user
export const useUserActivities = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["activities", "user", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID required");

      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          leads (
            first_name,
            last_name,
            company
          )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

// Create an activity
export const useCreateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newActivity: {
      lead_id: string;
      user_id: string;
      type: "message" | "email" | "call" | "meeting" | "comment";
      description: string;
      completed?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("activities")
        .insert(newActivity)
        .select()
        .single();

      if (error) throw error;
      return data as Activity;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["activities", data.lead_id] });
      queryClient.invalidateQueries({ queryKey: ["activities", "user"] });
      toast.success("Atividade registrada!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao registrar atividade: ${error.message}`);
    },
  });
};

// Update an activity
export const useUpdateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Pick<Activity, "description" | "completed" | "type">>;
    }) => {
      const { data, error } = await supabase
        .from("activities")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Activity;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["activities", data.lead_id] });
      queryClient.invalidateQueries({ queryKey: ["activities", "user"] });
      toast.success("Atividade atualizada!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar atividade: ${error.message}`);
    },
  });
};

// Delete an activity
export const useDeleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, leadId }: { id: string; leadId: string }) => {
      const { error } = await supabase.from("activities").delete().eq("id", id);

      if (error) throw error;
      return { id, leadId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["activities", data.leadId] });
      queryClient.invalidateQueries({ queryKey: ["activities", "user"] });
      toast.success("Atividade excluída!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir atividade: ${error.message}`);
    },
  });
};

// ============================================
// NOVOS HOOKS PARA FASE 5 - Timeline Avançada
// ============================================

import type {
  Activity as ActivityExtended,
  ActivityFilters,
  ActivityType,
} from "@/types/activity";
import {
  fetchActivitiesWithRelations,
  fetchActivityStats,
  logActivity as logActivityService,
} from "@/services/activityService";

/**
 * Hook para buscar atividades com filtros e paginação (versão avançada)
 */
export const useActivitiesAdvanced = (
  filters: ActivityFilters = {},
  page: number = 1,
  pageSize: number = 20
) => {
  return useQuery({
    queryKey: ["activities", "advanced", filters, page, pageSize],
    queryFn: () => fetchActivitiesWithRelations(filters, page, pageSize),
    staleTime: 1000 * 60, // 1 minuto
  });
};

/**
 * Hook para estatísticas de atividades
 */
export const useActivityStats = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["activities", "stats", userId],
    queryFn: () => {
      if (!userId) throw new Error("User ID required");
      return fetchActivityStats(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

/**
 * Hook para criar log automático de atividade
 */
export const useLogActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      type,
      title,
      description,
      metadata,
    }: {
      userId: string;
      type: ActivityType;
      title: string;
      description?: string;
      metadata?: Record<string, any>;
    }) => {
      return logActivityService(userId, type, title, description, metadata);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
    },
  });
};
