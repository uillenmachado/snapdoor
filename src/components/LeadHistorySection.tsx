import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLeadHistory, useLeadHistoryStats } from "@/hooks/useLeadHistory";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle2, XCircle, TrendingUp, DollarSign, Target, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function LeadHistorySection() {
  const { user } = useAuth();
  const { data: history, isLoading: historyLoading } = useLeadHistory(user?.id);
  const { data: stats, isLoading: statsLoading } = useLeadHistoryStats(user?.id);

  if (historyLoading || statsLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!history || !stats) return null;

  const wonLeads = history.filter(h => h.status === "won");
  const lostLeads = history.filter(h => h.status === "lost");

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Leads Ganhos</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalWon}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  R$ {stats.totalRevenue.toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-xs text-muted-foreground">Taxa de Conversão</p>
                <p className="text-2xl font-bold text-purple-600">{stats.conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-xs text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold text-orange-600">
                  R$ {stats.averageDealValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico Detalhado */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Conversões</CardTitle>
          <CardDescription>
            Leads convertidos em ganhos ou perdas com detalhes para análise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Todos ({history.length})</TabsTrigger>
              <TabsTrigger value="won" className="text-green-600">
                Ganhos ({wonLeads.length})
              </TabsTrigger>
              <TabsTrigger value="lost" className="text-red-600">
                Perdidos ({lostLeads.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-4">
              <HistoryList leads={history} />
            </TabsContent>

            <TabsContent value="won" className="space-y-4 mt-4">
              <HistoryList leads={wonLeads} />
            </TabsContent>

            <TabsContent value="lost" className="space-y-4 mt-4">
              <HistoryList leads={lostLeads} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Análise de Motivos de Perda */}
      {stats.topLostReasons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Principais Motivos de Perda
            </CardTitle>
            <CardDescription>
              Análise dos motivos mais comuns para otimizar o processo de vendas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topLostReasons.map((reason, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">{reason.reason}</span>
                  <Badge variant="secondary">{reason.count} leads</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function HistoryList({ leads }: { leads: any[] }) {
  if (leads.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Nenhum registro encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {leads.map((record) => (
        <div
          key={record.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            {record.status === "won" ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <div>
              <p className="font-medium">
                {record.lead_data.first_name} {record.lead_data.last_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {record.lead_data.company} • {record.lead_data.job_title}
              </p>
              {record.status === "lost" && record.lost_reason && (
                <p className="text-xs text-red-600">Motivo: {record.lost_reason}</p>
              )}
              {record.notes && (
                <p className="text-xs text-muted-foreground mt-1">{record.notes}</p>
              )}
            </div>
          </div>
          
          <div className="text-right">
            {record.status === "won" && record.deal_value && (
              <p className="font-bold text-green-600">
                R$ {record.deal_value.toLocaleString('pt-BR')}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(record.created_at), {
                addSuffix: true,
                locale: ptBR
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}