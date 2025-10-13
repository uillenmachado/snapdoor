/**
 * Types para sistema de atividades/timeline
 * Rastreia todas as interações e eventos do CRM
 */

// Tipos de atividades
export type ActivityType =
  | "note"              // Nota/comentário manual
  | "call"              // Ligação telefônica
  | "email"             // Email enviado/recebido
  | "meeting"           // Reunião/appointment
  | "task_created"      // Tarefa criada
  | "task_completed"    // Tarefa concluída
  | "deal_created"      // Negócio criado
  | "deal_moved"        // Negócio movido entre estágios
  | "deal_won"          // Negócio ganho
  | "deal_lost"         // Negócio perdido
  | "lead_created"      // Lead criado
  | "lead_updated"      // Lead atualizado
  | "company_created"   // Empresa criada
  | "company_updated";  // Empresa atualizada

// Status das atividades
export type ActivityStatus = "pending" | "completed" | "cancelled";

// Interface principal de Activity
export interface Activity {
  id: string;
  user_id: string;
  type: ActivityType;
  title: string;
  description?: string;
  status?: ActivityStatus;
  
  // Relacionamentos (nullable)
  lead_id?: string;
  company_id?: string;
  deal_id?: string;
  
  // Metadados específicos por tipo
  metadata?: Record<string, any>;
  
  // Timestamps
  scheduled_at?: string;  // Para tasks e meetings
  completed_at?: string;  // Para tasks
  created_at: string;
  updated_at: string;
  
  // Dados populados (joins)
  lead_name?: string;
  company_name?: string;
  deal_title?: string;
  user_name?: string;
  user_avatar?: string;
}

// Dados para criar/editar atividade
export interface ActivityFormData {
  type: ActivityType;
  title: string;
  description?: string;
  status?: ActivityStatus;
  lead_id?: string;
  company_id?: string;
  deal_id?: string;
  scheduled_at?: string;
  metadata?: Record<string, any>;
}

// Filtros para listagem
export interface ActivityFilters {
  search?: string;
  type?: ActivityType;
  status?: ActivityStatus;
  lead_id?: string;
  company_id?: string;
  deal_id?: string;
  date_from?: string;
  date_to?: string;
  sortBy?: "created_at" | "scheduled_at" | "updated_at";
  sortOrder?: "asc" | "desc";
}

// Configurações de aparência por tipo
export const ACTIVITY_CONFIG: Record<ActivityType, {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
}> = {
  note: {
    label: "Nota",
    icon: "FileText",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  call: {
    label: "Ligação",
    icon: "Phone",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  email: {
    label: "Email",
    icon: "Mail",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  meeting: {
    label: "Reunião",
    icon: "Calendar",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  task_created: {
    label: "Tarefa Criada",
    icon: "CheckSquare",
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
  },
  task_completed: {
    label: "Tarefa Concluída",
    icon: "CheckCircle2",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
  },
  deal_created: {
    label: "Negócio Criado",
    icon: "PlusCircle",
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  deal_moved: {
    label: "Negócio Movido",
    icon: "ArrowRight",
    color: "text-violet-600",
    bgColor: "bg-violet-100",
  },
  deal_won: {
    label: "Negócio Ganho",
    icon: "Trophy",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  deal_lost: {
    label: "Negócio Perdido",
    icon: "XCircle",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  lead_created: {
    label: "Lead Criado",
    icon: "UserPlus",
    color: "text-teal-600",
    bgColor: "bg-teal-100",
  },
  lead_updated: {
    label: "Lead Atualizado",
    icon: "UserCheck",
    color: "text-sky-600",
    bgColor: "bg-sky-100",
  },
  company_created: {
    label: "Empresa Criada",
    icon: "Building2",
    color: "text-slate-600",
    bgColor: "bg-slate-100",
  },
  company_updated: {
    label: "Empresa Atualizada",
    icon: "Building",
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
};

// Helper: Formatar data relativa
export function formatRelativeTime(date: string): string {
  const now = new Date();
  const activityDate = new Date(date);
  const diffMs = now.getTime() - activityDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Agora mesmo";
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays === 1) return "Ontem";
  if (diffDays < 7) return `${diffDays} dias atrás`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses atrás`;
  return `${Math.floor(diffDays / 365)} anos atrás`;
}

// Helper: Formatar data completa
export function formatActivityDate(date: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

// Helper: Obter configuração por tipo
export function getActivityConfig(type: ActivityType) {
  return ACTIVITY_CONFIG[type];
}

// Helper: Criar título automático baseado no tipo
export function generateActivityTitle(
  type: ActivityType,
  entityName?: string
): string {
  const config = ACTIVITY_CONFIG[type];
  
  switch (type) {
    case "deal_created":
      return `Negócio "${entityName}" criado`;
    case "deal_moved":
      return `Negócio "${entityName}" movido`;
    case "deal_won":
      return `Negócio "${entityName}" ganho! 🎉`;
    case "deal_lost":
      return `Negócio "${entityName}" perdido`;
    case "lead_created":
      return `Lead "${entityName}" criado`;
    case "lead_updated":
      return `Lead "${entityName}" atualizado`;
    case "company_created":
      return `Empresa "${entityName}" criada`;
    case "company_updated":
      return `Empresa "${entityName}" atualizada`;
    default:
      return config.label;
  }
}
