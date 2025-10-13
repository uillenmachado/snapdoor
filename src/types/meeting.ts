/**
 * Types para sistema de reuniões e calendário
 * Gerencia meetings com agendamento, participantes e sincronização
 */

// Status das reuniões
export type MeetingStatus = "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";

// Tipos de reunião
export type MeetingType = "video" | "phone" | "in_person" | "other";

// Interface principal de Meeting
export interface Meeting {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: MeetingStatus;
  type: MeetingType;
  
  // Datas e horários
  start_time: string;        // ISO 8601
  end_time: string;          // ISO 8601
  duration_minutes?: number; // Calculado automaticamente
  
  // Localização/Link
  location?: string;         // Endereço físico ou link de reunião
  meeting_link?: string;     // Link Zoom/Meet/Teams
  
  // Participantes
  attendees?: string[];      // Array de emails
  
  // Relacionamentos
  lead_id?: string;
  company_id?: string;
  deal_id?: string;
  
  // Metadados
  notes?: string;            // Notas pós-reunião
  outcome?: string;          // Resultado da reunião
  
  // Sincronização
  google_event_id?: string;  // ID do evento no Google Calendar
  synced_at?: string;        // Última sincronização
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Dados populados (joins)
  lead?: {
    id: string;
    name: string;
    email?: string;
  };
  company?: {
    id: string;
    name: string;
  };
  deal?: {
    id: string;
    title: string;
    value?: number;
  };
}

// Dados para criar/editar reunião
export interface MeetingFormData {
  title: string;
  description?: string;
  status?: MeetingStatus;
  type?: MeetingType;
  start_time: string;
  end_time: string;
  location?: string;
  meeting_link?: string;
  attendees?: string[];
  lead_id?: string;
  company_id?: string;
  deal_id?: string;
  notes?: string;
}

// Filtros para listagem
export interface MeetingFilters {
  search?: string;
  status?: MeetingStatus;
  type?: MeetingType;
  user_id?: string;
  lead_id?: string;
  company_id?: string;
  deal_id?: string;
  date_from?: string;      // ISO date
  date_to?: string;        // ISO date
  upcoming?: boolean;      // Apenas futuras
  past?: boolean;          // Apenas passadas
  sortBy?: "start_time" | "created_at" | "updated_at";
  sortOrder?: "asc" | "desc";
}

// Configurações de aparência por status
export const MEETING_STATUS_CONFIG: Record<MeetingStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}> = {
  scheduled: {
    label: "Agendada",
    color: "#3b82f6",
    bgColor: "#dbeafe",
    icon: "📅",
  },
  in_progress: {
    label: "Em Andamento",
    color: "#22c55e",
    bgColor: "#dcfce7",
    icon: "▶️",
  },
  completed: {
    label: "Concluída",
    color: "#64748b",
    bgColor: "#f1f5f9",
    icon: "✅",
  },
  cancelled: {
    label: "Cancelada",
    color: "#ef4444",
    bgColor: "#fee2e2",
    icon: "❌",
  },
  no_show: {
    label: "Não Compareceu",
    color: "#f59e0b",
    bgColor: "#fef3c7",
    icon: "⚠️",
  },
};

// Configurações de aparência por tipo
export const MEETING_TYPE_CONFIG: Record<MeetingType, {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}> = {
  video: {
    label: "Videoconferência",
    color: "#8b5cf6",
    bgColor: "#ede9fe",
    icon: "📹",
  },
  phone: {
    label: "Telefone",
    color: "#10b981",
    bgColor: "#d1fae5",
    icon: "📞",
  },
  in_person: {
    label: "Presencial",
    color: "#f59e0b",
    bgColor: "#fef3c7",
    icon: "🤝",
  },
  other: {
    label: "Outro",
    color: "#64748b",
    bgColor: "#f1f5f9",
    icon: "📋",
  },
};

// Helpers

/**
 * Verifica se reunião está no passado
 */
export function isMeetingPast(meeting: Meeting): boolean {
  return new Date(meeting.start_time) < new Date();
}

/**
 * Verifica se reunião é hoje
 */
export function isMeetingToday(meeting: Meeting): boolean {
  const today = new Date();
  const meetingDate = new Date(meeting.start_time);
  return (
    meetingDate.getDate() === today.getDate() &&
    meetingDate.getMonth() === today.getMonth() &&
    meetingDate.getFullYear() === today.getFullYear()
  );
}

/**
 * Verifica se reunião está acontecendo agora
 */
export function isMeetingNow(meeting: Meeting): boolean {
  const now = new Date();
  const start = new Date(meeting.start_time);
  const end = new Date(meeting.end_time);
  return now >= start && now <= end;
}

/**
 * Calcula duração da reunião em minutos
 */
export function calculateDuration(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
}

/**
 * Formata horário de reunião
 * Ex: "14:00 - 15:30"
 */
export function formatMeetingTime(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  const startTime = startDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  
  const endTime = endDate.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  
  return `${startTime} - ${endTime}`;
}

/**
 * Formata data completa da reunião
 * Ex: "Segunda-feira, 13 de outubro de 2025"
 */
export function formatMeetingDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Formata data e hora compactas
 * Ex: "13/10/2025 às 14:00"
 */
export function formatMeetingDateTime(dateString: string): string {
  const date = new Date(dateString);
  const dateStr = date.toLocaleDateString("pt-BR");
  const timeStr = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dateStr} às ${timeStr}`;
}

/**
 * Retorna config do status
 */
export function getMeetingStatusConfig(status: MeetingStatus) {
  return MEETING_STATUS_CONFIG[status];
}

/**
 * Retorna config do tipo
 */
export function getMeetingTypeConfig(type: MeetingType) {
  return MEETING_TYPE_CONFIG[type];
}

/**
 * Agrupa reuniões por data
 */
export function groupMeetingsByDate(
  meetings: Meeting[]
): Record<string, Meeting[]> {
  return meetings.reduce((groups, meeting) => {
    const date = new Date(meeting.start_time).toLocaleDateString("pt-BR");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(meeting);
    return groups;
  }, {} as Record<string, Meeting[]>);
}

/**
 * Filtra reuniões futuras
 */
export function getUpcomingMeetings(meetings: Meeting[]): Meeting[] {
  const now = new Date();
  return meetings.filter((m) => new Date(m.start_time) > now);
}

/**
 * Filtra reuniões passadas
 */
export function getPastMeetings(meetings: Meeting[]): Meeting[] {
  const now = new Date();
  return meetings.filter((m) => new Date(m.start_time) < now);
}

/**
 * Calcula estatísticas de reuniões
 */
export function calculateMeetingStats(meetings: Meeting[]) {
  const total = meetings.length;
  const scheduled = meetings.filter((m) => m.status === "scheduled").length;
  const completed = meetings.filter((m) => m.status === "completed").length;
  const cancelled = meetings.filter((m) => m.status === "cancelled").length;
  const noShow = meetings.filter((m) => m.status === "no_show").length;
  
  const upcoming = getUpcomingMeetings(meetings).length;
  const past = getPastMeetings(meetings).length;
  
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  const byType = {
    video: meetings.filter((m) => m.type === "video").length,
    phone: meetings.filter((m) => m.type === "phone").length,
    in_person: meetings.filter((m) => m.type === "in_person").length,
    other: meetings.filter((m) => m.type === "other").length,
  };
  
  return {
    total,
    scheduled,
    completed,
    cancelled,
    noShow,
    upcoming,
    past,
    completionRate,
    byType,
  };
}
