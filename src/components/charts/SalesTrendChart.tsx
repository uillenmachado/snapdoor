// @ts-nocheck
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSalesTrend } from "@/hooks/useAnalytics";
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2, TrendingUp } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SalesTrendChartProps {
  days?: number;
}

export const SalesTrendChart = ({ days = 30 }: SalesTrendChartProps) => {
  const { data: trendData, isLoading } = useSalesTrend(days);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tendência de Vendas</CardTitle>
          <CardDescription>Deals ganhos e receita com média móvel</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!trendData || trendData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tendência de Vendas</CardTitle>
          <CardDescription>Deals ganhos e receita com média móvel</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[350px] text-muted-foreground">
          <TrendingUp className="h-12 w-12 mb-2 opacity-50" />
          <p>Sem dados de vendas disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "dd/MM", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const chartData = [...trendData].reverse().map(item => ({
    date: formatDate(item.date),
    deals: item.dealsWon,
    receita: item.revenue,
    mediaMovel: item.revenue7dAvg,
  }));

  const totalDeals = trendData.reduce((sum, item) => sum + item.dealsWon, 0);
  const totalRevenue = trendData.reduce((sum, item) => sum + item.revenue, 0);
  const avgDailyDeals = totalDeals / trendData.length;

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
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-semibold mb-1">{data.date}</p>
          <p className="text-sm text-muted-foreground">
            Deals: <span className="font-medium text-foreground">{data.deals}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Receita: <span className="font-medium text-green-600">{formatCurrency(data.receita)}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Média 7d: <span className="font-medium text-blue-600">{formatCurrency(data.mediaMovel)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendência de Vendas</CardTitle>
        <CardDescription>Deals ganhos e receita com média móvel de 7 dias</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis 
              yAxisId="left" 
              className="text-xs" 
              tickFormatter={formatCurrency} 
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              className="text-xs" 
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              yAxisId="left"
              dataKey="receita" 
              name="Receita" 
              fill="#10b981" 
              opacity={0.8}
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="mediaMovel"
              name="Média Móvel 7d"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={false}
              strokeDasharray="5 5"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="deals"
              name="Deals"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: "#f59e0b", strokeWidth: 2, r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Resumo de métricas */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-muted-foreground text-xs mb-1">Total de Deals</div>
            <div className="font-bold text-lg">{totalDeals}</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-muted-foreground text-xs mb-1">Receita Total</div>
            <div className="font-bold text-lg text-green-600">{formatCurrency(totalRevenue)}</div>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-muted-foreground text-xs mb-1">Média Diária</div>
            <div className="font-bold text-lg">{avgDailyDeals.toFixed(1)} deals</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
