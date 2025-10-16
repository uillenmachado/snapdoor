import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ActivityFeed } from "@/components/ActivityFeed";
import { useAuth } from "@/hooks/useAuth";
import { useUserActivities } from "@/hooks/useActivities";
import { PageHeader } from "@/components/PageHeader";
import { MetricCard } from "@/components/MetricCard";
import { Search, Plus, TrendingUp, Clock, Activity as ActivityIcon } from "lucide-react";

export default function Activities() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useUserActivities(user?.id);
  
  // Processar dados temporariamente até implementar hooks avançados
  const allActivities = data || [];
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const stats = {
    totalActivities: allActivities.length,
    thisWeek: allActivities.filter((a: any) => 
      new Date(a.created_at) > weekAgo
    ).length,
    byType: allActivities.reduce((acc: Record<string, number>, a: any) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {}),
    recentCount: allActivities.filter((a: any) => {
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      return new Date(a.created_at) > dayAgo;
    }).length
  };
  
  // Filtrar atividades por busca
  const filteredActivities = search
    ? allActivities.filter((a: any) =>
        a.description?.toLowerCase().includes(search.toLowerCase()) ||
        a.type?.toLowerCase().includes(search.toLowerCase())
      )
    : allActivities;
  
  // Converter para formato Activity (com title)
  const activities = filteredActivities.map((a: any) => ({
    ...a,
    title: a.description || a.type,
    updated_at: a.created_at
  }));

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <PageHeader
            title="Atividades"
            description="Acompanhe todas as atividades do seu time"
            actions={
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Atividade
              </Button>
            }
          />

          <main className="flex-1 overflow-auto p-6">
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <MetricCard
                title="Total de Atividades"
                value={stats?.totalActivities || 0}
                description={`${stats?.recentCount || 0} nas últimas 24h`}
                icon={<ActivityIcon className="h-4 w-4" />}
              />

              <MetricCard
                title="Esta Semana"
                value={stats?.thisWeek || 0}
                description="Últimos 7 dias"
                icon={<TrendingUp className="h-4 w-4" />}
                variant="info"
              />

              <MetricCard
                title="Tipos de Atividade"
                value={stats?.byType ? Object.keys(stats.byType).length : 0}
                description="Tipos diferentes"
                icon={<Clock className="h-4 w-4" />}
              />
            </div>

            <div className="mb-6">
              <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar atividades..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : (
              <ActivityFeed activities={activities} showRelated={true} />
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
