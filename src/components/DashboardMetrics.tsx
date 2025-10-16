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
  }, [leads]); // stages não é usado no cálculo

  const metricsData = [
    {
      title: "Valor do Pipeline",
      value: metrics.pipelineValue >= 1000 
        ? `R$ ${(metrics.pipelineValue / 1000).toFixed(0)}k`
        : `R$ ${metrics.pipelineValue.toFixed(0)}`,
      subtitle: `${metrics.activeDeals} negócios ativos`,
      icon: DollarSign,
      color: "text-brand-green-600 dark:text-brand-green-500",
      bgColor: "bg-brand-green-50 dark:bg-brand-green-900/20",
      borderColor: "border-brand-green-200 dark:border-brand-green-800",
      trend: "+12%",
      trendUp: true
    },
    {
      title: "Taxa de Conversão",
      value: `${metrics.conversionRate}%`,
      subtitle: `${metrics.wonDeals} fechados`,
      icon: TrendingUp,
      color: "text-success-600 dark:text-success-500",
      bgColor: "bg-success-50 dark:bg-success-900/20",
      borderColor: "border-success-200 dark:border-success-800",
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
      color: "text-brand-purple-600 dark:text-brand-purple-500",
      bgColor: "bg-brand-purple-50 dark:bg-brand-purple-900/20",
      borderColor: "border-brand-purple-200 dark:border-brand-purple-800",
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
      color: "text-warning-600 dark:text-warning-500",
      bgColor: "bg-warning-50 dark:bg-warning-900/20",
      borderColor: "border-warning-200 dark:border-warning-800",
      trend: `${metrics.activityRate}%`,
      trendUp: parseFloat(metrics.activityRate as string) > 50
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
      {metricsData.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card 
            key={index} 
            className={`bg-card border ${metric.borderColor} hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2">
                    {metric.title}
                  </p>
                  <h3 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-1.5 group-hover:text-brand-green-600 dark:group-hover:text-brand-green-500 transition-colors">
                    {metric.value}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                    {metric.subtitle}
                  </p>
                </div>
                <div className={`${metric.bgColor} p-3 rounded-xl transition-transform duration-300 group-hover:scale-110`}>
                  <Icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                {metric.trendUp ? (
                  <TrendingUp className="h-3.5 w-3.5 text-success-600 dark:text-success-500" />
                ) : (
                  <TrendingUp className="h-3.5 w-3.5 text-danger-600 dark:text-danger-500 rotate-180" />
                )}
                <span className={`text-xs font-semibold ${metric.trendUp ? 'text-success-600 dark:text-success-500' : 'text-danger-600 dark:text-danger-500'}`}>
                  {metric.trend}
                </span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-0.5">vs último mês</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
