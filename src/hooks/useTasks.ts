/**
 * useTasks Hook
 * 
 * Custom hooks para gerenciamento de tarefas usando React Query.
 * Inclui queries, mutations, invalidação de cache e estados otimizados.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import type { Task, TaskFormData, TaskFilters } from "@/types/task";
import {
  fetchTasks,
  fetchTasksWithRelations,
  fetchTaskById,
  createTask,
  updateTask,
  deleteTask,
  completeTask,
  reopenTask,
  fetchOverdueTasks,
  fetchTasksDueToday,
  fetchUpcomingTasks,
  fetchTaskStats,
} from "@/services/taskService";

/**
 * Hook para buscar tarefas básicas com filtros e paginação
 * 
 * @param filters - Filtros opcionais
 * @param page - Número da página (padrão: 1)
 * @param pageSize - Itens por página (padrão: 20)
 * @returns Query com tasks, total, isLoading, error
 */
export function useTasks(
  filters?: TaskFilters,
  page = 1,
  pageSize = 20
) {
  return useQuery({
    queryKey: ["tasks", filters, page, pageSize],
    queryFn: () => fetchTasks(filters, page, pageSize),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para buscar tarefas com relacionamentos (lead, company, deal)
 * 
 * @param filters - Filtros opcionais
 * @param page - Número da página
 * @param pageSize - Itens por página
 * @returns Query com tasks enriquecidas, total, isLoading, error
 */
export function useTasksWithRelations(
  filters?: TaskFilters,
  page = 1,
  pageSize = 20
) {
  return useQuery({
    queryKey: ["tasks-with-relations", filters, page, pageSize],
    queryFn: () => fetchTasksWithRelations(filters, page, pageSize),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para buscar uma tarefa específica por ID
 * 
 * @param id - ID da tarefa
 * @returns Query com task, isLoading, error
 */
export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: ["task", id],
    queryFn: () => (id ? fetchTaskById(id) : null),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para buscar tarefas do usuário logado
 * 
 * @param filters - Filtros adicionais
 * @param page - Número da página
 * @param pageSize - Itens por página
 * @returns Query com tasks do usuário
 */
export function useUserTasks(
  filters?: Omit<TaskFilters, "user_id">,
  page = 1,
  pageSize = 20
) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-tasks", user?.id, filters, page, pageSize],
    queryFn: () =>
      user?.id
        ? fetchTasks({ ...filters, user_id: user.id }, page, pageSize)
        : { tasks: [], total: 0 },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para buscar tarefas vencidas do usuário
 * 
 * @returns Query com tarefas vencidas (overdue)
 */
export function useOverdueTasks() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["overdue-tasks", user?.id],
    queryFn: () => (user?.id ? fetchOverdueTasks(user.id) : []),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para buscar tarefas que vencem hoje
 * 
 * @returns Query com tarefas que vencem hoje
 */
export function useTasksDueToday() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["tasks-due-today", user?.id],
    queryFn: () => (user?.id ? fetchTasksDueToday(user.id) : []),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para buscar próximas tarefas (para widgets)
 * 
 * @param limit - Número máximo de tarefas (padrão: 5)
 * @returns Query com próximas tarefas
 */
export function useUpcomingTasks(limit = 5) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["upcoming-tasks", user?.id, limit],
    queryFn: () => (user?.id ? fetchUpcomingTasks(user.id, limit) : []),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 3, // 3 minutos
  });
}

/**
 * Hook para buscar estatísticas de tarefas
 * 
 * @returns Query com estatísticas agregadas
 */
export function useTaskStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["task-stats", user?.id],
    queryFn: () =>
      user?.id
        ? fetchTaskStats(user.id)
        : {
            total: 0,
            todo: 0,
            in_progress: 0,
            done: 0,
            cancelled: 0,
            overdue: 0,
            dueToday: 0,
            dueThisWeek: 0,
            byPriority: { low: 0, medium: 0, high: 0, urgent: 0 },
            completionRate: 0,
          },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para criar uma nova tarefa
 * 
 * @returns Mutation com função mutate e estados
 */
export function useCreateTask() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (taskData: TaskFormData) => {
      if (!user?.id) {
        throw new Error("Usuário não autenticado");
      }
      return createTask(taskData, user.id);
    },
    onSuccess: () => {
      // Invalidar todas as queries relacionadas a tarefas
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["user-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["overdue-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-due-today"] });

      toast({
        title: "✅ Tarefa criada",
        description: "A tarefa foi criada com sucesso.",
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error creating task:", error);
      toast({
        title: "❌ Erro ao criar tarefa",
        description: error.message || "Ocorreu um erro ao criar a tarefa.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook para atualizar uma tarefa existente
 * 
 * @returns Mutation com função mutate e estados
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<TaskFormData>;
    }) => updateTask(id, updates),
    onSuccess: (_, variables) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["user-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["overdue-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-due-today"] });

      toast({
        title: "✅ Tarefa atualizada",
        description: "A tarefa foi atualizada com sucesso.",
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error updating task:", error);
      toast({
        title: "❌ Erro ao atualizar tarefa",
        description: error.message || "Ocorreu um erro ao atualizar a tarefa.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook para deletar uma tarefa
 * 
 * @returns Mutation com função mutate e estados
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["user-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["overdue-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-due-today"] });

      toast({
        title: "✅ Tarefa deletada",
        description: "A tarefa foi removida com sucesso.",
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error deleting task:", error);
      toast({
        title: "❌ Erro ao deletar tarefa",
        description: error.message || "Ocorreu um erro ao deletar a tarefa.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook para marcar tarefa como concluída
 * 
 * @returns Mutation com função mutate e estados
 */
export function useCompleteTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => completeTask(id),
    onSuccess: (task) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["user-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", task?.id] });
      queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["overdue-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-due-today"] });

      toast({
        title: "✅ Tarefa concluída",
        description: "Parabéns! A tarefa foi marcada como concluída.",
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error completing task:", error);
      toast({
        title: "❌ Erro ao concluir tarefa",
        description: error.message || "Ocorreu um erro ao concluir a tarefa.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook para reabrir uma tarefa concluída
 * 
 * @returns Mutation com função mutate e estados
 */
export function useReopenTask() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => reopenTask(id),
    onSuccess: (task) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["user-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", task?.id] });
      queryClient.invalidateQueries({ queryKey: ["task-stats"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-tasks"] });

      toast({
        title: "🔄 Tarefa reaberta",
        description: "A tarefa foi reaberta e está pendente novamente.",
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error reopening task:", error);
      toast({
        title: "❌ Erro ao reabrir tarefa",
        description: error.message || "Ocorreu um erro ao reabrir a tarefa.",
        variant: "destructive",
      });
    },
  });
}
