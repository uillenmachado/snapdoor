import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { UsageLimits } from "@/components/UsageLimits";
import { NotificationBell } from "@/components/NotificationBell";
import { TasksWidget } from "@/components/TasksWidget";
import { MeetingsWidget } from "@/components/MeetingsWidget";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, ArrowRight, LayoutGrid } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePipeline, useStages } from "@/hooks/usePipelines";
import { useDeals } from "@/hooks/useDeals";
import { useSubscription } from "@/hooks/useSubscription";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  // Fetch data
  const { data: pipeline } = usePipeline(user?.id);
  const { data: stages } = useStages(pipeline?.id);
  const { data: deals, isLoading: dealsLoading } = useDeals(user?.id);
  const { data: subscription } = useSubscription(user?.id);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Loading state
  if (authLoading || dealsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header Superior - Ações Rápidas */}
          <header className="border-b border-border bg-card sticky top-0 z-10">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                      Visão geral do seu negócio
                    </p>
                  </div>
                </div>
                <UsageLimits 
                  subscription={subscription} 
                  leadsCount={deals?.length || 0}
                  pipelinesCount={1}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <NotificationBell />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            {/* Dashboard Metrics */}
            <DashboardMetrics leads={deals || [] as any} stages={(stages || []) as any} />
            
            {/* Acesso Rápido ao Pipeline */}
            <Card className="mt-6 bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <LayoutGrid className="h-5 w-5" />
                      Pipeline de Vendas
                    </CardTitle>
                    <CardDescription>
                      Gerencie seus negócios através do funil de vendas
                    </CardDescription>
                  </div>
                  <Button onClick={() => navigate('/pipelines')}>
                    Ver Pipeline Completo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex flex-col p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Total de Negócios</span>
                    </div>
                    <div className="text-3xl font-bold">
                      {deals?.filter(d => d.status === 'open').length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stages?.length || 0} etapas ativas
                    </p>
                  </div>

                  <div className="flex flex-col p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">💰</span>
                      <span className="text-sm font-medium">Valor Total</span>
                    </div>
                    <div className="text-3xl font-bold">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        minimumFractionDigits: 0,
                      }).format(
                        deals?.filter(d => d.status === 'open').reduce((sum, deal) => sum + (deal.value || 0), 0) || 0
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Em negociação
                    </p>
                  </div>

                  <div className="flex flex-col p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🎯</span>
                      <span className="text-sm font-medium">Taxa de Conversão</span>
                    </div>
                    <div className="text-3xl font-bold">
                      {deals && deals.length > 0
                        ? ((deals.filter(d => d.status === 'won').length / deals.length) * 100).toFixed(1)
                        : '0'
                      }%
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {deals?.filter(d => d.status === 'won').length || 0} negócios ganhos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Widgets de Tarefas e Reuniões */}
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <TasksWidget />
              <MeetingsWidget />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
