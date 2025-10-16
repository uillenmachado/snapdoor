import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DealKanbanBoard } from "@/components/DealKanbanBoard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Filter, Plus, Loader2, TrendingUp, Home } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePipeline, useStages, useCreateStage, useUpdateStage, useDeleteStage } from "@/hooks/usePipelines";
import { 
  useDeals, 
  useMarkDealAsWon, 
  useMarkDealAsLost,
  useDuplicateDeal,
  useToggleFavoriteDeal,
  useDeleteDeal,
  Deal 
} from "@/hooks/useDeals";
import { NotificationBell } from "@/components/NotificationBell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Pipelines = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  // Fetch pipeline and stages
  const { data: pipeline, isLoading: pipelineLoading } = usePipeline(user?.id);
  const { data: stages, isLoading: stagesLoading } = useStages(pipeline?.id);
  const { data: deals, isLoading: dealsLoading } = useDeals(user?.id);
  
  // Mutations
  const createStageMutation = useCreateStage();
  const updateStageMutation = useUpdateStage();
  const deleteStageMutation = useDeleteStage();
  const markDealAsWonMutation = useMarkDealAsWon();
  const markDealAsLostMutation = useMarkDealAsLost();
  const duplicateDealMutation = useDuplicateDeal();
  const toggleFavoriteMutation = useToggleFavoriteDeal();
  const deleteDealMutation = useDeleteDeal();
  
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isDealDetailsOpen, setIsDealDetailsOpen] = useState(false);
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [newStageName, setNewStageName] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Group deals by stage
  const stagesWithDeals = useMemo(() => {
    if (!stages || !deals) return [];
    
    return stages.map((stage) => ({
      ...stage,
      deals: deals.filter((deal) => deal.stage_id === stage.id && deal.status === 'open'),
    }));
  }, [stages, deals]);

  // Filter stages based on search
  const filteredStages = useMemo(() => {
    if (!searchQuery) return stagesWithDeals;
    
    return stagesWithDeals.map((stage) => ({
      ...stage,
      deals: stage.deals.filter((deal) =>
        deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }));
  }, [stagesWithDeals, searchQuery]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalDeals = deals?.length || 0;
    const totalValue = deals?.reduce((sum, deal) => sum + (deal.value || 0), 0) || 0;
    const wonDeals = deals?.filter(d => d.status === 'won').length || 0;
    const conversionRate = totalDeals > 0 ? ((wonDeals / totalDeals) * 100).toFixed(1) : '0';

    return { totalDeals, totalValue, wonDeals, conversionRate };
  }, [deals]);

  const handleDealClick = (deal: Deal) => {
    navigate(`/deals/${deal.id}`);
  };

  const handleEditStage = (stageId: string) => {
    const stage = stagesWithDeals.find((s) => s.id === stageId);
    if (stage) {
      setEditingStageId(stageId);
      setNewStageName(stage.name);
    }
  };

  const handleSaveStage = async () => {
    if (!editingStageId || !newStageName.trim()) return;

    await updateStageMutation.mutateAsync({
      id: editingStageId,
      updates: { name: newStageName },
    });

    setEditingStageId(null);
    setNewStageName("");
  };

  const handleDeleteStage = async (stageId: string) => {
    if (!pipeline?.id) return;

    await deleteStageMutation.mutateAsync({ 
      id: stageId, 
      pipelineId: pipeline.id 
    });
  };

  const handleAddStage = async () => {
    if (!pipeline?.id || !stages) return;

    const maxPosition = Math.max(...stages.map((s: any) => s.position || s.order_index || 0), 0);
    
    await createStageMutation.mutateAsync({
      pipeline_id: pipeline.id,
      name: "Nova Etapa",
      position: maxPosition + 1,
      color: "#6B46F2",
    });
  };

  // Deal actions handlers
  const handleMarkAsWon = async (dealId: string) => {
    await markDealAsWonMutation.mutateAsync({ dealId });
  };

  const handleMarkAsLost = async (dealId: string) => {
    await markDealAsLostMutation.mutateAsync({ dealId });
  };

  const handleDuplicateDeal = async (deal: Deal) => {
    await duplicateDealMutation.mutateAsync({ dealId: deal.id });
  };

  const handleToggleFavorite = async (dealId: string, isFavorite: boolean) => {
    await toggleFavoriteMutation.mutateAsync({ dealId, isFavorite });
  };

  const handleDeleteDeal = async (dealId: string) => {
    await deleteDealMutation.mutateAsync(dealId);
  };

  // Loading state
  if (authLoading || pipelineLoading || stagesLoading || dealsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pipeline || !stages) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Erro ao carregar pipeline</p>
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
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate('/dashboard')}
                  className="h-9 w-9"
                >
                  <Home className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {pipeline?.name || "Pipeline de Vendas"}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Gerencie seus negócios através do funil de vendas
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <NotificationBell />
                
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar negócio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>

                <Button onClick={() => navigate('/deals/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Negócio
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content - Métricas Rápidas + Kanban */}
          <main className="flex-1 overflow-auto p-6">
            {/* Métricas Rápidas do Pipeline */}
            <div className="grid gap-4 md:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Negócios</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalDeals}</div>
                  <p className="text-xs text-muted-foreground">
                    {stages?.length || 0} etapas ativas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                  <span className="text-2xl">💰</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 0,
                    }).format(metrics.totalValue)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Em negociação
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                  <span className="text-2xl">📊</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.conversionRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.wonDeals} negócios ganhos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                  <span className="text-2xl">🎯</span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics.totalDeals > 0 
                      ? new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                          minimumFractionDigits: 0,
                        }).format(metrics.totalValue / metrics.totalDeals)
                      : 'R$ 0'
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Por negócio
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Kanban Board - Foco Principal */}
            <DealKanbanBoard
              stages={filteredStages as any}
              onDealClick={handleDealClick}
              onEditStage={handleEditStage}
              onDeleteStage={handleDeleteStage}
              onAddStage={handleAddStage}
              onMarkAsWon={handleMarkAsWon}
              onMarkAsLost={handleMarkAsLost}
              onDuplicateDeal={handleDuplicateDeal}
              onToggleFavorite={handleToggleFavorite}
              onDeleteDeal={handleDeleteDeal}
            />
          </main>
        </div>

        {/* Edit Stage Dialog */}
        <Dialog open={!!editingStageId} onOpenChange={() => setEditingStageId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Etapa</DialogTitle>
              <DialogDescription>
                Altere o nome da etapa do pipeline
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stageName">Nome da Etapa</Label>
                <Input
                  id="stageName"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setEditingStageId(null)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveStage} className="flex-1">
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
};

export default Pipelines;
