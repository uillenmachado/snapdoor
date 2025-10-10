import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Types
export interface Pipeline {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Stage {
  id: string;
  pipeline_id: string;
  name: string;
  color: string;
  position: number;
  created_at: string;
  updated_at: string;
}

// Fetch user's pipeline with stages
export const usePipeline = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["pipeline", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID required");

      const { data: pipelines, error: pipelineError } = await supabase
        .from("pipelines")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(1);

      if (pipelineError) throw pipelineError;

      // If no pipeline exists, create default one
      if (!pipelines || pipelines.length === 0) {
        const { data: newPipeline, error: createError } = await supabase
          .from("pipelines")
          .insert({ user_id: userId, name: "Pipeline Principal" })
          .select()
          .single();

        if (createError) throw createError;

        // Create default stages
        const defaultStages = [
          { pipeline_id: newPipeline.id, name: "Qualificado", position: 1, color: "#6B46F2" },
          { pipeline_id: newPipeline.id, name: "Contato Feito", position: 2, color: "#00A86B" },
          { pipeline_id: newPipeline.id, name: "Demo Agendada", position: 3, color: "#F97316" },
          { pipeline_id: newPipeline.id, name: "Proposta Enviada", position: 4, color: "#EAB308" },
          { pipeline_id: newPipeline.id, name: "Ganho", position: 5, color: "#22C55E" },
        ];

        const { error: stagesError } = await supabase
          .from("stages")
          .insert(defaultStages);

        if (stagesError) throw stagesError;

        return newPipeline;
      }

      return pipelines[0];
    },
    enabled: !!userId,
  });
};

// Fetch stages for a pipeline
export const useStages = (pipelineId: string | undefined) => {
  return useQuery({
    queryKey: ["stages", pipelineId],
    queryFn: async () => {
      if (!pipelineId) throw new Error("Pipeline ID required");

      const { data, error } = await supabase
        .from("stages")
        .select("*")
        .eq("pipeline_id", pipelineId)
        .order("position", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!pipelineId,
  });
};

// Create a new stage
export const useCreateStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newStage: {
      pipeline_id: string;
      name: string;
      position: number;
      color?: string;
    }) => {
      const { data, error } = await supabase
        .from("stages")
        .insert(newStage)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["stages", data.pipeline_id] });
      toast.success("Etapa criada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar etapa: ${error.message}`);
    },
  });
};

// Update a stage
export const useUpdateStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<Stage, "id" | "created_at" | "updated_at">>;
    }) => {
      const { data, error } = await supabase
        .from("stages")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["stages", data.pipeline_id] });
      toast.success("Etapa atualizada!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar etapa: ${error.message}`);
    },
  });
};

// Delete a stage
export const useDeleteStage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, pipelineId }: { id: string; pipelineId: string }) => {
      const { error } = await supabase.from("stages").delete().eq("id", id);

      if (error) throw error;
      return { id, pipelineId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["stages", data.pipelineId] });
      toast.success("Etapa excluída!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir etapa: ${error.message}`);
    },
  });
};

// Update pipeline
export const useUpdatePipeline = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<Pipeline, "id" | "user_id" | "created_at" | "updated_at">>;
    }) => {
      const { data, error } = await supabase
        .from("pipelines")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["pipeline", data.user_id] });
      toast.success("Pipeline atualizado!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar pipeline: ${error.message}`);
    },
  });
};

