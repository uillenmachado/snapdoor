// =====================================================
// HOOK: useAutomations
// Hook para gerenciar automações de workflow
// =====================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, AutomationData } from "@/lib/api";
import { toast } from "sonner";

export interface Automation extends AutomationData {
  id: string;
  userId: string;
  executionCount: number;
  lastExecutedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const useAutomations = () => {
  return useQuery<{ automations: Automation[] }>({
    queryKey: ["automations"],
    queryFn: async () => {
      const data = await api.getAutomations();
      return data as { automations: Automation[] };
    },
  });
};

export const useCreateAutomation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AutomationData) => {
      return await api.createAutomation(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      toast.success("Automação criada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao criar automação: ${error.message}`);
    },
  });
};

export const useUpdateAutomation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<AutomationData>;
    }) => {
      return await api.updateAutomation(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      toast.success("Automação atualizada!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar automação: ${error.message}`);
    },
  });
};

export const useDeleteAutomation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return await api.deleteAutomation(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations"] });
      toast.success("Automação excluída!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir automação: ${error.message}`);
    },
  });
};


