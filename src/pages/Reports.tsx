import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { LeadHistorySection } from "@/components/LeadHistorySection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Reports = () => {

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          <header className="border-b border-border bg-card sticky top-0 z-10">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-2xl font-bold text-foreground">Relatórios & Analytics</h1>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <Tabs defaultValue="analytics" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="analytics">Analytics Geral</TabsTrigger>
                <TabsTrigger value="conversions">Histórico de Conversões</TabsTrigger>
              </TabsList>
              
              <TabsContent value="analytics" className="mt-6">
                <AnalyticsDashboard />
              </TabsContent>
              
              <TabsContent value="conversions" className="mt-6">
                <LeadHistorySection />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Reports;
