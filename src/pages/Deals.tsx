import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DealCard } from "@/components/DealCard";
import { GlobalSearch } from "@/components/GlobalSearch";
import { NotificationBell } from "@/components/NotificationBell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Plus, Loader2, Filter, TrendingUp, DollarSign } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { usePipeline, useStages, useCreateStage, useUpdateStage, useDeleteStage } from "@/hooks/usePipelines";
import { 
  useDeals, 
  useCreateDeal, 
  useUpdateDeal, 
  useDeleteDeal,
  useMoveDeal,
  useMarkDealAsWon,
  useMarkDealAsLost,
  Deal 
} from "@/hooks/useDeals";

const Deals = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  // Fetch pipeline, stages and deals
  const { data: pipeline, isLoading: pipelineLoading } = usePipeline(user?.id);
  const { data: stages, isLoading: stagesLoading } = useStages(pipeline?.id);
  const { data: deals, isLoading: dealsLoading } = useDeals(user?.id);
  
  // Mutations
  const createStageMutation = useCreateStage();
  const updateStageMutation = useUpdateStage();
  const deleteStageMutation = useDeleteStage();
  const createDealMutation = useCreateDeal();
  const updateDealMutation = useUpdateDeal();
  const deleteDealMutation = useDeleteDeal();
  const moveDealMutation = useMoveDeal();
  const markDealAsWonMutation = useMarkDealAsWon();
  const markDealAsLostMutation = useMarkDealAsLost();
  
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [newStageName, setNewStageName] = useState("");
  
  // Form state for new deal
  const [newDealForm, setNewDealForm] = useState({
    title: "",
    value: "",
    company_name: "",
    probability: "50",
    expected_close_date: "",
    description: "",
  });

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

  // Calculate stage metrics
  const stageMetrics = useMemo(() => {
    return stagesWithDeals.map((stage) => {
      const totalValue = stage.deals.reduce((sum, deal) => sum + deal.value, 0);
      const avgProbability = stage.deals.length > 0
        ? stage.deals.reduce((sum, deal) => sum + deal.probability, 0) / stage.deals.length
        : 0;
      
      return {
        stageId: stage.id,
        totalValue,
        avgProbability,
        count: stage.deals.length,
      };
    });
  }, [stagesWithDeals]);

  // Filter stages based on search
  const filteredStages = useMemo(() => {
    if (!searchQuery) return stagesWithDeals;
    
    return stagesWithDeals.map((stage) => ({
      ...stage,
      deals: stage.deals.filter(
        (deal) =>
          deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (deal.company_name && deal.company_name.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    }));
  }, [stagesWithDeals, searchQuery]);

  // Overall pipeline metrics
  const pipelineMetrics = useMemo(() => {
    const openDeals = deals?.filter((d) => d.status === 'open') || [];
    const wonDeals = deals?.filter((d) => d.status === 'won') || [];
    const lostDeals = deals?.filter((d) => d.status === 'lost') || [];
    
    const totalValue = openDeals.reduce((sum, deal) => sum + deal.value, 0);
    const weightedValue = openDeals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0);
    const wonValue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
    
    return {
      openCount: openDeals.length,
      wonCount: wonDeals.length,
      lostCount: lostDeals.length,
      totalValue,
      weightedValue,
      wonValue,
    };
  }, [deals]);

  const handleDealClick = (deal: Deal) => {
    // Navigate to deal detail page (será implementado)
    navigate(`/deals/${deal.id}`);
  };

  const handleCreateDeal = async () => {
    if (!user?.id || !pipeline?.id || !stages || stages.length === 0) {
      toast.error("Pipeline não configurado");
      return;
    }

    if (!newDealForm.title.trim()) {
      toast.error("Título do negócio é obrigatório");
      return;
    }

    const firstStage = stages[0];
    
    await createDealMutation.mutateAsync({
      user_id: user.id,
      pipeline_id: pipeline.id,
      stage_id: firstStage.id,
      title: newDealForm.title,
      value: parseFloat(newDealForm.value) || 0,
      company_name: newDealForm.company_name || null,
      probability: parseInt(newDealForm.probability) || 50,
      expected_close_date: newDealForm.expected_close_date || null,
      description: newDealForm.description || null,
    });

    // Reset form
    setNewDealForm({
      title: "",
      value: "",
      company_name: "",
      probability: "50",
      expected_close_date: "",
      description: "",
    });
    setIsAddDealOpen(false);
  };

  const handleEditStage = (stageId: string) => {
    const stage = stages?.find((s) => s.id === stageId);
    if (stage) {
      setEditingStageId(stageId);
      setNewStageName(stage.name);
    }
  };

  const handleSaveStage = async () => {
    if (!newStageName.trim()) {
      toast.error("Nome da etapa não pode estar vazio");
      return;
    }

    if (!editingStageId) return;

    await updateStageMutation.mutateAsync({
      id: editingStageId,
      updates: { name: newStageName },
    });
    
    setEditingStageId(null);
    setNewStageName("");
  };

  const handleDeleteStage = async (stageId: string) => {
    const stage = stagesWithDeals.find((s) => s.id === stageId);
    if (stage && stage.deals.length > 0) {
      toast.error("Não é possível excluir uma etapa com negócios");
      return;
    }

    if (!pipeline?.id) return;

    await deleteStageMutation.mutateAsync({ 
      id: stageId, 
      pipelineId: pipeline.id 
    });
  };

  const handleAddStage = async () => {
    if (!pipeline?.id || !stages) return;

    const maxPosition = Math.max(...stages.map((s: any) => s.position || s.order || 0), 0);
    
    await createStageMutation.mutateAsync({
      pipeline_id: pipeline.id,
      name: "Nova Etapa",
      position: maxPosition + 1,
    });
  };

  const handleMarkAsWon = async (dealId: string) => {
    await markDealAsWonMutation.mutateAsync({ dealId });
  };

  const handleMarkAsLost = async (dealId: string) => {
    await markDealAsLostMutation.mutateAsync({ dealId });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (authLoading || pipelineLoading || stagesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <div className="flex-1 flex items-center gap-4">
              <h1 className="text-xl font-semibold">💼 Todos os Negócios</h1>
              
              {/* Pipeline Metrics */}
              <div className="hidden md:flex items-center gap-4 ml-4">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Em aberto:</span>
                  <span className="font-semibold">{pipelineMetrics.openCount}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-muted-foreground">Valor total:</span>
                  <span className="font-semibold">{formatCurrency(pipelineMetrics.totalValue)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Ponderado:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(pipelineMetrics.weightedValue)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <NotificationBell />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => setIsAddDealOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Negócio
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Criar novo negócio</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            {/* Search Bar */}
            <div className="mb-4 flex items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar negócios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>

            {/* Kanban Board */}
            <div className="flex gap-4 overflow-x-auto pb-4">
              {filteredStages.map((stage) => {
                const metrics = stageMetrics.find((m) => m.stageId === stage.id);
                
                return (
                  <div
                    key={stage.id}
                    className="flex-shrink-0 w-80 bg-secondary/30 rounded-lg p-4"
                  >
                    {/* Stage Header */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        {editingStageId === stage.id ? (
                          <Input
                            value={newStageName}
                            onChange={(e) => setNewStageName(e.target.value)}
                            onBlur={handleSaveStage}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveStage();
                              if (e.key === "Escape") {
                                setEditingStageId(null);
                                setNewStageName("");
                              }
                            }}
                            autoFocus
                            className="h-8"
                          />
                        ) : (
                          <h3
                            className="font-semibold cursor-pointer hover:text-primary"
                            onClick={() => handleEditStage(stage.id)}
                          >
                            {stage.name}
                          </h3>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {stage.deals.length}
                        </span>
                      </div>
                      
                      {/* Stage Metrics */}
                      {metrics && metrics.count > 0 && (
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Valor:</span>
                            <span className="font-medium">{formatCurrency(metrics.totalValue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Prob. média:</span>
                            <span className="font-medium">{Math.round(metrics.avgProbability)}%</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Deals List */}
                    <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
                      {stage.deals.length === 0 ? (
                        <div className="text-center py-8 text-sm text-muted-foreground">
                          Nenhum negócio nesta etapa
                        </div>
                      ) : (
                        stage.deals.map((deal) => (
                          <DealCard
                            key={deal.id}
                            deal={deal}
                            onClick={handleDealClick}
                            onEdit={(deal) => {
                              // TODO: Implementar edição
                              toast.info("Edição será implementada");
                            }}
                            onDelete={(dealId) => deleteDealMutation.mutate(dealId)}
                            onMarkAsWon={handleMarkAsWon}
                            onMarkAsLost={handleMarkAsLost}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add Stage Button */}
              <div className="flex-shrink-0 w-80">
                <Button
                  variant="outline"
                  className="w-full h-full min-h-[200px] border-dashed"
                  onClick={handleAddStage}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Etapa
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Add Deal Dialog */}
      <Dialog open={isAddDealOpen} onOpenChange={setIsAddDealOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Negócio</DialogTitle>
            <DialogDescription>
              Adicione um novo negócio ao pipeline
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Título do Negócio *</Label>
              <Input
                id="title"
                placeholder="Ex: Venda para Empresa X"
                value={newDealForm.title}
                onChange={(e) => setNewDealForm({ ...newDealForm, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="value">Valor (R$)</Label>
                <Input
                  id="value"
                  type="number"
                  placeholder="0.00"
                  value={newDealForm.value}
                  onChange={(e) => setNewDealForm({ ...newDealForm, value: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="probability">Probabilidade (%)</Label>
                <Select
                  value={newDealForm.probability}
                  onValueChange={(value) => setNewDealForm({ ...newDealForm, probability: value })}
                >
                  <SelectTrigger id="probability">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="25">25%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                    <SelectItem value="75">75%</SelectItem>
                    <SelectItem value="90">90%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                placeholder="Nome da empresa"
                value={newDealForm.company_name}
                onChange={(e) => setNewDealForm({ ...newDealForm, company_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="expected_close_date">Data Prevista de Fechamento</Label>
              <Input
                id="expected_close_date"
                type="date"
                value={newDealForm.expected_close_date}
                onChange={(e) => setNewDealForm({ ...newDealForm, expected_close_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Detalhes do negócio..."
                value={newDealForm.description}
                onChange={(e) => setNewDealForm({ ...newDealForm, description: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsAddDealOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateDeal} disabled={createDealMutation.isPending}>
              {createDealMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Criar Negócio
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Deals;
