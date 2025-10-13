// @ts-nocheck
/**
 * Task Service
 * 
 * Service layer para o sistema de tarefas com operações CRUD,
 * filtros avançados, estatísticas e queries otimizadas.
 * 
 * @ts-nocheck: Temporário até migração expandir a tabela tasks
 */

import { supabase } from "@/integrations/supabase/client";
import type { Task, TaskFormData, TaskFilters, TaskStatus } from "@/types/task";

/**
 * Busca tarefas com filtros e paginação
 * 
 * @param filters - Filtros opcionais (status, priority, due_date range, search)
 * @param page - Número da página (1-based)
 * @param pageSize - Itens por página
 * @returns Lista de tarefas e contagem total
 */
export async function fetchTasks(
  filters?: TaskFilters,
  page = 1,
  pageSize = 20
): Promise<{ tasks: Task[]; total: number }> {
  let query = supabase
    .from("tasks")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  // Aplicar filtros
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.priority) {
    query = query.eq("priority", filters.priority);
  }

  if (filters?.user_id) {
    query = query.eq("user_id", filters.user_id);
  }

  if (filters?.lead_id) {
    query = query.eq("lead_id", filters.lead_id);
  }

  if (filters?.company_id) {
    query = query.eq("company_id", filters.company_id);
  }

  if (filters?.deal_id) {
    query = query.eq("deal_id", filters.deal_id);
  }

  if (filters?.due_date_from) {
    query = query.gte("due_date", filters.due_date_from);
  }

  if (filters?.due_date_to) {
    query = query.lte("due_date", filters.due_date_to);
  }

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  // Paginação
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("❌ [taskService] Error fetching tasks:", error);
    throw error;
  }

  return {
    tasks: (data as Task[]) || [],
    total: count || 0,
  };
}

/**
 * Busca tarefas com relacionamentos populados (lead, company, deal)
 * 
 * NOTA: Esta implementação faz N+1 queries. Para produção, considere:
 * 1. Criar uma VIEW no PostgreSQL que faça os JOINs
 * 2. Usar Edge Functions para fazer a agregação
 * 3. Implementar GraphQL com DataLoader
 * 
 * @param filters - Filtros opcionais
 * @param page - Número da página
 * @param pageSize - Itens por página
 * @returns Lista de tarefas enriquecidas e contagem total
 */
export async function fetchTasksWithRelations(
  filters?: TaskFilters,
  page = 1,
  pageSize = 20
): Promise<{ tasks: Task[]; total: number }> {
  // 1. Buscar tarefas básicas
  const { tasks, total } = await fetchTasks(filters, page, pageSize);

  // 2. Enriquecer cada tarefa com relacionamentos (N+1 queries - cuidado!)
  const enrichedTasks = await Promise.all(
    tasks.map(async (task) => {
      const enriched = { ...task };

      // Buscar lead relacionado
      if (task.lead_id) {
        const { data: lead } = await supabase
          .from("leads")
          .select("id, name, email")
          .eq("id", task.lead_id)
          .single();
        enriched.lead = lead;
      }

      // Buscar company relacionada
      if (task.company_id) {
        const { data: company } = await supabase
          .from("companies")
          .select("id, name, website")
          .eq("id", task.company_id)
          .single();
        enriched.company = company;
      }

      // Buscar deal relacionado
      if (task.deal_id) {
        const { data: deal } = await supabase
          .from("deals")
          .select("id, title, value")
          .eq("id", task.deal_id)
          .single();
        enriched.deal = deal;
      }

      return enriched;
    })
  );

  return {
    tasks: enrichedTasks,
    total,
  };
}

/**
 * Busca uma tarefa por ID
 * 
 * @param id - ID da tarefa
 * @returns Tarefa encontrada ou null
 */
export async function fetchTaskById(id: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`❌ [taskService] Error fetching task ${id}:`, error);
    return null;
  }

  return data as Task;
}

/**
 * Cria uma nova tarefa
 * 
 * @param taskData - Dados da tarefa (sem id e timestamps)
 * @param userId - ID do usuário criador
 * @returns Tarefa criada ou null em caso de erro
 */
export async function createTask(
  taskData: TaskFormData,
  userId: string
): Promise<Task | null> {
  const taskToCreate = {
    ...taskData,
    user_id: userId,
    status: taskData.status || "todo",
    priority: taskData.priority || "medium",
  };

  const { data, error } = await supabase
    .from("tasks")
    .insert(taskToCreate)
    .select()
    .single();

  if (error) {
    console.error("❌ [taskService] Error creating task:", error);
    throw error;
  }

  console.log("✅ [taskService] Task created:", data.id);
  return data as Task;
}

/**
 * Atualiza uma tarefa existente
 * 
 * @param id - ID da tarefa
 * @param updates - Campos a atualizar
 * @returns Tarefa atualizada ou null em caso de erro
 */
export async function updateTask(
  id: string,
  updates: Partial<TaskFormData>
): Promise<Task | null> {
  // Se status mudou para "done", registrar completed_at
  if (updates.status === "done") {
    updates.completed_at = new Date().toISOString();
  }

  // Se status mudou de "done" para outro, limpar completed_at
  if (updates.status && updates.status !== "done") {
    updates.completed_at = null;
  }

  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`❌ [taskService] Error updating task ${id}:`, error);
    throw error;
  }

  console.log("✅ [taskService] Task updated:", id);
  return data as Task;
}

/**
 * Deleta uma tarefa
 * 
 * @param id - ID da tarefa
 * @returns true se deletado com sucesso
 */
export async function deleteTask(id: string): Promise<boolean> {
  const { error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    console.error(`❌ [taskService] Error deleting task ${id}:`, error);
    throw error;
  }

  console.log("✅ [taskService] Task deleted:", id);
  return true;
}

/**
 * Marca uma tarefa como concluída
 * 
 * @param id - ID da tarefa
 * @returns Tarefa atualizada
 */
export async function completeTask(id: string): Promise<Task | null> {
  return updateTask(id, {
    status: "done",
    completed_at: new Date().toISOString(),
  });
}

/**
 * Reabre uma tarefa concluída
 * 
 * @param id - ID da tarefa
 * @returns Tarefa atualizada
 */
export async function reopenTask(id: string): Promise<Task | null> {
  return updateTask(id, {
    status: "todo",
    completed_at: null,
  });
}

/**
 * Busca tarefas vencidas do usuário
 * 
 * @param userId - ID do usuário
 * @returns Lista de tarefas vencidas (não concluídas)
 */
export async function fetchOverdueTasks(userId: string): Promise<Task[]> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .neq("status", "done")
    .neq("status", "cancelled")
    .lt("due_date", today)
    .order("due_date", { ascending: true });

  if (error) {
    console.error("❌ [taskService] Error fetching overdue tasks:", error);
    throw error;
  }

  return (data as Task[]) || [];
}

/**
 * Busca tarefas que vencem hoje
 * 
 * @param userId - ID do usuário
 * @returns Lista de tarefas que vencem hoje
 */
export async function fetchTasksDueToday(userId: string): Promise<Task[]> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .neq("status", "done")
    .neq("status", "cancelled")
    .eq("due_date", today)
    .order("priority", { ascending: true });

  if (error) {
    console.error("❌ [taskService] Error fetching tasks due today:", error);
    throw error;
  }

  return (data as Task[]) || [];
}

/**
 * Busca próximas tarefas (para widgets e dashboards)
 * 
 * @param userId - ID do usuário
 * @param limit - Número máximo de tarefas
 * @returns Lista de próximas tarefas ordenadas por data e prioridade
 */
export async function fetchUpcomingTasks(
  userId: string,
  limit = 5
): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId)
    .neq("status", "done")
    .neq("status", "cancelled")
    .not("due_date", "is", null)
    .order("due_date", { ascending: true })
    .order("priority", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("❌ [taskService] Error fetching upcoming tasks:", error);
    throw error;
  }

  return (data as Task[]) || [];
}

/**
 * Busca estatísticas de tarefas do usuário
 * 
 * @param userId - ID do usuário
 * @returns Objeto com estatísticas agregadas
 */
export async function fetchTaskStats(userId: string): Promise<{
  total: number;
  todo: number;
  in_progress: number;
  done: number;
  cancelled: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  byPriority: Record<string, number>;
  completionRate: number;
}> {
  // Buscar todas as tarefas do usuário
  const { data: allTasks, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("❌ [taskService] Error fetching task stats:", error);
    throw error;
  }

  const tasks = (allTasks as Task[]) || [];
  const total = tasks.length;

  // Contar por status
  const todo = tasks.filter((t) => t.status === "todo").length;
  const in_progress = tasks.filter((t) => t.status === "in_progress").length;
  const done = tasks.filter((t) => t.status === "done").length;
  const cancelled = tasks.filter((t) => t.status === "cancelled").length;

  // Contar por data de vencimento
  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split("T")[0];

  const activeTasks = tasks.filter(
    (t) => t.status !== "done" && t.status !== "cancelled"
  );

  const overdue = activeTasks.filter(
    (t) => t.due_date && t.due_date < today
  ).length;

  const dueToday = activeTasks.filter((t) => t.due_date === today).length;

  const dueThisWeek = activeTasks.filter(
    (t) => t.due_date && t.due_date >= today && t.due_date <= nextWeekStr
  ).length;

  // Contar por prioridade
  const byPriority = {
    low: tasks.filter((t) => t.priority === "low").length,
    medium: tasks.filter((t) => t.priority === "medium").length,
    high: tasks.filter((t) => t.priority === "high").length,
    urgent: tasks.filter((t) => t.priority === "urgent").length,
  };

  // Taxa de conclusão (%)
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  return {
    total,
    todo,
    in_progress,
    done,
    cancelled,
    overdue,
    dueToday,
    dueThisWeek,
    byPriority,
    completionRate,
  };
}
