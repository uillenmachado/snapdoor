// @ts-nocheck
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRevenueMetrics } from "@/hooks/useAnalytics";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2, DollarSign } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RevenueChartProps {
  periodType?: "day" | "week" | "month";
  limit?: number;
  chartType?: "line" | "area";
}

export const RevenueChart = ({ periodType = "day", limit = 30, chartType = "area" }: RevenueChartProps) => {
  const { data: revenueData, isLoading } = useRevenueMetrics(periodType, limit);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Receita no Período</CardTitle>
          <CardDescription>Evolução da receita ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!revenueData || revenueData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Receita no Período</CardTitle>
          <CardDescription>Evolução da receita ao longo do tempo</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[350px] text-muted-foreground">
          <DollarSign className="h-12 w-12 mb-2 opacity-50" />
          <p>Sem dados de receita disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (periodType === "day") {
        return format(date, "dd/MM", { locale: ptBR });
      } else if (periodType === "week") {
        return format(date, "dd MMM", { locale: ptBR });
      } else {
        return format(date, "MMM/yy", { locale: ptBR });
      }
    } catch {
      return dateString;
    }
  };

  const chartData = [...revenueData].reverse().map(item => ({
    date: formatDate(item.periodDate),
    receita: item.totalRevenue,
    deals: item.dealsCount,
    ticketMedio: item.avgDealValue,
  }));

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalDeals = revenueData.reduce((sum, item) => sum + item.dealsCount, 0);
  const avgTicket = totalDeals > 0 ? totalRevenue / totalDeals : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold mb-1">{data.date}</p>
          <p className="text-sm text-muted-foreground">
            Receita: <span className="font-medium text-green-600">{formatCurrency(data.receita)}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Deals: <span className="font-medium text-foreground">{data.deals}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Ticket médio: <span className="font-medium text-foreground">{formatCurrency(data.ticketMedio)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const ChartComponent = chartType === "area" ? AreaChart : LineChart;
  const DataComponent = chartType === "area" ? Area : Line;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receita no Período</CardTitle>
        <CardDescription>Evolução da receita ao longo do tempo</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <ChartComponent data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <DataComponent
              type="monotone"
              dataKey="receita"
              name="Receita"
              stroke="#10b981"
              strokeWidth={2}
              fill={chartType === "area" ? "url(#colorReceita)" : undefined}
              dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </ChartComponent>
        </ResponsiveContainer>

        {/* Resumo de métricas */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-muted-foreground text-xs mb-1">Receita Total</div>
            <div className="font-bold text-lg text-green-600">{formatCurrency(totalRevenue)}</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-muted-foreground text-xs mb-1">Deals Fechados</div>
            <div className="font-bold text-lg">{totalDeals}</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-muted-foreground text-xs mb-1">Ticket Médio</div>
            <div className="font-bold text-lg">{formatCurrency(avgTicket)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
