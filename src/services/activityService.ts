// @ts-nocheck - Tipos do Supabase precisam ser regenerados após expansão de activities
/**
 * Service layer para Activities/Timeline
 * Gerencia CRUD e consultas de atividades
 */

import { supabase } from "@/integrations/supabase/client";
import type {
  Activity,
  ActivityFormData,
  ActivityFilters,
  ActivityType,
} from "@/types/activity";

/**
 * Busca atividades com filtros e paginação
 */
export async function fetchActivities(
  filters: ActivityFilters = {},
  page: number = 1,
  pageSize: number = 20
): Promise<{ data: Activity[]; count: number }> {
  let query = supabase
    .from("activities")
    .select("*", { count: "exact" });

  // Filtros
  if (filters.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  if (filters.type) {
    query = query.eq("type", filters.type);
  }

  if (filters.status) {
    query = query.eq("status", filters.status);
  }

  if (filters.lead_id) {
    query = query.eq("lead_id", filters.lead_id);
  }

  if (filters.company_id) {
    query = query.eq("company_id", filters.company_id);
  }

  if (filters.deal_id) {
    query = query.eq("deal_id", filters.deal_id);
  }

  if (filters.date_from) {
    query = query.gte("created_at", filters.date_from);
  }

  if (filters.date_to) {
    query = query.lte("created_at", filters.date_to);
  }

  // Ordenação
  const sortBy = filters.sortBy || "created_at";
  const sortOrder = filters.sortOrder || "desc";
  query = query.order(sortBy, { ascending: sortOrder === "asc" });

  // Paginação
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    data: data || [],
    count: count || 0,
  };
}

/**
 * Busca atividades com dados relacionados (joins)
 */
export async function fetchActivitiesWithRelations(
  filters: ActivityFilters = {},
  page: number = 1,
  pageSize: number = 20
): Promise<{ data: Activity[]; count: number }> {
  const { data: activities, count } = await fetchActivities(filters, page, pageSize);

  // Enriquecer com dados relacionados
  const enrichedActivities = await Promise.all(
    activities.map(async (activity) => {
      const enriched: Activity = { ...activity };

      // Buscar lead_name
      if (activity.lead_id) {
        const { data: lead } = await supabase
          .from("leads")
          .select("first_name, last_name")
          .eq("id", activity.lead_id)
          .single();

        if (lead) {
          enriched.lead_name = `${lead.first_name} ${lead.last_name}`;
        }
      }

      // Buscar company_name
      if (activity.company_id) {
        const { data: company } = await supabase
          .from("companies")
          .select("name")
          .eq("id", activity.company_id)
          .single();

        if (company) {
          enriched.company_name = company.name;
        }
      }

      // Buscar deal_title
      if (activity.deal_id) {
        const { data: deal } = await supabase
          .from("deals")
          .select("title")
          .eq("id", activity.deal_id)
          .single();

        if (deal) {
          enriched.deal_title = deal.title;
        }
      }

      // Buscar user info
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", activity.user_id)
        .single();

      if (profile) {
        enriched.user_name = profile.full_name;
        enriched.user_avatar = profile.avatar_url;
      }

      return enriched;
    })
  );

  return {
    data: enrichedActivities,
    count: count || 0,
  };
}

/**
 * Busca uma atividade por ID
 */
export async function fetchActivityById(id: string): Promise<Activity> {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Cria uma nova atividade
 */
export async function createActivity(
  activityData: ActivityFormData,
  userId: string
): Promise<Activity> {
  const { data, error } = await supabase
    .from("activities")
    .insert({
      ...activityData,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Atualiza uma atividade
 */
export async function updateActivity(
  id: string,
  updates: Partial<ActivityFormData>
): Promise<Activity> {
  const { data, error } = await supabase
    .from("activities")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Deleta uma atividade
 */
export async function deleteActivity(id: string): Promise<void> {
  const { error } = await supabase.from("activities").delete().eq("id", id);

  if (error) throw error;
}

/**
 * Cria atividade automática (para logging de sistema)
 */
export async function logActivity(
  userId: string,
  type: ActivityType,
  title: string,
  description?: string,
  metadata?: {
    lead_id?: string;
    company_id?: string;
    deal_id?: string;
    [key: string]: any;
  }
): Promise<Activity> {
  const activityData: ActivityFormData = {
    type,
    title,
    description,
    lead_id: metadata?.lead_id,
    company_id: metadata?.company_id,
    deal_id: metadata?.deal_id,
    metadata,
  };

  return createActivity(activityData, userId);
}

/**
 * Busca estatísticas de atividades
 */
export async function fetchActivityStats(userId: string): Promise<{
  totalActivities: number;
  thisWeek: number;
  byType: Record<ActivityType, number>;
  recentCount: number;
}> {
  // Total de atividades
  const { count: totalActivities } = await supabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  // Atividades desta semana
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { count: thisWeek } = await supabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", oneWeekAgo.toISOString());

  // Atividades por tipo
  const { data: activities } = await supabase
    .from("activities")
    .select("type")
    .eq("user_id", userId);

  const byType: Record<string, number> = {};
  activities?.forEach((activity) => {
    byType[activity.type] = (byType[activity.type] || 0) + 1;
  });

  // Atividades recentes (últimas 24h)
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const { count: recentCount } = await supabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", oneDayAgo.toISOString());

  return {
    totalActivities: totalActivities || 0,
    thisWeek: thisWeek || 0,
    byType: byType as Record<ActivityType, number>,
    recentCount: recentCount || 0,
  };
}
