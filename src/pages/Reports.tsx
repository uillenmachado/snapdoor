// @ts-nocheck
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
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

        <div className="flex-1 flex flex-col">
          <header className="border-b border-border bg-card sticky top-0 z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 gap-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Relatórios & Analytics</h1>
                  <p className="text-sm text-muted-foreground">Análise detalhada de performance e métricas</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Select value={periodDays.toString()} onValueChange={(v) => setPeriodDays(parseInt(v))}>
                  <SelectTrigger className="w-[140px]">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>

                <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={isExporting}>
                  <Download className="h-4 w-4 mr-2" />
                  {isExporting ? "Exportando..." : "Exportar"}
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="sales">Vendas & Receita</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="conversions">
                  <FileText className="h-4 w-4 mr-2" />
                  Conversões
                </TabsTrigger>
              </TabsList>
              
              <div id="reports-content">
                <TabsContent value="overview" className="mt-6 space-y-6">
                  <MetricsWidget />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ConversionFunnelChart />
                    <ForecastWidget />
                  </div>

                  <ActivityChart days={periodDays} />
                </TabsContent>
                
                <TabsContent value="sales" className="mt-6 space-y-6">
                  <RevenueChart periodType="day" limit={periodDays} chartType="area" />
                  <SalesTrendChart days={periodDays} />
                </TabsContent>

                <TabsContent value="performance" className="mt-6 space-y-6">
                  <TopPerformersChart limit={10} />
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <ActivityChart days={periodDays} />
                    <ForecastWidget />
                  </div>
                </TabsContent>
                
                <TabsContent value="conversions" className="mt-6">
                  <LeadHistorySection />
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
