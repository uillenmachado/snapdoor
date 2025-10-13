// @ts-nocheck
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRevenueForecast } from "@/hooks/useAnalytics";
import { Loader2, TrendingUp, DollarSign, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const STAGE_COLORS: Record<string, string> = {
  qualified: 'bg-yellow-500',
  proposal: 'bg-blue-500',
  negotiation: 'bg-purple-500',
};

export const ForecastWidget = () => {
  const { data: forecast, isLoading } = useRevenueForecast();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Previsão de Receita</CardTitle>
          <CardDescription>Receita potencial baseada no pipeline</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!forecast || forecast.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Previsão de Receita</CardTitle>
          <CardDescription>Receita potencial baseada no pipeline</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
          <TrendingUp className="h-12 w-12 mb-2 opacity-50" />
          <p>Sem dados de previsão disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const totalPipeline = forecast.reduce((sum, item) => sum + item.totalValue, 0);
  const totalForecasted = forecast.reduce((sum, item) => sum + item.forecastedRevenue, 0);
  const totalDeals = forecast.reduce((sum, item) => sum + item.dealsCount, 0);

  const stageLabels: Record<string, string> = {
    qualified: 'Qualificado',
    proposal: 'Proposta',
    negotiation: 'Negociação',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Previsão de Receita
        </CardTitle>
        <CardDescription>Receita potencial baseada em probabilidades por stage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <DollarSign className="h-4 w-4" />
              Pipeline Total
            </div>
            <div className="text-xl font-bold">{formatCurrency(totalPipeline)}</div>
            <div className="text-xs text-muted-foreground mt-1">{totalDeals} deals</div>
          </div>
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
              <Target className="h-4 w-4" />
              Receita Prevista
            </div>
            <div className="text-xl font-bold text-green-600">{formatCurrency(totalForecasted)}</div>
            <div className="text-xs text-green-600/70 mt-1">
              {((totalForecasted / totalPipeline) * 100).toFixed(0)}% do pipeline
            </div>
          </div>
        </div>

        {/* Breakdown por stage */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Breakdown por Stage</h4>
          {forecast.map((stage, index) => {
            const percentage = (stage.forecastedRevenue / totalForecasted) * 100;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${STAGE_COLORS[stage.stageName] || 'bg-gray-500'}`} />
                    <span className="font-medium">{stageLabels[stage.stageName] || stage.stageName}</span>
                    <span className="text-xs text-muted-foreground">
                      ({stage.dealsCount} deals · {(stage.winProbability * 100).toFixed(0)}% prob.)
                    </span>
                  </div>
                  <span className="font-semibold">{formatCurrency(stage.forecastedRevenue)}</span>
                </div>
                <Progress value={percentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Pipeline: {formatCurrency(stage.totalValue)}</span>
                  <span>{percentage.toFixed(1)}% da previsão</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nota explicativa */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-600">
          <strong>Como funciona:</strong> A previsão é calculada multiplicando o valor total do pipeline em cada stage pela probabilidade de ganho (25% qualificado, 50% proposta, 75% negociação).
        </div>
      </CardContent>
    </Card>
  );
};
