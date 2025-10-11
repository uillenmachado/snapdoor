import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, DollarSign, Target, Activity, Zap } from "lucide-react";
import { Lead } from "@/hooks/useLeads";

interface Stage {
  id: string;
  name: string;
  position: number;
}

interface DashboardMetricsProps {
  leads: Lead[];
  stages: Stage[];
}

export const DashboardMetrics = ({ leads, stages }: DashboardMetricsProps) => {
  const metrics = useMemo(() => {
    const totalDeals = leads.length;
    const activeDeals = leads.filter(lead => lead.status !== 'won' && lead.status !== 'lost').length;
    
    // Calculate VALOR TOTAL DO PIPELINE (soma dos deal_value)
    const pipelineValue = leads
      .filter(lead => lead.status !== 'won' && lead.status !== 'lost')
      .reduce((sum, lead) => sum + (lead.deal_value || 0), 0);
    
    // Calculate VALOR PONDERADO (weighted value = valor × probabilidade)
    const weightedValue = leads
      .filter(lead => lead.status !== 'won' && lead.status !== 'lost')
      .reduce((sum, lead) => sum + ((lead.deal_value || 0) * (lead.probability || 50) / 100), 0);
    
    // Calculate TICKET MÉDIO (valor médio dos negócios)
    const avgDealValue = activeDeals > 0 ? pipelineValue / activeDeals : 0;
    
    // Calculate TAXA DE CONVERSÃO (won / total)
    const wonDeals = leads.filter(lead => lead.status === 'won').length;
    const lostDeals = leads.filter(lead => lead.status === 'lost').length;
    const closedDeals = wonDeals + lostDeals;
    const conversionRate = closedDeals > 0 ? ((wonDeals / closedDeals) * 100).toFixed(1) : 0;
    
    // Calculate RECEITA FECHADA (soma dos valores ganhos)
    const wonRevenue = leads
      .filter(lead => lead.status === 'won')
      .reduce((sum, lead) => sum + (lead.deal_value || 0), 0);
    
    // Calculate activity rate (deals with recent activity)
    const recentDeals = leads.filter(lead => {
      const updatedAt = new Date(lead.updated_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    }).length;
    const activityRate = totalDeals > 0 ? ((recentDeals / totalDeals) * 100).toFixed(1) : 0;
    
    return {
      totalDeals,
      activeDeals,
      pipelineValue,
      weightedValue,
      avgDealValue,
      conversionRate,
      wonDeals,
      wonRevenue,
      activityRate,
      recentDeals
    };
  }, [leads, stages]);

  const metricsData = [
    {
      title: "Valor do Pipeline",
      value: metrics.pipelineValue >= 1000 
        ? `R$ ${(metrics.pipelineValue / 1000).toFixed(0)}k`
        : `R$ ${metrics.pipelineValue.toFixed(0)}`,
      subtitle: `${metrics.activeDeals} negócios ativos`,
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      trend: "+12%",
      trendUp: true
    },
    {
      title: "Taxa de Conversão",
      value: `${metrics.conversionRate}%`,
      subtitle: `${metrics.wonDeals} fechados`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      trend: "+5.2%",
      trendUp: true
    },
    {
      title: "Receita Fechada",
      value: metrics.wonRevenue >= 1000 
        ? `R$ ${(metrics.wonRevenue / 1000).toFixed(0)}k`
        : `R$ ${metrics.wonRevenue.toFixed(0)}`,
      subtitle: `${metrics.wonDeals} negócios ganhos`,
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      trend: "+8.1%",
      trendUp: true
    },
    {
      title: "Ticket Médio",
      value: metrics.avgDealValue >= 1000 
        ? `R$ ${(metrics.avgDealValue / 1000).toFixed(1)}k`
        : `R$ ${metrics.avgDealValue.toFixed(0)}`,
      subtitle: `${metrics.recentDeals} atualizados em 7d`,
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      trend: `${metrics.activityRate}%`,
      trendUp: parseFloat(metrics.activityRate as string) > 50
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {metricsData.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card 
            key={index} 
            className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-l-4"
            style={{ borderLeftColor: metric.color.replace('text-', '') }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {metric.title}
                  </p>
                  <h3 className="text-3xl font-bold mb-1">
                    {metric.value}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {metric.subtitle}
                  </p>
                </div>
                <div className={`${metric.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1">
                {metric.trendUp ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />
                )}
                <span className={`text-xs font-medium ${metric.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.trend}
                </span>
                <span className="text-xs text-muted-foreground ml-1">vs último mês</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
