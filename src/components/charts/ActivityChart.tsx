// @ts-nocheck
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useActivityMetrics } from "@/hooks/useAnalytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2, Activity } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

const ACTIVITY_COLORS: Record<string, string> = {
  call: '#3b82f6',
  email: '#10b981',
  meeting: '#8b5cf6',
  task: '#f59e0b',
  note: '#6b7280',
};

const ACTIVITY_LABELS: Record<string, string> = {
  call: 'Ligação',
  email: 'Email',
  meeting: 'Reunião',
  task: 'Tarefa',
  note: 'Nota',
};

interface ActivityChartProps {
  days?: number;
}

export const ActivityChart = ({ days = 30 }: ActivityChartProps) => {
  const { data: activityData, isLoading } = useActivityMetrics(days);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividades</CardTitle>
          <CardDescription>Distribuição de atividades por tipo</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!activityData || activityData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividades</CardTitle>
          <CardDescription>Distribuição de atividades por tipo</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[350px] text-muted-foreground">
          <Activity className="h-12 w-12 mb-2 opacity-50" />
          <p>Sem dados de atividades disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  // Agrupar por tipo de atividade
  const activityByType = activityData.reduce((acc, item) => {
    if (!acc[item.activityType]) {
      acc[item.activityType] = {
        type: item.activityType,
        total: 0,
        last7d: 0,
        last30d: 0,
      };
    }
    acc[item.activityType].total += item.count;
    acc[item.activityType].last7d += item.count7d;
    acc[item.activityType].last30d += item.count30d;
    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(activityByType).map((item: any) => ({
    name: ACTIVITY_LABELS[item.type] || item.type,
    total: item.total,
    ultimos7d: item.last7d,
    ultimos30d: item.last30d,
    color: ACTIVITY_COLORS[item.type] || '#6b7280',
  }));

  const totalActivities = chartData.reduce((sum, item) => sum + item.total, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold mb-1">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-medium text-foreground">{data.total}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Últimos 7 dias: <span className="font-medium text-foreground">{data.ultimos7d}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Últimos 30 dias: <span className="font-medium text-foreground">{data.ultimos30d}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividades</CardTitle>
        <CardDescription>Distribuição de atividades por tipo</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="ultimos7d" name="Últimos 7 dias" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="ultimos30d" name="Últimos 30 dias" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* Resumo */}
        <div className="mt-4 text-center p-3 bg-muted/50 rounded-lg">
          <div className="text-muted-foreground text-xs mb-1">Total de Atividades</div>
          <div className="font-bold text-2xl">{totalActivities}</div>
        </div>
      </CardContent>
    </Card>
  );
};
