import { useState, useCallback, useMemo } from "react";
import { LeadCard } from "./LeadCard";
import { Button } from "@/components/ui/button";
import { MoreVertical, Plus, Pencil } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMoveLead, Lead } from "@/hooks/useLeads";
import { Stage } from "@/hooks/usePipelines";

// Paleta de cores suaves para as colunas do pipeline
const stageColors = [
  {
    bg: "bg-blue-50/60",
    border: "border-blue-200/40",
    header: "bg-blue-100/50",
    accent: "text-blue-700",
    counter: "bg-blue-200/70 text-blue-800"
  },
  {
    bg: "bg-amber-50/60", 
    border: "border-amber-200/40",
    header: "bg-amber-100/50",
    accent: "text-amber-700",
    counter: "bg-amber-200/70 text-amber-800"
  },
  {
    bg: "bg-violet-50/60",
    border: "border-violet-200/40", 
    header: "bg-violet-100/50",
    accent: "text-violet-700",
    counter: "bg-violet-200/70 text-violet-800"
  },
  {
    bg: "bg-emerald-50/60",
    border: "border-emerald-200/40",
    header: "bg-emerald-100/50", 
    accent: "text-emerald-700",
    counter: "bg-emerald-200/70 text-emerald-800"
  },
  {
    bg: "bg-rose-50/60",
    border: "border-rose-200/40",
    header: "bg-rose-100/50",
    accent: "text-rose-700", 
    counter: "bg-rose-200/70 text-rose-800"
  },
  {
    bg: "bg-slate-50/60",
    border: "border-slate-200/40",
    header: "bg-slate-100/50",
    accent: "text-slate-700",
    counter: "bg-slate-200/70 text-slate-800"
  }
];

interface KanbanBoardProps {
  stages: (Stage & { leads: Lead[] })[];
  onLeadClick: (lead: Lead) => void;
  onEditStage: (stageId: string) => void;
  onDeleteStage: (stageId: string) => void;
  onAddStage: () => void;
}

export function KanbanBoard({
  stages,
  onLeadClick,
  onEditStage,
  onDeleteStage,
  onAddStage,
}: KanbanBoardProps) {
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [draggedFromStage, setDraggedFromStage] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [optimisticStages, setOptimisticStages] = useState(stages);
  const moveLeadMutation = useMoveLead();

  // Update optimistic stages when props change
  useMemo(() => {
    setOptimisticStages(stages);
  }, [stages]);

  const handleDragStart = useCallback((lead: Lead, stageId: string) => {
    setDraggedLead(lead);
    setDraggedFromStage(stageId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(stageId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverStage(null);
  }, []);

  const handleDrop = useCallback(async (targetStageId: string) => {
    if (!draggedLead || !draggedFromStage || draggedFromStage === targetStageId) {
      setDraggedLead(null);
      setDraggedFromStage(null);
      return;
    }

    // Optimistic update - move card immediately in UI
    setOptimisticStages(prev => {
      const newStages = prev.map(stage => ({
        ...stage,
        leads: stage.leads.filter(lead => lead.id !== draggedLead.id)
      }));
      
      const targetStageIndex = newStages.findIndex(s => s.id === targetStageId);
      if (targetStageIndex !== -1) {
        newStages[targetStageIndex].leads.push(draggedLead);
      }
      
      return newStages;
    });

    // Clear drag state immediately
    setDraggedLead(null);
    setDraggedFromStage(null);

    // Perform actual mutation in background
    try {
      const targetStage = stages.find((s) => s.id === targetStageId);
      const newPosition = targetStage ? targetStage.leads.length : 0;

      await moveLeadMutation.mutateAsync({
        leadId: draggedLead.id,
        newStageId: targetStageId,
        oldStageId: draggedFromStage,
        newPosition,
      });
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticStages(stages);
    } finally {
      setDragOverStage(null);
    }
  }, [draggedLead, draggedFromStage, stages, moveLeadMutation]);

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 h-full">
        {optimisticStages.map((stage, index) => {
          const colorScheme = stageColors[index % stageColors.length];
          
          // Calculate total value for this stage
          const stageValue = stage.leads.reduce((sum, lead) => sum + (lead.deal_value || 0), 0);
          const formattedValue = stageValue >= 1000 
            ? `R$ ${(stageValue / 1000).toFixed(0)}k`
            : `R$ ${stageValue.toFixed(0)}`;
          
          return (
            <div
              key={stage.id}
              className={`flex-shrink-0 w-80 rounded-lg border transition-all duration-300 ${colorScheme.bg} ${colorScheme.border} ${
                dragOverStage === stage.id ? 'ring-2 ring-primary ring-offset-2 scale-105 shadow-lg' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(stage.id)}
            >
              <div className={`rounded-t-lg p-4 ${colorScheme.header}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <h2 className={`font-semibold ${colorScheme.accent}`}>{stage.name}</h2>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${colorScheme.counter}`}>
                        {stage.leads.length}
                      </span>
                    </div>
                    {stageValue > 0 && (
                      <div className={`text-xs font-semibold ${colorScheme.accent} opacity-80`}>
                        💰 {formattedValue}
                      </div>
                    )}
                  </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
                  <DropdownMenuItem onClick={() => onEditStage(stage.id)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar nome
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDeleteStage(stage.id)}
                    className="text-destructive"
                  >
                    Excluir etapa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            </div>

            <div className="p-4 pt-0">
              <div className="space-y-2 min-h-[200px]">
                {stage.leads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => handleDragStart(lead, stage.id)}
                    className={`cursor-move transition-all duration-200 hover:scale-102 ${
                      draggedLead?.id === lead.id ? 'opacity-50 scale-95' : 'opacity-100'
                    }`}
                  >
                    <LeadCard lead={lead} onClick={onLeadClick} />
                  </div>
                ))}
              </div>
            </div>
          </div>
          );
        })}

        <div className="flex-shrink-0 w-80">
          <Button
            variant="outline"
            className="w-full h-12 border-dashed border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground hover:bg-muted/20 transition-all duration-200"
            onClick={onAddStage}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Etapa
          </Button>
        </div>
      </div>
    </>
  );
}
