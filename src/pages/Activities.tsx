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
import { useActivitiesAdvanced, useActivityStats } from "@/hooks/useActivities";
import { ActivityFilters, ActivityType, ACTIVITY_CONFIG } from "@/types/activity";
import { Search, Plus, TrendingUp, Clock, Activity as ActivityIcon } from "lucide-react";

export default function Activities() {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ActivityFilters>({
    sortBy: "created_at",
    sortOrder: "desc",
  });

  const { data, isLoading } = useActivitiesAdvanced(filters, page, 20);
  const { data: stats } = useActivityStats(user?.id);

  const activities = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / 20);

  const handleSearch = (value: string) => {
    setFilters({ ...filters, search: value });
    setPage(1);
  };

  const handleTypeFilter = (value: string) => {
    setFilters({ ...filters, type: value === "all" ? undefined : value as ActivityType });
    setPage(1);
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
                  value={filters.search || ""}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              <Select
                value={filters.type || "all"}
                onValueChange={handleTypeFilter}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {Object.entries(ACTIVITY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Atividade
            </Button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : (
            <>
              <ActivityFeed activities={activities} showRelated={true} />

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
