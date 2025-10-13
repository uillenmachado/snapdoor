// =====================================================
// HOOK: useAnalytics
// Hooks para obter analytics e métricas avançadas do dashboard
// =====================================================
// @ts-nocheck - Aguardando aplicação da migration

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// =====================================================
// Types
// =====================================================

export interface DashboardMetrics {
  totalLeads: number;
  leads7d: number;
  leads30d: number;
  avgLeadScore: number;
  totalDeals: number;
  wonDeals: number;
  lostDeals: number;
  activeDeals: number;
  totalRevenue: number;
  revenue30d: number;
  avgDealValue: number;
  pipelineValue: number;
  overallConversionRate: number;
  totalActivities: number;
  activities7d: number;
}

export interface ConversionFunnelStage {
  stage: string;
  stageOrder: number;
  totalLeads: number;
  leads30d: number;
  conversionRate?: number;
}

export interface RevenueMetric {
  periodDate: string;
  periodWeek: string;
  periodMonth: string;
  dealsCount: number;
  totalRevenue: number;
  avgDealValue: number;
}

export interface RevenueForecast {
  stageName: string;
  dealsCount: number;
  totalValue: number;
  winProbability: number;
  forecastedRevenue: number;
}

export interface SalesTrendPoint {
  date: string;
  dealsWon: number;
  revenue: number;
  revenue7dAvg: number;
}

export interface TopPerformer {
  userId: string;
  fullName: string;
  email: string;
  wonDeals: number;
  totalRevenue: number;
  avgDealValue: number;
  wonDeals30d: number;
  revenue30d: number;
}

export interface ActivityMetric {
  activityDate: string;
  activityType: string;
  count: number;
  count7d: number;
  count30d: number;
}

export interface PipelineStage {
  stageName: string;
  stageOrder: number;
  dealsCount: number;
  totalValue: number;
  avgValue: number;
  avgDaysInStage: number;
}

// =====================================================
// Hook: Dashboard Metrics (Métricas Gerais)
// =====================================================

export const useDashboardMetrics = () => {
  const { user } = useAuth();

  return useQuery<DashboardMetrics>({
    queryKey: ["dashboardMetrics", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dashboard_metrics_view")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;

      return {
        totalLeads: data.total_leads || 0,
        leads7d: data.leads_7d || 0,
        leads30d: data.leads_30d || 0,
        avgLeadScore: data.avg_lead_score || 0,
        totalDeals: data.total_deals || 0,
        wonDeals: data.won_deals || 0,
        lostDeals: data.lost_deals || 0,
        activeDeals: data.active_deals || 0,
        totalRevenue: data.total_revenue || 0,
        revenue30d: data.revenue_30d || 0,
        avgDealValue: data.avg_deal_value || 0,
        pipelineValue: data.pipeline_value || 0,
        overallConversionRate: data.overall_conversion_rate || 0,
        totalActivities: data.total_activities || 0,
        activities7d: data.activities_7d || 0,
      };
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchInterval: 1000 * 60 * 5, // Refetch a cada 5 minutos
  });
};

// =====================================================
// Hook: Conversion Funnel
// =====================================================

export const useConversionFunnel = () => {
  const { user } = useAuth();

  return useQuery<ConversionFunnelStage[]>({
    queryKey: ["conversionFunnel", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("conversion_funnel_view")
        .select("*")
        .eq("user_id", user?.id)
        .order("stage_order");

      if (error) throw error;

      // Calcular taxa de conversão entre stages
      return (data || []).map((stage, index, array) => {
        const prevStage = index > 0 ? array[index - 1] : null;
        const conversionRate = prevStage
          ? (stage.total_leads / prevStage.total_leads) * 100
          : 100;

        return {
          stage: stage.stage,
          stageOrder: stage.stage_order,
          totalLeads: stage.total_leads,
          leads30d: stage.leads_30d,
          conversionRate: Math.round(conversionRate * 100) / 100,
        };
      });
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });
};

// =====================================================
// Hook: Revenue Metrics (por período)
// =====================================================

export const useRevenueMetrics = (periodType: "day" | "week" | "month" = "day", limit: number = 30) => {
  const { user } = useAuth();

  return useQuery<RevenueMetric[]>({
    queryKey: ["revenueMetrics", user?.id, periodType, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("revenue_by_period_view")
        .select("*")
        .eq("user_id", user?.id)
        .order("period_date", { ascending: false })
        .limit(limit);

      if (error) throw error;

      return (data || []).map((item) => ({
        periodDate: item.period_date,
        periodWeek: item.period_week,
        periodMonth: item.period_month,
        dealsCount: item.deals_count,
        totalRevenue: item.total_revenue,
        avgDealValue: item.avg_deal_value,
      }));
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });
};

// =====================================================
// Hook: Revenue Forecast (Previsão)
// =====================================================

export const useRevenueForecast = () => {
  const { user } = useAuth();

  return useQuery<RevenueForecast[]>({
    queryKey: ["revenueForecast", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("revenue_forecast_view")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;

      return (data || []).map((item) => ({
        stageName: item.stage_name,
        dealsCount: item.deals_count,
        totalValue: item.total_value,
        winProbability: item.win_probability,
        forecastedRevenue: item.forecasted_revenue,
      }));
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });
};

// =====================================================
// Hook: Sales Trend (Tendência de Vendas)
// =====================================================

export const useSalesTrend = (days: number = 30) => {
  const { user } = useAuth();

  return useQuery<SalesTrendPoint[]>({
    queryKey: ["salesTrend", user?.id, days],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_trend_view")
        .select("*")
        .eq("user_id", user?.id)
        .order("date", { ascending: true })
        .limit(days);

      if (error) throw error;

      return (data || []).map((item) => ({
        date: item.date,
        dealsWon: item.deals_won,
        revenue: item.revenue,
        revenue7dAvg: item.revenue_7d_avg,
      }));
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });
};

// =====================================================
// Hook: Top Performers
// =====================================================

export const useTopPerformers = (limit: number = 10) => {
  const { user } = useAuth();

  return useQuery<TopPerformer[]>({
    queryKey: ["topPerformers", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("top_performers_view")
        .select("*")
        .limit(limit);

      if (error) throw error;

      return (data || []).map((item) => ({
        userId: item.user_id,
        fullName: item.full_name,
        email: item.email,
        wonDeals: item.won_deals || 0,
        totalRevenue: item.total_revenue || 0,
        avgDealValue: item.avg_deal_value || 0,
        wonDeals30d: item.won_deals_30d || 0,
        revenue30d: item.revenue_30d || 0,
      }));
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 10, // 10 minutos (menos crítico)
  });
};

// =====================================================
// Hook: Activity Metrics
// =====================================================

export const useActivityMetrics = (days: number = 30) => {
  const { user } = useAuth();

  return useQuery<ActivityMetric[]>({
    queryKey: ["activityMetrics", user?.id, days],
    queryFn: async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from("activities_by_period_view")
        .select("*")
        .eq("user_id", user?.id)
        .gte("activity_date", startDate.toISOString())
        .order("activity_date", { ascending: false });

      if (error) throw error;

      return (data || []).map((item) => ({
        activityDate: item.activity_date,
        activityType: item.activity_type,
        count: item.count,
        count7d: item.count_7d,
        count30d: item.count_30d,
      }));
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });
};

// =====================================================
// Hook: Pipeline Current (Estado Atual do Pipeline)
// =====================================================

export const usePipelineCurrent = () => {
  const { user } = useAuth();

  return useQuery<PipelineStage[]>({
    queryKey: ["pipelineCurrent", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pipeline_current_view")
        .select("*")
        .eq("user_id", user?.id)
        .order("stage_order");

      if (error) throw error;

      return (data || []).map((item) => ({
        stageName: item.stage_name,
        stageOrder: item.stage_order,
        dealsCount: item.deals_count,
        totalValue: item.total_value,
        avgValue: item.avg_value,
        avgDaysInStage: item.avg_days_in_stage,
      }));
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  });
};

// =====================================================
// Hook: Get Analytics for Period (usando function do DB)
// =====================================================

export const useAnalyticsForPeriod = (periodDays: number = 30) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["analyticsForPeriod", user?.id, periodDays],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_analytics_for_period", {
        p_user_id: user?.id,
        p_period_days: periodDays,
      });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5,
  });
};


