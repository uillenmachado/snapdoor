import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DealKanbanBoard } from "@/components/DealKanbanBoard";
import { LeadDetails } from "@/components/LeadDetails";
import { AddLeadDialog } from "@/components/AddLeadDialog";
import { SnapDoorAIDialog } from "@/components/SnapDoorAIDialog";
import { GlobalSearch } from "@/components/GlobalSearch";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { UsageLimits } from "@/components/UsageLimits";
import { NotificationBell } from "@/components/NotificationBell";
import { TasksWidget } from "@/components/TasksWidget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, Filter, Plus, Loader2, Brain, Zap } from "lucide-react";
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
import { useDeals, Deal } from "@/hooks/useDeals";
import { useSubscription } from "@/hooks/useSubscription";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  // Fetch pipeline and stages
  const { data: pipeline, isLoading: pipelineLoading } = usePipeline(user?.id);
  const { data: stages, isLoading: stagesLoading } = useStages(pipeline?.id);
  const { data: deals, isLoading: dealsLoading } = useDeals(user?.id);
  const { data: subscription } = useSubscription(user?.id);
  
  // Mutations
  const createStageMutation = useCreateStage();
  const updateStageMutation = useUpdateStage();
  const deleteStageMutation = useDeleteStage();
  
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isDealDetailsOpen, setIsDealDetailsOpen] = useState(false);
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const [isSnapDoorAIOpen, setIsSnapDoorAIOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingStageId, setEditingStageId] = useState<string | null>(null);
  const [newStageName, setNewStageName] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const handleOpenAddDeal = () => {
      setIsAddDealOpen(true);
    };

    window.addEventListener("openAddDeal", handleOpenAddDeal);
    return () => window.removeEventListener("openAddDeal", handleOpenAddDeal);
  }, []);

  // Keyboard shortcut for SnapDoor AI (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSnapDoorAIOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Group deals by stage
  const stagesWithDeals = useMemo(() => {
    if (!stages || !deals) return [];
    
    return stages.map((stage) => ({
      ...stage,
      deals: deals.filter((deal) => deal.stage_id === stage.id),
    }));
  }, [stages, deals]);

  // Filter stages based on search
  const filteredStages = useMemo(() => {
    if (!searchQuery) return stagesWithDeals;
    
    return stagesWithDeals.map((stage) => ({
      ...stage,
      deals: stage.deals.filter(
        (deal) =>
          deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (deal.company_name && deal.company_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (deal.description && deal.description.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    }));
  }, [stagesWithDeals, searchQuery]);

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
    setIsDealDetailsOpen(true);
  };

  const handleEditStage = (stageId: string) => {
    const stage = stagesWithDeals.find((s) => s.id === stageId);
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

    const maxPosition = Math.max(...stages.map((s: any) => s.position || s.order_index || 0), 0);
    
    await createStageMutation.mutateAsync({
      pipeline_id: pipeline.id,
      name: "Nova Etapa",
      position: maxPosition + 1,
      color: "#6B46F2",
    });
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
          {/* Header com UsageLimits */}
          <header className="border-b border-border bg-card sticky top-0 z-10">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <SidebarTrigger />
                  <h1 className="text-2xl font-bold text-foreground">
                    {pipeline?.name || "Pipeline Principal"}
                  </h1>
                </div>
                <UsageLimits 
                  subscription={subscription} 
                  leadsCount={deals?.length || 0}
                  pipelinesCount={1}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <NotificationBell />
                {/* TODO: Create GlobalDealSearch component */}
                {/* <GlobalSearch 
                  leads={deals || [] as any} 
                  onSelectLead={handleDealClick}
                /> */}
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={() => setIsSnapDoorAIOpen(true)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        <Zap className="h-3 w-3 mr-1" />
                        SnapDoor AI
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Prospecção inteligente com IA <kbd className="ml-2 px-1.5 py-0.5 text-xs rounded bg-muted">Ctrl+K</kbd></p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button onClick={() => setIsAddDealOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Negócio
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            {/* Dashboard Metrics */}
            <DashboardMetrics leads={deals || [] as any} stages={(stages || []) as any} />
            
            {/* Tasks Widget */}
            <div className="mt-6">
              <TasksWidget />
            </div>
            
            {/* Kanban Board */}
            <div className="mt-6">
              <DealKanbanBoard
                stages={filteredStages as any}
                onDealClick={handleDealClick}
                onEditStage={handleEditStage}
                onDeleteStage={handleDeleteStage}
                onAddStage={handleAddStage}
              />
            </div>
          </main>
        </div>

        {/* Deal Details - TODO: Create DealDetails component */}
        {selectedDeal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4">
              <h2 className="text-2xl font-bold mb-4">{selectedDeal.title}</h2>
              <p>Valor: R$ {selectedDeal.value.toLocaleString('pt-BR')}</p>
              <p>Probabilidade: {selectedDeal.probability}%</p>
              <p>Status: {selectedDeal.status}</p>
              <button 
                onClick={() => setIsDealDetailsOpen(false)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Legacy Lead Details - mantido para compatibilidade */}
        {/* <LeadDetails
          lead={selectedLead}
          isOpen={isLeadDetailsOpen}
          onClose={() => setIsLeadDetailsOpen(false)}
          userId={user?.id}
        />

        {/* Add Deal Dialog - TODO: Create AddDealDialog component */}
        {isAddDealOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
              <h2 className="text-2xl font-bold mb-4">Adicionar Negócio</h2>
              <p className="text-muted-foreground mb-4">
                Funcionalidade em desenvolvimento. Use a página Negócios para criar novos deals.
              </p>
              <button 
                onClick={() => setIsAddDealOpen(false)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Fechar
              </button>
            </div>
          </div>
        )}

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

        {/* SnapDoor AI Dialog */}
        <SnapDoorAIDialog 
          open={isSnapDoorAIOpen}
          onOpenChange={setIsSnapDoorAIOpen}
          pipelineId={pipeline?.id}
        />
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
