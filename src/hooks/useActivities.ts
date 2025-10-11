import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types
export interface Activity {
  id: string;
  lead_id: string;
  user_id: string;
  type: "call" | "email" | "meeting" | "task" | "note" | "whatsapp" | "message" | "comment";
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  duration: number | null; // em minutos
  outcome: string | null; // resultado da atividade
  created_at: string;
  updated_at: string;
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

// Count pending activities by lead
export const usePendingActivitiesCount = (leadId: string | undefined) => {
  return useQuery({
    queryKey: ["activities", "count", leadId],
    queryFn: async () => {
      if (!leadId) throw new Error("Lead ID required");

      const { count, error } = await supabase
        .from("activities")
        .select("*", { count: "exact", head: true })
        .eq("lead_id", leadId)
        .eq("completed", false);

      if (error) throw error;
      return count || 0;
    },
    enabled: !!leadId,
  });
};

// Complete activity
export const useCompleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      leadId,
      outcome,
    }: {
      id: string;
      leadId: string;
      outcome?: string;
    }) => {
      const { data, error} = await supabase
        .from("activities")
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          outcome: outcome || null,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { ...data, leadId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["activities", data.leadId] });
      queryClient.invalidateQueries({ queryKey: ["activities", "user"] });
      queryClient.invalidateQueries({ queryKey: ["activities", "count", data.leadId] });
      toast.success("Atividade concluída! ✓");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao concluir atividade: ${error.message}`);
    },
  });
};

