// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "./use-toast";
import type {
  Workflow,
  CreateWorkflowInput,
  UpdateWorkflowInput,
  WorkflowExecution,
  ExecuteWorkflowInput,
  WorkflowStats,
  WorkflowsOverview,
} from "@/types/workflow";

// =====================================================
// WORKFLOWS CRUD
// =====================================================

/**
 * Hook para listar workflows
 */
export const useWorkflows = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["workflows", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Workflow[];
    },
    enabled: !!user?.id,
  });
};

/**
 * Hook para buscar workflow por ID
 */
export const useWorkflow = (workflowId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["workflow", workflowId],
    queryFn: async () => {
      if (!workflowId) throw new Error("Workflow ID is required");
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("workflows")
        .select("*")
        .eq("id", workflowId)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data as Workflow;
    },
    enabled: !!workflowId && !!user?.id,
  });
};

/**
 * Hook para criar workflow
 */
export const useCreateWorkflow = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateWorkflowInput) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("workflows")
        .insert({
          user_id: user.id,
          name: input.name,
          description: input.description,
          entity_type: input.entityType,
          trigger_type: input.triggerType,
          trigger_config: input.triggerConfig,
          actions: input.actions,
          is_active: input.isActive ?? true,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Workflow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast({
        title: "Workflow criado",
        description: "O workflow foi criado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao criar workflow",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook para atualizar workflow
 */
export const useUpdateWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateWorkflowInput;
    }) => {
      const { data, error } = await supabase
        .from("workflows")
        .update({
          name: updates.name,
          description: updates.description,
          trigger_config: updates.triggerConfig,
          actions: updates.actions,
          is_active: updates.isActive,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Workflow;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      queryClient.invalidateQueries({ queryKey: ["workflow", variables.id] });
      toast({
        title: "Workflow atualizado",
        description: "As alterações foram salvas com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar workflow",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook para deletar workflow
 */
export const useDeleteWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workflowId: string) => {
      const { error } = await supabase
        .from("workflows")
        .delete()
        .eq("id", workflowId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      toast({
        title: "Workflow deletado",
        description: "O workflow foi removido com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao deletar workflow",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook para ativar/desativar workflow
 */
export const useToggleWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { data, error } = await supabase
        .from("workflows")
        .update({ is_active: isActive })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Workflow;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      queryClient.invalidateQueries({ queryKey: ["workflow", data.id] });
      toast({
        title: data.is_active ? "Workflow ativado" : "Workflow desativado",
        description: data.is_active
          ? "O workflow está ativo e será executado automaticamente."
          : "O workflow foi desativado e não será executado.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao alterar status do workflow",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// =====================================================
// WORKFLOW EXECUTIONS
// =====================================================

/**
 * Hook para listar execuções de um workflow
 */
export const useWorkflowExecutions = (workflowId?: string, limit: number = 50) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["workflow-executions", workflowId, limit],
    queryFn: async () => {
      if (!workflowId) throw new Error("Workflow ID is required");
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("workflow_executions")
        .select("*")
        .eq("workflow_id", workflowId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as WorkflowExecution[];
    },
    enabled: !!workflowId && !!user?.id,
  });
};

/**
 * Hook para buscar execução por ID
 */
export const useWorkflowExecution = (executionId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["workflow-execution", executionId],
    queryFn: async () => {
      if (!executionId) throw new Error("Execution ID is required");
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("workflow_executions")
        .select("*")
        .eq("id", executionId)
        .single();

      if (error) throw error;
      return data as WorkflowExecution;
    },
    enabled: !!executionId && !!user?.id,
  });
};

/**
 * Hook para executar workflow manualmente
 */
export const useExecuteWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ExecuteWorkflowInput) => {
      // Chamar Edge Function para executar workflow
      const { data, error } = await supabase.functions.invoke("process-workflow", {
        body: {
          workflowId: input.workflowId,
          entityId: input.entityId,
          triggerData: input.triggerData,
          manual: true,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workflow-executions", variables.workflowId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workflow", variables.workflowId],
      });
      toast({
        title: "Workflow executado",
        description: "O workflow foi executado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao executar workflow",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// =====================================================
// WORKFLOW STATISTICS
// =====================================================

/**
 * Hook para buscar estatísticas de um workflow
 */
export const useWorkflowStats = (workflowId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["workflow-stats", workflowId],
    queryFn: async () => {
      if (!workflowId) throw new Error("Workflow ID is required");
      if (!user?.id) throw new Error("User not authenticated");

      // Buscar workflow
      const { data: workflow, error: workflowError } = await supabase
        .from("workflows")
        .select("*")
        .eq("id", workflowId)
        .single();

      if (workflowError) throw workflowError;

      // Buscar execuções
      const { data: executions, error: executionsError } = await supabase
        .from("workflow_executions")
        .select("*")
        .eq("workflow_id", workflowId);

      if (executionsError) throw executionsError;

      // Calcular estatísticas
      const totalExecutions = executions.length;
      const successfulExecutions = executions.filter(
        (e) => e.status === "completed"
      ).length;
      const failedExecutions = executions.filter(
        (e) => e.status === "failed"
      ).length;

      const executionTimes = executions
        .filter((e) => e.execution_time_ms)
        .map((e) => e.execution_time_ms!);

      const averageExecutionTimeMs =
        executionTimes.length > 0
          ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length
          : 0;

      const successRate =
        totalExecutions > 0 ? (successfulExecutions / totalExecutions) * 100 : 0;

      const lastExecution = executions[0] || null;

      return {
        workflowId,
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        averageExecutionTimeMs,
        lastExecution,
        successRate,
      } as WorkflowStats;
    },
    enabled: !!workflowId && !!user?.id,
  });
};

/**
 * Hook para buscar overview geral de workflows
 */
export const useWorkflowsOverview = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["workflows-overview", user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error("User not authenticated");

      // Buscar todos os workflows
      const { data: workflows, error: workflowsError } = await supabase
        .from("workflows")
        .select("*")
        .eq("user_id", user.id);

      if (workflowsError) throw workflowsError;

      // Buscar execuções
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const { data: allExecutions, error: executionsError } = await supabase
        .from("workflow_executions")
        .select("*")
        .in(
          "workflow_id",
          workflows.map((w) => w.id)
        );

      if (executionsError) throw executionsError;

      // Calcular estatísticas
      const totalWorkflows = workflows.length;
      const activeWorkflows = workflows.filter((w) => w.is_active).length;
      const inactiveWorkflows = totalWorkflows - activeWorkflows;

      const totalExecutionsToday = allExecutions.filter(
        (e) => new Date(e.created_at) >= todayStart
      ).length;

      const totalExecutionsThisWeek = allExecutions.filter(
        (e) => new Date(e.created_at) >= weekStart
      ).length;

      const totalExecutionsThisMonth = allExecutions.filter(
        (e) => new Date(e.created_at) >= monthStart
      ).length;

      // Workflows mais usados
      const executionsByWorkflow = workflows.map((workflow) => ({
        workflow,
        executionCount: allExecutions.filter((e) => e.workflow_id === workflow.id)
          .length,
      }));

      const mostUsedWorkflows = executionsByWorkflow
        .sort((a, b) => b.executionCount - a.executionCount)
        .slice(0, 5);

      return {
        totalWorkflows,
        activeWorkflows,
        inactiveWorkflows,
        totalExecutionsToday,
        totalExecutionsThisWeek,
        totalExecutionsThisMonth,
        mostUsedWorkflows,
      } as WorkflowsOverview;
    },
    enabled: !!user?.id,
  });
};

// =====================================================
// WORKFLOW TEMPLATES
// =====================================================

/**
 * Hook para criar workflow a partir de template
 */
export const useCreateFromTemplate = () => {
  const createWorkflow = useCreateWorkflow();

  return useMutation({
    mutationFn: async (template: {
      name: string;
      description: string;
      entityType: string;
      triggerType: string;
      triggerConfig: any;
      actions: any[];
    }) => {
      return createWorkflow.mutateAsync({
        name: template.name,
        description: template.description,
        entityType: template.entityType as any,
        triggerType: template.triggerType as any,
        triggerConfig: template.triggerConfig,
        actions: template.actions,
        isActive: false, // Criar desativado para revisão
      });
    },
    onSuccess: () => {
      toast({
        title: "Workflow criado a partir do template",
        description: "Revise as configurações e ative quando estiver pronto.",
      });
    },
  });
};

/**
 * Hook para duplicar workflow
 */
export const useDuplicateWorkflow = () => {
  const { user } = useAuth();
  const createWorkflow = useCreateWorkflow();

  return useMutation({
    mutationFn: async (workflowId: string) => {
      if (!user?.id) throw new Error("User not authenticated");

      // Buscar workflow original
      const { data: original, error } = await supabase
        .from("workflows")
        .select("*")
        .eq("id", workflowId)
        .single();

      if (error) throw error;

      // Criar cópia
      return createWorkflow.mutateAsync({
        name: `${original.name} (cópia)`,
        description: original.description,
        entityType: original.entity_type as any,
        triggerType: original.trigger_type as any,
        triggerConfig: original.trigger_config,
        actions: original.actions,
        isActive: false, // Criar desativado
      });
    },
    onSuccess: () => {
      toast({
        title: "Workflow duplicado",
        description: "O workflow foi duplicado com sucesso!",
      });
    },
  });
};
