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
    const totalLeads = leads.length;
    const activeLeads = leads.length; // All leads are considered active
    
    // Calculate conversion rate (leads that moved to later stages)
    const sortedStages = [...stages].sort((a, b) => a.position - b.position);
    const firstStageId = sortedStages[0]?.id;
    const lastStageId = sortedStages[sortedStages.length - 1]?.id;
    const leadsInFirstStage = leads.filter(lead => lead.stage_id === firstStageId).length;
    const leadsInLastStage = leads.filter(lead => lead.stage_id === lastStageId).length;
    const conversionRate = totalLeads > 0 ? ((leadsInLastStage / totalLeads) * 100).toFixed(1) : 0;
    
    // Calculate estimated revenue (R$500 per lead in final stages)
    const estimatedRevenue = leadsInLastStage * 500;
    
    // Calculate activity rate (leads with recent activity)
    const recentLeads = leads.filter(lead => {
      const updatedAt = new Date(lead.updated_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 7;
    }).length;
    const activityRate = totalLeads > 0 ? ((recentLeads / totalLeads) * 100).toFixed(1) : 0;
    
    return {
      totalLeads,
      activeLeads,
      conversionRate,
      estimatedRevenue,
      activityRate,
      recentLeads
    };
  }, [leads, stages]);

  const metricsData = [
    {
      title: "Total de Leads",
      value: metrics.totalLeads,
      subtitle: `${metrics.activeLeads} ativos`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      trend: "+12%",
      trendUp: true
    },
    {
      title: "Taxa de Conversão",
      value: `${metrics.conversionRate}%`,
      subtitle: "Pipeline completo",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      trend: "+5.2%",
      trendUp: true
    },
    {
      title: "Receita Estimada",
      value: `R$ ${(metrics.estimatedRevenue / 1000).toFixed(1)}k`,
      subtitle: "Este mês",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      trend: "+8.1%",
      trendUp: true
    },
    {
      title: "Taxa de Atividade",
      value: `${metrics.activityRate}%`,
      subtitle: `${metrics.recentLeads} nos últimos 7 dias`,
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
      trend: "-2.3%",
      trendUp: false
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
