// @ts-nocheck
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardMetrics } from "@/hooks/useAnalytics";
import { Loader2, TrendingUp, TrendingDown, Users, DollarSign, Target, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const MetricCard = ({ title, value, subtitle, icon, trend, className }: MetricCardProps) => {
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
            {trend && (
              <div className={cn("flex items-center gap-1 mt-2 text-sm", trend.isPositive ? "text-green-600" : "text-red-600")}>
                {trend.isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          <div className="ml-4 flex-shrink-0">
            <div className="p-3 bg-primary/10 rounded-full">
              {icon}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const MetricsWidget = () => {
  const { data: metrics, isLoading } = useDashboardMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex items-center justify-center h-[140px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}k`;
    }
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const leadsTrend = metrics.leads7d > 0 ? ((metrics.leads7d / metrics.leads30d) * 100 - 100) : 0;
  const revenueTrend = metrics.revenue30d > 0 && metrics.totalRevenue > 0 
    ? ((metrics.revenue30d / (metrics.totalRevenue - metrics.revenue30d)) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Total de Leads"
        value={metrics.totalLeads}
        subtitle={`${metrics.leads30d} nos últimos 30 dias`}
        icon={<Users className="h-6 w-6 text-primary" />}
        trend={leadsTrend !== 0 ? { value: Math.round(leadsTrend), isPositive: leadsTrend > 0 } : undefined}
      />
      
      <MetricCard
        title="Deals Ativos"
        value={metrics.activeDeals}
        subtitle={`${metrics.wonDeals} ganhos | ${metrics.lostDeals} perdidos`}
        icon={<Target className="h-6 w-6 text-primary" />}
      />
      
      <MetricCard
        title="Receita Total"
        value={formatCurrency(metrics.totalRevenue)}
        subtitle={`${formatCurrency(metrics.revenue30d)} nos últimos 30 dias`}
        icon={<DollarSign className="h-6 w-6 text-primary" />}
        trend={revenueTrend > 0 ? { value: Math.round(revenueTrend), isPositive: true } : undefined}
      />
      
      <MetricCard
        title="Taxa de Conversão"
        value={`${metrics.overallConversionRate.toFixed(1)}%`}
        subtitle={`Pipeline: ${formatCurrency(metrics.pipelineValue)}`}
        icon={<Activity className="h-6 w-6 text-primary" />}
      />
    </div>
  );
};
