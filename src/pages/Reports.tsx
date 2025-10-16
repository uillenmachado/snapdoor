import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { PageHeader } from "@/components/PageHeader";
import { LeadHistorySection } from "@/components/LeadHistorySection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, Download, RefreshCcw, FileText, BarChart3 } from "lucide-react";
import { MetricsWidget, ForecastWidget } from "@/components/DashboardWidgets";
import { 
  ConversionFunnelChart, 
  RevenueChart, 
  SalesTrendChart, 
  ActivityChart,
  TopPerformersChart 
} from "@/components/charts";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import html2canvas from "html2canvas";

const Reports = () => {
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [isExporting, setIsExporting] = useState(false);
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboardMetrics"] });
    queryClient.invalidateQueries({ queryKey: ["conversionFunnel"] });
    queryClient.invalidateQueries({ queryKey: ["revenueMetrics"] });
    queryClient.invalidateQueries({ queryKey: ["salesTrend"] });
    queryClient.invalidateQueries({ queryKey: ["topPerformers"] });
    queryClient.invalidateQueries({ queryKey: ["activityMetrics"] });
    queryClient.invalidateQueries({ queryKey: ["revenueForecast"] });
    toast.success("Dados atualizados!");
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById("reports-content");
      if (!element) {
        throw new Error("Elemento não encontrado");
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `relatorio-snapdoor-${new Date().toISOString().split("T")[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();

      toast.success("Relatório exportado com sucesso!");
    } catch (error) {
      console.error("Erro ao exportar:", error);
      toast.error("Erro ao exportar relatório");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <PageHeader
            title="Relatórios & Analytics"
            description="Análise detalhada de performance e métricas"
            actions={
              <div className="flex items-center gap-3 flex-wrap">
                <Select value={periodDays.toString()} onValueChange={(v) => setPeriodDays(parseInt(v))}>
                  <SelectTrigger className="w-[160px]">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleExportPDF} 
                  disabled={isExporting}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? "Exportando..." : "Exportar"}
                </Button>
              </div>
            }
          />

          <main className="flex-1 overflow-auto p-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-card border border-border p-1 rounded-lg h-auto">
                <TabsTrigger 
                  value="overview"
                  className="py-2.5"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger 
                  value="sales"
                  className="py-2.5"
                >
                  Vendas & Receita
                </TabsTrigger>
                <TabsTrigger 
                  value="performance"
                  className="py-2.5"
                >
                  Performance
                </TabsTrigger>
                <TabsTrigger 
                  value="conversions"
                  className="py-2.5"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Conversões
                </TabsTrigger>
              </TabsList>
              
              {/* Content Area - Cards com espaçamento profissional */}
              <div id="reports-content" className="mt-6">
                <TabsContent value="overview" className="space-y-6 mt-0">
                  <div className="bg-card rounded-lg border border-border p-6">
                    <MetricsWidget />
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-card rounded-lg border border-border p-6">
                      <ConversionFunnelChart />
                    </div>
                    <div className="bg-card rounded-lg border border-border p-6">
                      <ForecastWidget />
                    </div>
                  </div>

                  <div className="bg-card rounded-lg border border-border p-6">
                    <ActivityChart days={periodDays} />
                  </div>
                </TabsContent>
                
                <TabsContent value="sales" className="space-y-6 mt-0">
                  <div className="bg-card rounded-lg border border-border p-6">
                    <RevenueChart periodType="day" limit={periodDays} chartType="area" />
                  </div>
                  <div className="bg-card rounded-lg border border-border p-6">
                    <SalesTrendChart days={periodDays} />
                  </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-6 mt-0">
                  <div className="bg-card rounded-lg border border-border p-6">
                    <TopPerformersChart limit={10} />
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-card rounded-lg border border-border p-6">
                      <ActivityChart days={periodDays} />
                    </div>
                    <div className="bg-card rounded-lg border border-border p-6">
                      <ForecastWidget />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="conversions" className="mt-0">
                  <div className="bg-card rounded-lg border border-border p-6">
                    <LeadHistorySection />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Reports;
