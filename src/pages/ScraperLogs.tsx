// @ts-nocheck
import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  Trash2,
  Play,
  Ban,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  useScraperJobs,
  useScraperLogs,
  useScraperStats,
  useQueueDashboard,
  useRetryJob,
  useCancelJob,
  useDeleteJob,
  useClearJobs,
  getStatusColor,
  getLogLevelColor,
  calculateProgress,
  formatDuration,
  type JobStatus,
} from "@/hooks/useScraperQueue";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ScraperLogs = () => {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<JobStatus | 'all'>('all');

  // Queries
  const { data: allJobs, isLoading: loadingAllJobs } = useScraperJobs(undefined, 100);
  const { data: pendingJobs } = useScraperJobs('pending', 50);
  const { data: processingJobs } = useScraperJobs('processing', 50);
  const { data: completedJobs } = useScraperJobs('completed', 50);
  const { data: failedJobs } = useScraperJobs('failed', 50);
  const { data: dashboard } = useQueueDashboard();
  const { data: stats } = useScraperStats(7);
  const { data: logs, isLoading: loadingLogs } = useScraperLogs(selectedJobId || '');

  // Mutations
  const retryJob = useRetryJob();
  const cancelJob = useCancelJob();
  const deleteJob = useDeleteJob();
  const clearJobs = useClearJobs();

  // Get jobs based on active tab
  const getJobsForTab = () => {
    switch (activeTab) {
      case 'pending':
        return pendingJobs || [];
      case 'processing':
        return processingJobs || [];
      case 'completed':
        return completedJobs || [];
      case 'failed':
        return failedJobs || [];
      default:
        return allJobs || [];
    }
  };

  const jobs = getJobsForTab();

  // Calculate stats
  const totalJobs = dashboard?.pending_jobs + dashboard?.processing_jobs + dashboard?.completed_jobs + dashboard?.failed_jobs + dashboard?.cancelled_jobs || 0;
  const successRate = totalJobs > 0 
    ? Math.round((dashboard?.completed_jobs / totalJobs) * 100) 
    : 0;

  const totalCreditsUsed = stats?.reduce((sum, stat) => sum + (stat.total_credits_used || 0), 0) || 0;
  const avgDuration = stats?.length > 0
    ? stats.reduce((sum, stat) => sum + (stat.avg_duration_seconds || 0), 0) / stats.length
    : 0;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1">
          <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Scraper Logs</h1>
                <p className="text-muted-foreground mt-1">
                  Monitore e gerencie jobs de enriquecimento de dados
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </div>

            {/* Dashboard Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Jobs Pendentes
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboard?.pending_jobs || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Aguardando processamento
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Em Processamento
                  </CardTitle>
                  <Activity className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-500">
                    {dashboard?.processing_jobs || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Jobs ativos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Taxa de Sucesso
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    {successRate}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboard?.completed_jobs || 0} completados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Jobs Falhados
                  </CardTitle>
                  <XCircle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">
                    {dashboard?.failed_jobs || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Requerem atenção
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Jobs
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalJobs}</div>
                  <p className="text-xs text-muted-foreground">
                    Últimos 7 dias
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tempo Médio
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatDuration(avgDuration)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Por job completado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Créditos Usados
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalCreditsUsed}</div>
                  <p className="text-xs text-muted-foreground">
                    Últimos 7 dias
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Jobs Table */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Fila de Jobs</CardTitle>
                      <CardDescription>
                        Histórico e status de processamento
                      </CardDescription>
                    </div>
                    {activeTab !== 'all' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearJobs.mutate(activeTab as any)}
                        disabled={clearJobs.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Limpar {activeTab}
                      </Button>
                    )}
                  </div>
                  
                  <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-4">
                    <TabsList className="grid grid-cols-5 w-full">
                      <TabsTrigger value="all">Todos</TabsTrigger>
                      <TabsTrigger value="pending">
                        Pendentes
                        {pendingJobs && pendingJobs.length > 0 && (
                          <Badge className="ml-1" variant="secondary">{pendingJobs.length}</Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="processing">
                        Processando
                        {processingJobs && processingJobs.length > 0 && (
                          <Badge className="ml-1" variant="default">{processingJobs.length}</Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="completed">Completos</TabsTrigger>
                      <TabsTrigger value="failed">Falhados</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    {loadingAllJobs ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : jobs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                        <Activity className="h-8 w-8 mb-2" />
                        <p>Nenhum job encontrado</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Job</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Criado</TableHead>
                            <TableHead>Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {jobs.map((job) => (
                            <TableRow 
                              key={job.id}
                              className={selectedJobId === job.id ? 'bg-muted' : 'cursor-pointer hover:bg-muted/50'}
                              onClick={() => setSelectedJobId(job.id)}
                            >
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium">
                                    {job.leads?.full_name || job.companies?.name || 'Job sem nome'}
                                  </div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {job.job_type}
                                    </Badge>
                                    {job.attempts > 0 && (
                                      <span className="text-xs">
                                        Tentativa {job.attempts}/{job.max_attempts}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={getStatusColor(job.status)}>
                                  {job.status}
                                </Badge>
                                {job.status === 'processing' && (
                                  <Progress 
                                    value={calculateProgress(job)} 
                                    className="mt-2 h-1"
                                  />
                                )}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(job.created_at), {
                                  addSuffix: true,
                                  locale: ptBR
                                })}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  {job.status === 'failed' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        retryJob.mutate(job.id);
                                      }}
                                      disabled={retryJob.isPending}
                                    >
                                      <RefreshCw className="h-3 w-3" />
                                    </Button>
                                  )}
                                  {(job.status === 'pending' || job.status === 'processing') && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        cancelJob.mutate(job.id);
                                      }}
                                      disabled={cancelJob.isPending}
                                    >
                                      <Ban className="h-3 w-3" />
                                    </Button>
                                  )}
                                  {(job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteJob.mutate(job.id);
                                      }}
                                      disabled={deleteJob.isPending}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Logs Viewer */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Logs Detalhados</CardTitle>
                  <CardDescription>
                    {selectedJobId 
                      ? 'Logs do job selecionado' 
                      : 'Selecione um job para ver os logs'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[600px]">
                    {!selectedJobId ? (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Selecione um job na tabela ao lado para visualizar os logs detalhados.
                        </AlertDescription>
                      </Alert>
                    ) : loadingLogs ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : !logs || logs.length === 0 ? (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Nenhum log disponível para este job ainda.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-2">
                        {logs.map((log) => (
                          <div
                            key={log.id}
                            className="p-3 rounded-lg border bg-card text-card-foreground"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <Badge variant={getLogLevelColor(log.level)}>
                                {log.level.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(log.created_at), {
                                  addSuffix: true,
                                  locale: ptBR
                                })}
                              </span>
                            </div>
                            <p className="text-sm">{log.message}</p>
                            {log.details && (
                              <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ScraperLogs;
