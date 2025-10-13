// @ts-nocheck
/**
 * Meeting Service
 * 
 * Service layer para sistema de reuniões/calendário com operações CRUD,
 * filtros avançados, estatísticas e sincronização com calendários externos.
 * 
 * @ts-nocheck: Temporário até migração criar a tabela meetings
 */

import { supabase } from "@/integrations/supabase/client";
import type { Meeting, MeetingFormData, MeetingFilters } from "@/types/meeting";

/**
 * Busca reuniões com filtros e paginação
 * 
 * @param filters - Filtros opcionais (status, type, date range, participants)
 * @param page - Número da página (1-based)
 * @param pageSize - Itens por página
 * @returns Lista de reuniões e contagem total
 */
export async function fetchMeetings(
  filters?: MeetingFilters,
  page = 1,
  pageSize = 50
): Promise<{ meetings: Meeting[]; total: number }> {
  let query = supabase
    .from("meetings")
    .select("*", { count: "exact" })
    .order("start_time", { ascending: true });

  // Aplicar filtros
  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.type) {
    query = query.eq("type", filters.type);
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

  if (filters?.start_date) {
    query = query.gte("start_time", filters.start_date);
  }

  if (filters?.end_date) {
    query = query.lte("start_time", filters.end_date);
  }

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`
    );
  }

  // Paginação
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("❌ [meetingService] Error fetching meetings:", error);
    throw error;
  }

  return {
    meetings: (data as Meeting[]) || [],
    total: count || 0,
  };
}

/**
 * Busca reuniões com relacionamentos populados (lead, company, deal)
 * 
 * @param filters - Filtros opcionais
 * @param page - Número da página
 * @param pageSize - Itens por página
 * @returns Lista de reuniões enriquecidas
 */
export async function fetchMeetingsWithRelations(
  filters?: MeetingFilters,
  page = 1,
  pageSize = 50
): Promise<{ meetings: Meeting[]; total: number }> {
  const { meetings, total } = await fetchMeetings(filters, page, pageSize);

  const enrichedMeetings = await Promise.all(
    meetings.map(async (meeting) => {
      const enriched = { ...meeting };

      if (meeting.lead_id) {
        const { data: lead } = await supabase
          .from("leads")
          .select("id, name, email")
          .eq("id", meeting.lead_id)
          .single();
        enriched.lead = lead;
      }

      if (meeting.company_id) {
        const { data: company } = await supabase
          .from("companies")
          .select("id, name")
          .eq("id", meeting.company_id)
          .single();
        enriched.company = company;
      }

      if (meeting.deal_id) {
        const { data: deal } = await supabase
          .from("deals")
          .select("id, title, value")
          .eq("id", meeting.deal_id)
          .single();
        enriched.deal = deal;
      }

      return enriched;
    })
  );

  return {
    meetings: enrichedMeetings,
    total,
  };
}

/**
 * Busca uma reunião por ID
 * 
 * @param id - ID da reunião
 * @returns Reunião encontrada ou null
 */
export async function fetchMeetingById(id: string): Promise<Meeting | null> {
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`❌ [meetingService] Error fetching meeting ${id}:`, error);
    return null;
  }

  return data as Meeting;
}

/**
 * Cria uma nova reunião
 * 
 * @param meetingData - Dados da reunião
 * @param userId - ID do usuário criador
 * @returns Reunião criada ou null em caso de erro
 */
export async function createMeeting(
  meetingData: MeetingFormData,
  userId: string
): Promise<Meeting | null> {
  const meetingToCreate = {
    ...meetingData,
    user_id: userId,
    status: meetingData.status || "scheduled",
  };

  const { data, error } = await supabase
    .from("meetings")
    .insert(meetingToCreate)
    .select()
    .single();

  if (error) {
    console.error("❌ [meetingService] Error creating meeting:", error);
    throw error;
  }

  console.log("✅ [meetingService] Meeting created:", data.id);
  return data as Meeting;
}

/**
 * Atualiza uma reunião existente
 * 
 * @param id - ID da reunião
 * @param updates - Campos a atualizar
 * @returns Reunião atualizada ou null em caso de erro
 */
export async function updateMeeting(
  id: string,
  updates: Partial<MeetingFormData>
): Promise<Meeting | null> {
  const { data, error } = await supabase
    .from("meetings")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`❌ [meetingService] Error updating meeting ${id}:`, error);
    throw error;
  }

  console.log("✅ [meetingService] Meeting updated:", id);
  return data as Meeting;
}

/**
 * Deleta uma reunião
 * 
 * @param id - ID da reunião
 * @returns true se deletado com sucesso
 */
export async function deleteMeeting(id: string): Promise<boolean> {
  const { error } = await supabase.from("meetings").delete().eq("id", id);

  if (error) {
    console.error(`❌ [meetingService] Error deleting meeting ${id}:`, error);
    throw error;
  }

  console.log("✅ [meetingService] Meeting deleted:", id);
  return true;
}

/**
 * Marca reunião como concluída
 * 
 * @param id - ID da reunião
 * @param notes - Notas da reunião (opcional)
 * @returns Reunião atualizada
 */
export async function completeMeeting(
  id: string,
  notes?: string
): Promise<Meeting | null> {
  const updates: Partial<MeetingFormData> = {
    status: "completed",
  };

  if (notes) {
    updates.notes = notes;
  }

  return updateMeeting(id, updates);
}

/**
 * Marca reunião como cancelada
 * 
 * @param id - ID da reunião
 * @param reason - Motivo do cancelamento (opcional)
 * @returns Reunião atualizada
 */
export async function cancelMeeting(
  id: string,
  reason?: string
): Promise<Meeting | null> {
  const updates: Partial<MeetingFormData> = {
    status: "cancelled",
  };

  if (reason) {
    updates.notes = reason;
  }

  return updateMeeting(id, updates);
}

/**
 * Marca reunião como "no show" (não compareceu)
 * 
 * @param id - ID da reunião
 * @returns Reunião atualizada
 */
export async function markAsNoShow(id: string): Promise<Meeting | null> {
  return updateMeeting(id, { status: "no_show" });
}

/**
 * Busca reuniões de hoje do usuário
 * 
 * @param userId - ID do usuário
 * @returns Lista de reuniões de hoje
 */
export async function fetchTodayMeetings(userId: string): Promise<Meeting[]> {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("user_id", userId)
    .gte("start_time", startOfDay)
    .lte("start_time", endOfDay)
    .order("start_time", { ascending: true });

  if (error) {
    console.error("❌ [meetingService] Error fetching today's meetings:", error);
    throw error;
  }

  return (data as Meeting[]) || [];
}

/**
 * Busca próximas reuniões (para widgets e dashboards)
 * 
 * @param userId - ID do usuário
 * @param limit - Número máximo de reuniões
 * @returns Lista de próximas reuniões ordenadas
 */
export async function fetchUpcomingMeetings(
  userId: string,
  limit = 5
): Promise<Meeting[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["scheduled", "in_progress"])
    .gte("start_time", now)
    .order("start_time", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("❌ [meetingService] Error fetching upcoming meetings:", error);
    throw error;
  }

  return (data as Meeting[]) || [];
}

/**
 * Busca reuniões passadas que não foram completadas
 * 
 * @param userId - ID do usuário
 * @returns Lista de reuniões pendentes
 */
export async function fetchPendingMeetings(userId: string): Promise<Meeting[]> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "scheduled")
    .lt("start_time", now)
    .order("start_time", { ascending: false });

  if (error) {
    console.error("❌ [meetingService] Error fetching pending meetings:", error);
    throw error;
  }

  return (data as Meeting[]) || [];
}

/**
 * Busca reuniões em um intervalo de datas (para calendário)
 * 
 * @param userId - ID do usuário
 * @param startDate - Data de início (ISO string)
 * @param endDate - Data de fim (ISO string)
 * @returns Lista de reuniões no intervalo
 */
export async function fetchMeetingsInRange(
  userId: string,
  startDate: string,
  endDate: string
): Promise<Meeting[]> {
  const { data, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("user_id", userId)
    .gte("start_time", startDate)
    .lte("start_time", endDate)
    .order("start_time", { ascending: true });

  if (error) {
    console.error("❌ [meetingService] Error fetching meetings in range:", error);
    throw error;
  }

  return (data as Meeting[]) || [];
}

/**
 * Busca estatísticas de reuniões do usuário
 * 
 * @param userId - ID do usuário
 * @returns Objeto com estatísticas agregadas
 */
export async function fetchMeetingStats(userId: string): Promise<{
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  no_show: number;
  today: number;
  upcoming: number;
  byType: Record<string, number>;
  completionRate: number;
}> {
  const { data: allMeetings, error } = await supabase
    .from("meetings")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    console.error("❌ [meetingService] Error fetching meeting stats:", error);
    throw error;
  }

  const meetings = (allMeetings as Meeting[]) || [];
  const total = meetings.length;

  // Contar por status
  const scheduled = meetings.filter((m) => m.status === "scheduled").length;
  const completed = meetings.filter((m) => m.status === "completed").length;
  const cancelled = meetings.filter((m) => m.status === "cancelled").length;
  const no_show = meetings.filter((m) => m.status === "no_show").length;

  // Contar por data
  const now = new Date();
  const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
  const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString();

  const today = meetings.filter(
    (m) => m.start_time >= startOfDay && m.start_time <= endOfDay
  ).length;

  const upcoming = meetings.filter(
    (m) => m.start_time > new Date().toISOString() && m.status === "scheduled"
  ).length;

  // Contar por tipo
  const byType = meetings.reduce((acc, m) => {
    acc[m.type] = (acc[m.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Taxa de conclusão (%)
  const totalFinished = completed + cancelled + no_show;
  const completionRate = total > 0 ? Math.round((completed / totalFinished) * 100) : 0;

  return {
    total,
    scheduled,
    completed,
    cancelled,
    no_show,
    today,
    upcoming,
    byType,
    completionRate,
  };
}
