import { useState, useCallback, useMemo } from "react";
import { DealCard } from "./DealCard";
import { Button } from "@/components/ui/button";
import { MoreVertical, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMoveDeal, Deal } from "@/hooks/useDeals";
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

interface DealKanbanBoardProps {
  stages: (Stage & { deals: Deal[] })[];
  onDealClick: (deal: Deal) => void;
  onEditStage: (stageId: string) => void;
  onDeleteStage: (stageId: string) => void;
  onAddStage: () => void;
}

export function DealKanbanBoard({
  stages,
  onDealClick,
  onEditStage,
  onDeleteStage,
  onAddStage,
}: DealKanbanBoardProps) {
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [draggedFromStage, setDraggedFromStage] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [optimisticStages, setOptimisticStages] = useState(stages);
  const moveDealMutation = useMoveDeal();

  // Update optimistic stages when props change
  useMemo(() => {
    setOptimisticStages(stages);
  }, [stages]);

  const handleDragStart = useCallback((deal: Deal, stageId: string) => {
    setDraggedDeal(deal);
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
    if (!draggedDeal || draggedFromStage === targetStageId) {
      setDraggedDeal(null);
      setDragOverStage(null);
      return;
    }

    // Otimistic update
    const updatedStages = optimisticStages.map((stage) => {
      if (stage.id === draggedFromStage) {
        return {
          ...stage,
          deals: stage.deals.filter((d) => d.id !== draggedDeal.id),
        };
      }
      if (stage.id === targetStageId) {
        return {
          ...stage,
          deals: [...stage.deals, draggedDeal],
        };
      }
      return stage;
    });

    setOptimisticStages(updatedStages);

    // Perform actual mutation
    const targetStage = stages.find((s) => s.id === targetStageId);
    const newPosition = targetStage?.deals.length || 0;

    try {
      await moveDealMutation.mutateAsync({
        dealId: draggedDeal.id,
        fromStageId: draggedFromStage,
        toStageId: targetStageId,
        position: newPosition,
      });
    } catch (error) {
      // Revert on error
      setOptimisticStages(stages);
    }

    setDraggedDeal(null);
    setDraggedFromStage(null);
    setDragOverStage(null);
  }, [draggedDeal, draggedFromStage, optimisticStages, stages, moveDealMutation]);

  // Format currency for stage value display
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}k`;
    }
    return `R$ ${value.toFixed(0)}`;
  };

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      {optimisticStages.map((stage, index) => {
        const colorScheme = stageColors[index % stageColors.length];
        const stageValue = stage.deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
        
        return (
          <div
            key={stage.id}
            className={`flex-shrink-0 w-80 rounded-lg border-2 ${colorScheme.border} ${colorScheme.bg} transition-all duration-200 ${
              dragOverStage === stage.id ? "ring-2 ring-blue-400 shadow-lg" : ""
            }`}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(stage.id)}
          >
            {/* Stage Header */}
            <div className={`p-4 ${colorScheme.header} rounded-t-lg border-b-2 ${colorScheme.border}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className={`font-semibold text-sm ${colorScheme.accent}`}>
                    {stage.name}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorScheme.counter}`}>
                    {stage.deals.length}
                  </span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditStage(stage.id)}>
                      Editar coluna
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteStage(stage.id)}
                      className="text-red-600"
                    >
                      Excluir coluna
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Stage Value */}
              {stageValue > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>💰</span>
                  <span className="font-semibold">{formatCurrency(stageValue)}</span>
                </div>
              )}
            </div>

            {/* Stage Content */}
            <div className="p-3 space-y-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
              {stage.deals.map((deal) => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={() => handleDragStart(deal, stage.id)}
                  className={`cursor-move ${draggedDeal?.id === deal.id ? 'opacity-50' : ''}`}
                >
                  <DealCard
                    deal={deal}
                    onClick={() => onDealClick(deal)}
                  />
                </div>
              ))}

              {stage.deals.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  Nenhum negócio nesta etapa
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Add Stage Button */}
      <div className="flex-shrink-0 w-80">
        <Button
          variant="outline"
          className="w-full h-32 border-2 border-dashed hover:border-primary hover:bg-primary/5"
          onClick={onAddStage}
        >
          <Plus className="h-5 w-5 mr-2" />
          Adicionar Coluna
        </Button>
      </div>
    </div>
  );
}
