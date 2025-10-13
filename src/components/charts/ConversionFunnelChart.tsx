// @ts-nocheck
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useConversionFunnel } from "@/hooks/useAnalytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Loader2, TrendingDown } from "lucide-react";

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#6b7280', '#ec4899'];

const STAGE_LABELS: Record<string, string> = {
  new: 'Novo',
  contacted: 'Contatado',
  qualified: 'Qualificado',
  proposal: 'Proposta',
  negotiation: 'Negociação',
  won: 'Ganho',
  lost: 'Perdido',
};

export const ConversionFunnelChart = () => {
  const { data: funnelData, isLoading } = useConversionFunnel();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
          <CardDescription>Visualize como leads progridem entre stages</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!funnelData || funnelData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
          <CardDescription>Visualize como leads progridem entre stages</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[350px] text-muted-foreground">
          <TrendingDown className="h-12 w-12 mb-2 opacity-50" />
          <p>Sem dados de funil disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = funnelData
    .filter(stage => stage.stage !== 'lost')
    .map(stage => ({
      name: STAGE_LABELS[stage.stage] || stage.stage,
      leads: stage.totalLeads,
      leads30d: stage.leads30d,
      conversionRate: stage.conversionRate,
    }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-medium text-foreground">{data.leads}</span> leads
          </p>
          <p className="text-sm text-muted-foreground">
            Últimos 30 dias: <span className="font-medium text-foreground">{data.leads30d}</span>
          </p>
          {data.conversionRate !== 100 && (
            <p className="text-sm text-muted-foreground">
              Taxa de conversão: <span className="font-medium text-foreground">{data.conversionRate}%</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funil de Conversão</CardTitle>
        <CardDescription>Visualize como leads progridem entre stages</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" className="text-xs" />
            <YAxis dataKey="name" type="category" className="text-xs" width={75} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="leads" name="Total de Leads" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        
        {/* Métricas de conversão */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {chartData.slice(0, 4).map((stage, index) => (
            <div key={index} className="text-center">
              <div className="font-semibold" style={{ color: COLORS[index] }}>{stage.name}</div>
              <div className="text-muted-foreground">{stage.leads} leads</div>
              {stage.conversionRate !== 100 && (
                <div className="text-xs text-muted-foreground">{stage.conversionRate}%</div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
