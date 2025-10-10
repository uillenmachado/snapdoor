import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { KanbanBoard } from "@/components/KanbanBoard";
import { LeadDetails } from "@/components/LeadDetails";
import { AddLeadDialog } from "@/components/AddLeadDialog";
import { SnapDoorAIDialog } from "@/components/SnapDoorAIDialog";
import { GlobalSearch } from "@/components/GlobalSearch";
import { DashboardMetrics } from "@/components/DashboardMetrics";
import { UsageLimits } from "@/components/UsageLimits";
import { NotificationBell } from "@/components/NotificationBell";
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
import { useLeads, Lead } from "@/hooks/useLeads";
import { useSubscription } from "@/hooks/useSubscription";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  // Fetch pipeline and stages
  const { data: pipeline, isLoading: pipelineLoading } = usePipeline(user?.id);
  const { data: stages, isLoading: stagesLoading } = useStages(pipeline?.id);
  const { data: leads, isLoading: leadsLoading } = useLeads(user?.id);
  const { data: subscription } = useSubscription(user?.id);
  
  // Mutations
  const createStageMutation = useCreateStage();
  const updateStageMutation = useUpdateStage();
  const deleteStageMutation = useDeleteStage();
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isLeadDetailsOpen, setIsLeadDetailsOpen] = useState(false);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
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
    const handleOpenAddLead = () => {
      setIsAddLeadOpen(true);
    };

    window.addEventListener("openAddLead", handleOpenAddLead);
    return () => window.removeEventListener("openAddLead", handleOpenAddLead);
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

  // Group leads by stage
  const stagesWithLeads = useMemo(() => {
    if (!stages || !leads) return [];
    
    return stages.map((stage) => ({
      ...stage,
      leads: leads.filter((lead) => lead.stage_id === stage.id),
    }));
  }, [stages, leads]);

  // Filter stages based on search
  const filteredStages = useMemo(() => {
    if (!searchQuery) return stagesWithLeads;
    
    return stagesWithLeads.map((stage) => ({
      ...stage,
      leads: stage.leads.filter(
        (lead) =>
          lead.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (lead.company && lead.company.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    }));
  }, [stagesWithLeads, searchQuery]);

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsLeadDetailsOpen(true);
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
    const stage = stagesWithLeads.find((s) => s.id === stageId);
    if (stage && stage.leads.length > 0) {
      toast.error("Não é possível excluir uma etapa com leads");
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
  if (authLoading || pipelineLoading || stagesLoading || leadsLoading) {
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
                  leadsCount={leads?.length || 0}
                  pipelinesCount={1}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <NotificationBell />
                <GlobalSearch 
                  leads={leads || []} 
                  onSelectLead={handleLeadClick}
                />
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
                <Button onClick={() => setIsAddLeadOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Lead
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            {/* Dashboard Metrics */}
            <DashboardMetrics leads={leads || []} stages={(stages || []) as any} />
            
            {/* Kanban Board */}
            <KanbanBoard
              stages={filteredStages as any}
              onLeadClick={handleLeadClick}
              onEditStage={handleEditStage}
              onDeleteStage={handleDeleteStage}
              onAddStage={handleAddStage}
            />
          </main>
        </div>

        {/* Lead Details */}
        <LeadDetails
          lead={selectedLead}
          isOpen={isLeadDetailsOpen}
          onClose={() => setIsLeadDetailsOpen(false)}
          userId={user?.id}
        />

        {/* Add Lead Dialog */}
        <AddLeadDialog
          isOpen={isAddLeadOpen}
          onClose={() => setIsAddLeadOpen(false)}
          stages={stages as any}
          userId={user?.id}
        />

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
