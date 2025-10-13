/**
 * Types para sistema de tarefas e lembretes
 * Gerencia tasks com prioridades, due dates e status
 */

// Status das tarefas
export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";

// Prioridades
export type TaskPriority = "low" | "medium" | "high" | "urgent";

// Interface principal de Task
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  
  // Datas
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  
  // Relacionamentos (nullable)
  lead_id?: string;
  company_id?: string;
  deal_id?: string;
  assigned_to?: string;  // user_id de quem está atribuído
  
  // Dados populados (joins) - strings simples
  lead_name?: string;
  company_name?: string;
  deal_title?: string;
  assigned_user_name?: string;
  assigned_user_avatar?: string;
  
  // Objetos populados completos (para queries com relations)
  lead?: {
    id: string;
    name: string;
    email?: string;
  };
  company?: {
    id: string;
    name: string;
    website?: string;
  };
  deal?: {
    id: string;
    title: string;
    value?: number;
  };
}

// Dados para criar/editar tarefa
export interface TaskFormData {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string;
  lead_id?: string;
  company_id?: string;
  deal_id?: string;
  assigned_to?: string;
}

// Filtros para listagem
export interface TaskFilters {
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  user_id?: string;         // Filtrar por usuário
  lead_id?: string;
  company_id?: string;
  deal_id?: string;
  assigned_to?: string;
  due_date_from?: string;   // Data de início do intervalo
  due_date_to?: string;     // Data de fim do intervalo
  overdue?: boolean;        // Apenas vencidas
  due_today?: boolean;      // Vencendo hoje
  due_this_week?: boolean;  // Vencendo esta semana
  sortBy?: "created_at" | "due_date" | "priority" | "updated_at";
  sortOrder?: "asc" | "desc";
}

// Configurações de aparência por status
export const TASK_STATUS_CONFIG: Record<TaskStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}> = {
  todo: {
    label: "A Fazer",
    color: "text-slate-600",
    bgColor: "bg-slate-100",
    icon: "Circle",
  },
  in_progress: {
    label: "Em Andamento",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    icon: "Clock",
  },
  done: {
    label: "Concluída",
    color: "text-green-600",
    bgColor: "bg-green-100",
    icon: "CheckCircle2",
  },
  cancelled: {
    label: "Cancelada",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    icon: "XCircle",
  },
};

// Configurações de aparência por prioridade
export const TASK_PRIORITY_CONFIG: Record<TaskPriority, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  order: number;  // Para ordenação
}> = {
  low: {
    label: "Baixa",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    icon: "ArrowDown",
    order: 0,
  },
  medium: {
    label: "Média",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    icon: "Minus",
    order: 1,
  },
  high: {
    label: "Alta",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    icon: "ArrowUp",
    order: 2,
  },
  urgent: {
    label: "Urgente",
    color: "text-red-600",
    bgColor: "bg-red-100",
    icon: "AlertTriangle",
    order: 3,
  },
};

// Helper: Verificar se tarefa está vencida
export function isTaskOverdue(task: Task): boolean {
  if (!task.due_date || task.status === "done" || task.status === "cancelled") {
    return false;
  }
  return new Date(task.due_date) < new Date();
}

// Helper: Verificar se tarefa vence hoje
export function isTaskDueToday(task: Task): boolean {
  if (!task.due_date) return false;
  
  const today = new Date();
  const dueDate = new Date(task.due_date);
  
  return (
    dueDate.getDate() === today.getDate() &&
    dueDate.getMonth() === today.getMonth() &&
    dueDate.getFullYear() === today.getFullYear()
  );
}

// Helper: Verificar se tarefa vence esta semana
export function isTaskDueThisWeek(task: Task): boolean {
  if (!task.due_date) return false;
  
  const today = new Date();
  const dueDate = new Date(task.due_date);
  const weekFromNow = new Date();
  weekFromNow.setDate(today.getDate() + 7);
  
  return dueDate >= today && dueDate <= weekFromNow;
}

// Helper: Obter dias até vencimento
export function getDaysUntilDue(task: Task): number | null {
  if (!task.due_date) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(task.due_date);
  dueDate.setHours(0, 0, 0, 0);
  
  const diffMs = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// Helper: Formatar mensagem de vencimento
export function formatDueMessage(task: Task): string {
  const days = getDaysUntilDue(task);
  
  if (days === null) return "";
  
  if (days < 0) {
    const absDays = Math.abs(days);
    return `Venceu há ${absDays} dia${absDays !== 1 ? "s" : ""}`;
  }
  
  if (days === 0) return "Vence hoje";
  if (days === 1) return "Vence amanhã";
  if (days <= 7) return `Vence em ${days} dias`;
  
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(task.due_date!));
}

// Helper: Obter cor do vencimento
export function getDueColor(task: Task): string {
  const days = getDaysUntilDue(task);
  
  if (days === null) return "text-muted-foreground";
  if (days < 0) return "text-red-600";
  if (days === 0) return "text-orange-600";
  if (days <= 2) return "text-yellow-600";
  
  return "text-muted-foreground";
}

// Helper: Formatar data completa
export function formatTaskDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

// Helper: Obter configuração por status
export function getTaskStatusConfig(status: TaskStatus) {
  return TASK_STATUS_CONFIG[status];
}

// Helper: Obter configuração por prioridade
export function getTaskPriorityConfig(priority: TaskPriority) {
  return TASK_PRIORITY_CONFIG[priority];
}

// Helper: Calcular progresso (para grupos de tasks)
export function calculateProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  
  const completed = tasks.filter(t => t.status === "done").length;
  return Math.round((completed / tasks.length) * 100);
}

// Helper: Ordenar tasks por prioridade
export function sortTasksByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const priorityA = TASK_PRIORITY_CONFIG[a.priority].order;
    const priorityB = TASK_PRIORITY_CONFIG[b.priority].order;
    return priorityB - priorityA; // Maior prioridade primeiro
  });
}

// Helper: Agrupar tasks por status
export function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  return {
    todo: tasks.filter(t => t.status === "todo"),
    in_progress: tasks.filter(t => t.status === "in_progress"),
    done: tasks.filter(t => t.status === "done"),
    cancelled: tasks.filter(t => t.status === "cancelled"),
  };
}
