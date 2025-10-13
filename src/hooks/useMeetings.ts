/**
 * useMeetings Hook
 * 
 * Custom hooks para gerenciamento de reuniões usando React Query.
 * Inclui queries, mutations, invalidação de cache e estados otimizados.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";
import type { Meeting, MeetingFormData, MeetingFilters } from "@/types/meeting";
import {
  fetchMeetings,
  fetchMeetingsWithRelations,
  fetchMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  completeMeeting,
  cancelMeeting,
  markAsNoShow,
  fetchTodayMeetings,
  fetchUpcomingMeetings,
  fetchPendingMeetings,
  fetchMeetingsInRange,
  fetchMeetingStats,
} from "@/services/meetingService";

/**
 * Hook para buscar reuniões com filtros e paginação
 * 
 * @param filters - Filtros opcionais
 * @param page - Número da página (padrão: 1)
 * @param pageSize - Itens por página (padrão: 50)
 * @returns Query com meetings, total, isLoading, error
 */
export function useMeetings(
  filters?: MeetingFilters,
  page = 1,
  pageSize = 50
) {
  return useQuery({
    queryKey: ["meetings", filters, page, pageSize],
    queryFn: () => fetchMeetings(filters, page, pageSize),
    staleTime: 1000 * 60 * 3, // 3 minutos
  });
}

/**
 * Hook para buscar reuniões com relacionamentos
 * 
 * @param filters - Filtros opcionais
 * @param page - Número da página
 * @param pageSize - Itens por página
 * @returns Query com meetings enriquecidas
 */
export function useMeetingsWithRelations(
  filters?: MeetingFilters,
  page = 1,
  pageSize = 50
) {
  return useQuery({
    queryKey: ["meetings-with-relations", filters, page, pageSize],
    queryFn: () => fetchMeetingsWithRelations(filters, page, pageSize),
    staleTime: 1000 * 60 * 3, // 3 minutos
  });
}

/**
 * Hook para buscar uma reunião específica por ID
 * 
 * @param id - ID da reunião
 * @returns Query com meeting, isLoading, error
 */
export function useMeeting(id: string | undefined) {
  return useQuery({
    queryKey: ["meeting", id],
    queryFn: () => (id ? fetchMeetingById(id) : null),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para buscar reuniões do usuário logado
 * 
 * @param filters - Filtros adicionais
 * @param page - Número da página
 * @param pageSize - Itens por página
 * @returns Query com meetings do usuário
 */
export function useUserMeetings(
  filters?: Omit<MeetingFilters, "user_id">,
  page = 1,
  pageSize = 50
) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-meetings", user?.id, filters, page, pageSize],
    queryFn: () =>
      user?.id
        ? fetchMeetings({ ...filters, user_id: user.id }, page, pageSize)
        : { meetings: [], total: 0 },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 3, // 3 minutos
  });
}

/**
 * Hook para buscar reuniões de hoje
 * 
 * @returns Query com reuniões de hoje
 */
export function useTodayMeetings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["today-meetings", user?.id],
    queryFn: () => (user?.id ? fetchTodayMeetings(user.id) : []),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para buscar próximas reuniões (para widgets)
 * 
 * @param limit - Número máximo de reuniões (padrão: 5)
 * @returns Query com próximas reuniões
 */
export function useUpcomingMeetings(limit = 5) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["upcoming-meetings", user?.id, limit],
    queryFn: () => (user?.id ? fetchUpcomingMeetings(user.id, limit) : []),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 3, // 3 minutos
  });
}

/**
 * Hook para buscar reuniões pendentes (passadas não completadas)
 * 
 * @returns Query com reuniões pendentes
 */
export function usePendingMeetings() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["pending-meetings", user?.id],
    queryFn: () => (user?.id ? fetchPendingMeetings(user.id) : []),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para buscar reuniões em um intervalo de datas (calendário)
 * 
 * @param startDate - Data de início (ISO string)
 * @param endDate - Data de fim (ISO string)
 * @returns Query com reuniões no intervalo
 */
export function useMeetingsInRange(startDate?: string, endDate?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["meetings-in-range", user?.id, startDate, endDate],
    queryFn: () =>
      user?.id && startDate && endDate
        ? fetchMeetingsInRange(user.id, startDate, endDate)
        : [],
    enabled: !!user?.id && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para buscar estatísticas de reuniões
 * 
 * @returns Query com estatísticas agregadas
 */
export function useMeetingStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["meeting-stats", user?.id],
    queryFn: () =>
      user?.id
        ? fetchMeetingStats(user.id)
        : {
            total: 0,
            scheduled: 0,
            completed: 0,
            cancelled: 0,
            no_show: 0,
            today: 0,
            upcoming: 0,
            byType: {},
            completionRate: 0,
          },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para criar uma nova reunião
 * 
 * @returns Mutation com função mutate e estados
 */
export function useCreateMeeting() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (meetingData: MeetingFormData) => {
      if (!user?.id) {
        throw new Error("Usuário não autenticado");
      }
      return createMeeting(meetingData, user.id);
    },
    onSuccess: () => {
      // Invalidar todas as queries relacionadas a reuniões
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["user-meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meeting-stats"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-meetings"] });
      queryClient.invalidateQueries({ queryKey: ["today-meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meetings-in-range"] });

      toast({
        title: "✅ Reunião agendada",
        description: "A reunião foi criada com sucesso.",
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error creating meeting:", error);
      toast({
        title: "❌ Erro ao agendar reunião",
        description: error.message || "Ocorreu um erro ao criar a reunião.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook para atualizar uma reunião existente
 * 
 * @returns Mutation com função mutate e estados
 */
export function useUpdateMeeting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<MeetingFormData>;
    }) => updateMeeting(id, updates),
    onSuccess: (_, variables) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["user-meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meeting", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["meeting-stats"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-meetings"] });
      queryClient.invalidateQueries({ queryKey: ["today-meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meetings-in-range"] });

      toast({
        title: "✅ Reunião atualizada",
        description: "A reunião foi atualizada com sucesso.",
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error updating meeting:", error);
      toast({
        title: "❌ Erro ao atualizar reunião",
        description: error.message || "Ocorreu um erro ao atualizar a reunião.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook para deletar uma reunião
 * 
 * @returns Mutation com função mutate e estados
 */
export function useDeleteMeeting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteMeeting(id),
    onSuccess: () => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["user-meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meeting-stats"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-meetings"] });
      queryClient.invalidateQueries({ queryKey: ["today-meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meetings-in-range"] });

      toast({
        title: "✅ Reunião deletada",
        description: "A reunião foi removida com sucesso.",
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error deleting meeting:", error);
      toast({
        title: "❌ Erro ao deletar reunião",
        description: error.message || "Ocorreu um erro ao deletar a reunião.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook para completar reunião
 * 
 * @returns Mutation com função mutate e estados
 */
export function useCompleteMeeting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      completeMeeting(id, notes),
    onSuccess: (meeting) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["user-meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meeting", meeting?.id] });
      queryClient.invalidateQueries({ queryKey: ["meeting-stats"] });
      queryClient.invalidateQueries({ queryKey: ["pending-meetings"] });

      toast({
        title: "✅ Reunião concluída",
        description: "A reunião foi marcada como concluída.",
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error completing meeting:", error);
      toast({
        title: "❌ Erro ao concluir reunião",
        description: error.message || "Ocorreu um erro ao concluir a reunião.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook para cancelar reunião
 * 
 * @returns Mutation com função mutate e estados
 */
export function useCancelMeeting() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      cancelMeeting(id, reason),
    onSuccess: (meeting) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["user-meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meeting", meeting?.id] });
      queryClient.invalidateQueries({ queryKey: ["meeting-stats"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-meetings"] });

      toast({
        title: "🚫 Reunião cancelada",
        description: "A reunião foi cancelada.",
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error cancelling meeting:", error);
      toast({
        title: "❌ Erro ao cancelar reunião",
        description: error.message || "Ocorreu um erro ao cancelar a reunião.",
        variant: "destructive",
      });
    },
  });
}

/**
 * Hook para marcar como "no show"
 * 
 * @returns Mutation com função mutate e estados
 */
export function useMarkAsNoShow() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => markAsNoShow(id),
    onSuccess: (meeting) => {
      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      queryClient.invalidateQueries({ queryKey: ["user-meetings"] });
      queryClient.invalidateQueries({ queryKey: ["meeting", meeting?.id] });
      queryClient.invalidateQueries({ queryKey: ["meeting-stats"] });
      queryClient.invalidateQueries({ queryKey: ["pending-meetings"] });

      toast({
        title: "❌ Marcado como ausente",
        description: "A reunião foi marcada como não comparecimento.",
      });
    },
    onError: (error: Error) => {
      console.error("❌ Error marking as no show:", error);
      toast({
        title: "❌ Erro",
        description: error.message || "Ocorreu um erro.",
        variant: "destructive",
      });
    },
  });
}
