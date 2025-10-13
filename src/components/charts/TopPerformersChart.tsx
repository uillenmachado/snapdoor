// @ts-nocheck
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTopPerformers } from "@/hooks/useAnalytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { Loader2, Trophy, TrendingUp, DollarSign } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const COLORS = ['#fbbf24', '#a78bfa', '#60a5fa', '#34d399', '#f87171'];

interface TopPerformersChartProps {
  limit?: number;
}

export const TopPerformersChart = ({ limit = 5 }: TopPerformersChartProps) => {
  const { data: performers, isLoading } = useTopPerformers(limit);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>Melhores vendedores do período</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!performers || performers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>Melhores vendedores do período</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[350px] text-muted-foreground">
          <Trophy className="h-12 w-12 mb-2 opacity-50" />
          <p>Sem dados de performance disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = performers.slice(0, limit).map(performer => ({
    name: performer.fullName || performer.email.split('@')[0],
    email: performer.email,
    deals: performer.wonDeals,
    receita: performer.totalRevenue,
    ticketMedio: performer.avgDealValue,
    deals30d: performer.wonDeals30d,
  }));

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}k`;
    }
    return `R$ ${value.toFixed(0)}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
          <p className="font-semibold mb-2">{data.name}</p>
          <p className="text-xs text-muted-foreground mb-1">{data.email}</p>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Deals ganhos: <span className="font-medium text-foreground">{data.deals}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Receita total: <span className="font-medium text-green-600">{formatCurrency(data.receita)}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Ticket médio: <span className="font-medium text-foreground">{formatCurrency(data.ticketMedio)}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Últimos 30d: <span className="font-medium text-foreground">{data.deals30d} deals</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Performers
        </CardTitle>
        <CardDescription>Melhores vendedores do período</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis type="number" className="text-xs" tickFormatter={formatCurrency} />
            <YAxis dataKey="name" type="category" className="text-xs" width={95} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="receita" name="Receita" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Lista detalhada */}
        <div className="mt-4 space-y-3">
          {chartData.map((performer, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback style={{ backgroundColor: COLORS[index % COLORS.length] + '20', color: COLORS[index % COLORS.length] }}>
                      {getInitials(performer.name, performer.email)}
                    </AvatarFallback>
                  </Avatar>
                  {index === 0 && (
                    <Trophy className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{performer.name}</p>
                  <p className="text-xs text-muted-foreground">{performer.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600">{formatCurrency(performer.receita)}</p>
                <p className="text-xs text-muted-foreground">{performer.deals} deals</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
