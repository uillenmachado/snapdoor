import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EnrichmentData } from "@/types/enrichment";

// Company type for JOIN
export interface Company {
  id: string;
  name: string;
  domain: string | null;
  logo_url: string | null;
  industry: string | null;
}

// Types - Alinhado com schema do banco de dados
export interface Lead {
  id: string;
  user_id: string;
  
  // Informações básicas da PESSOA
  name: string; // Nome completo
  email: string;
  phone: string | null;
  position: string | null; // Cargo
  company: string | null; // Empresa onde trabalha (nome string)
  company_id?: string | null; // FK para companies table
  
  // Status e organização
  status: string; // active, inactive, new, won, lost
  source: string | null; // De onde veio o lead
  tags: string[] | null;
  
  // Dados de enriquecimento (LinkedIn, Hunter.io)
  enrichment_data: EnrichmentData | null;
  last_interaction: string | null;
  
  // Campos de NEGÓCIO (Deal)
  deal_value?: number; // Valor do negócio em reais
  expected_close_date?: string | null; // Data prevista de fechamento
  probability?: number; // Probabilidade de fechamento (0-100)
  deal_stage?: string; // Etapa do negócio
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Campos legacy e enriquecimento (mantidos para retrocompatibilidade)
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar_url?: string;
  headline?: string;
  location?: string;
  about?: string;
  connections?: string;
  stage_id?: string;
  pipeline_id?: string;
  job_title?: string | null;
  linkedin_url?: string | null;
  is_archived?: boolean;
  temperature?: string;
  
  // JOIN with companies table (optional - populated when using JOIN)
  companies?: Company | null;
}

// Activity types
export interface Activity {
  id: string;
  lead_id: string;
  user_id: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'note' | 'whatsapp';
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  duration: number | null;
  outcome: string | null;
  created_at: string;
  updated_at: string;
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
      return data as unknown as Lead[];
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

