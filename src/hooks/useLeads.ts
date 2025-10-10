import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types
export interface Lead {
  id: string;
  stage_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  job_title: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url?: string | null;
  position?: number;
  created_at: string;
  updated_at: string;
  
  // Campos do banco de dados
  activities_count?: number;
  custom_fields?: any;
  is_archived?: boolean;
  last_contact_date?: string;
  next_follow_up?: string | null;
  notes_count?: number;
  pipeline_id: string;
  priority?: string;
  revenue?: number;
  source?: string;
  tags?: string[];
  temperature?: string;
  
  // Campos de enriquecimento
  full_name?: string | null;
  headline?: string | null;
  about?: string | null;
  location?: string | null;
  education?: string | null;
  connections?: string | null;
  avatar_url?: string | null;
  seniority?: string | null;
  department?: string | null;
  twitter_url?: string | null;
  company_size?: string | null;
  company_industry?: string | null;
  company_location?: string | null;
}

// Fetch all leads for a user
export const useLeads = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["leads", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID required");

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("user_id", userId)
        .order("position", { ascending: true });

      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!userId,
  });
};

// Fetch leads by stage
export const useLeadsByStage = (stageId: string | undefined) => {
  return useQuery({
    queryKey: ["leads", "stage", stageId],
    queryFn: async () => {
      if (!stageId) throw new Error("Stage ID required");

      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("stage_id", stageId)
        .order("position", { ascending: true });

      if (error) throw error;
      return data as Lead[];
    },
    enabled: !!stageId,
  });
};

// Create a new lead
export const useCreateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newLead: {
      stage_id: string;
      pipeline_id: string;
      user_id: string;
      first_name: string;
      last_name: string;
      job_title?: string;
      company?: string;
      email?: string;
      phone?: string;
      linkedin_url?: string;
      position?: number;
    }) => {
      const { data, error } = await supabase
        .from("leads")
        .insert(newLead as any)
        .select()
        .single();

      if (error) throw error;
      return data as Lead;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads", "stage", data.stage_id] });
      toast.success("Lead adicionado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar lead: ${error.message}`);
    },
  });
};

// Update a lead
export const useUpdateLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<Lead, "id" | "user_id" | "created_at" | "updated_at">>;
    }) => {
      const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Lead;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads", "stage", data.stage_id] });
      toast.success("Lead atualizado!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar lead: ${error.message}`);
    },
  });
};

// Move lead to different stage
export const useMoveLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      leadId,
      newStageId,
      oldStageId,
      newPosition,
    }: {
      leadId: string;
      newStageId: string;
      oldStageId: string;
      newPosition: number;
    }) => {
      const { data, error } = await supabase
        .from("leads")
        .update({ stage_id: newStageId, position: newPosition })
        .eq("id", leadId)
        .select()
        .single();

      if (error) throw error;
      return data as Lead;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads", "stage", variables.newStageId] });
      queryClient.invalidateQueries({ queryKey: ["leads", "stage", variables.oldStageId] });
    },
    onError: (error: Error) => {
      toast.error(`Erro ao mover lead: ${error.message}`);
    },
  });
};

// Delete a lead
export const useDeleteLead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, stageId }: { id: string; stageId: string }) => {
      const { error } = await supabase.from("leads").delete().eq("id", id);

      if (error) throw error;
      return { id, stageId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads", "stage", data.stageId] });
      toast.success("Lead excluído!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir lead: ${error.message}`);
    },
  });
};

