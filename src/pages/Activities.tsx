import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ActivityFeed } from "@/components/ActivityFeed";
import { useAuth } from "@/hooks/useAuth";
import { useUserActivities } from "@/hooks/useActivities";
import { ActivityFilters, ActivityType, ACTIVITY_CONFIG } from "@/types/activity";
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
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-xl font-semibold">Atividades</h1>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Atividades</CardTitle>
                <ActivityIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalActivities || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.recentCount || 0} nas últimas 24h
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.thisWeek || 0}</div>
                <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mais Frequente</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.byType ? Object.keys(stats.byType).length : 0}
                </div>
                <p className="text-xs text-muted-foreground">Tipos diferentes</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-4">
              <div className="relative flex-1 max-w-sm">
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

            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Atividade
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <ActivityFeed activities={activities} showRelated={true} />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
