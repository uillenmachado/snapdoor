// =====================================================
// HOOK: useAnalytics
// Hook para obter analytics e métricas do dashboard
// =====================================================

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface AnalyticsData {
  totalLeads: number;
  leadsThisPeriod: number;
  conversionRate: number;
  avgScore: number;
  leadsPerStage: Record<string, number>;
  leadsOverTime: Array<{ date: string; count: number }>;
  topSources: Array<{ source: string; count: number }>;
  activitiesThisWeek: number;
  pendingActivities: number;
  period: number;
}

export const useAnalytics = (period: string = '30') => {
  return useQuery<AnalyticsData>({
    queryKey: ["analytics", period],
    queryFn: async () => {
      const data = await api.getAnalytics({ period });
      return data as AnalyticsData;
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchInterval: 1000 * 60 * 5, // Refetch a cada 5 minutos
  });
};


