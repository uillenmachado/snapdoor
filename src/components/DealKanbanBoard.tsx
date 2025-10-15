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

// Paleta de cores profissionais Pipedrive-style para as colunas do pipeline
const stageColors = [
  {
    bg: "bg-gradient-to-b from-card to-card/80 dark:from-card dark:to-card/80",
    border: "border-pipeline-1/30 dark:border-pipeline-1/20",
    header: "bg-pipeline-1/5 dark:bg-pipeline-1/10",
    accent: "text-pipeline-1 dark:text-pipeline-1",
    counter: "bg-pipeline-1/15 text-pipeline-1 dark:bg-pipeline-1/20 font-semibold",
    shadow: "shadow-sm hover:shadow-md"
  },
  {
    bg: "bg-gradient-to-b from-card to-card/80 dark:from-card dark:to-card/80", 
    border: "border-pipeline-2/30 dark:border-pipeline-2/20",
    header: "bg-pipeline-2/5 dark:bg-pipeline-2/10",
    accent: "text-pipeline-2 dark:text-pipeline-2",
    counter: "bg-pipeline-2/15 text-pipeline-2 dark:bg-pipeline-2/20 font-semibold",
    shadow: "shadow-sm hover:shadow-md"
  },
  {
    bg: "bg-gradient-to-b from-card to-card/80 dark:from-card dark:to-card/80",
    border: "border-pipeline-3/30 dark:border-pipeline-3/20", 
    header: "bg-pipeline-3/5 dark:bg-pipeline-3/10",
    accent: "text-pipeline-3 dark:text-pipeline-3",
    counter: "bg-pipeline-3/15 text-pipeline-3 dark:bg-pipeline-3/20 font-semibold",
    shadow: "shadow-sm hover:shadow-md"
  },
  {
    bg: "bg-gradient-to-b from-card to-card/80 dark:from-card dark:to-card/80",
    border: "border-pipeline-4/30 dark:border-pipeline-4/20",
    header: "bg-pipeline-4/5 dark:bg-pipeline-4/10", 
    accent: "text-pipeline-4 dark:text-pipeline-4",
    counter: "bg-pipeline-4/15 text-pipeline-4 dark:bg-pipeline-4/20 font-semibold",
    shadow: "shadow-sm hover:shadow-md"
  },
  {
    bg: "bg-gradient-to-b from-card to-card/80 dark:from-card dark:to-card/80",
    border: "border-pipeline-5/30 dark:border-pipeline-5/20",
    header: "bg-pipeline-5/5 dark:bg-pipeline-5/10",
    accent: "text-pipeline-5 dark:text-pipeline-5", 
    counter: "bg-pipeline-5/15 text-pipeline-5 dark:bg-pipeline-5/20 font-semibold",
    shadow: "shadow-sm hover:shadow-md"
  },
  {
    bg: "bg-gradient-to-b from-card to-card/80 dark:from-card dark:to-card/80",
    border: "border-pipeline-6/30 dark:border-pipeline-6/20",
    header: "bg-pipeline-6/5 dark:bg-pipeline-6/10",
    accent: "text-pipeline-6 dark:text-pipeline-6",
    counter: "bg-pipeline-6/15 text-pipeline-6 dark:bg-pipeline-6/20 font-semibold",
    shadow: "shadow-sm hover:shadow-md"
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
    <div className="flex gap-5 h-full overflow-x-auto pb-6 px-1">
      {optimisticStages.map((stage, index) => {
        const colorScheme = stageColors[index % stageColors.length];
        const stageValue = stage.deals.reduce((sum, deal) => sum + (deal.value || 0), 0);
        
        return (
          <div
            key={stage.id}
            className={`flex-shrink-0 w-80 rounded-lg border ${colorScheme.border} ${colorScheme.bg} ${colorScheme.shadow} transition-all duration-300 ${
              dragOverStage === stage.id ? "ring-2 ring-brand-green-500 shadow-lg scale-[1.02]" : ""
            }`}
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={handleDragLeave}
            onDrop={() => handleDrop(stage.id)}
          >
            {/* Stage Header - Pipedrive Style */}
            <div className={`px-4 py-3 ${colorScheme.header} rounded-t-lg border-b border-neutral-200 dark:border-neutral-800`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <h3 className={`font-semibold text-sm ${colorScheme.accent}`}>
                    {stage.name}
                  </h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full ${colorScheme.counter}`}>
                    {stage.deals.length}
                  </span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 w-7 p-0 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <MoreVertical className="h-4 w-4 text-neutral-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onEditStage(stage.id)}>
                      Editar coluna
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteStage(stage.id)}
                      className="text-danger-500 focus:text-danger-600"
                    >
                      Excluir coluna
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Stage Value - Professional Format */}
              {stageValue > 0 && (
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                    Valor total:
                  </span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(stageValue)}
                  </span>
                </div>
              )}
            </div>

            {/* Stage Content - Improved Spacing */}
            <div className="p-3 space-y-2.5 overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
              {stage.deals.map((deal) => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={() => handleDragStart(deal, stage.id)}
                  className={`cursor-move transition-opacity duration-200 ${
                    draggedDeal?.id === deal.id ? 'opacity-40' : 'opacity-100'
                  }`}
                >
                  <DealCard
                    deal={deal}
                    onClick={() => onDealClick(deal)}
                  />
                </div>
              ))}

              {stage.deals.length === 0 && (
                <div className="text-center text-neutral-400 dark:text-neutral-600 text-sm py-12 px-4">
                  <div className="text-3xl mb-2 opacity-40">📭</div>
                  <p className="font-medium">Nenhum negócio</p>
                  <p className="text-xs mt-1">Arraste cards para cá</p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Add Stage Button - Professional Style */}
      <div className="flex-shrink-0 w-80">
        <Button
          variant="outline"
          className="w-full h-32 border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-brand-green-400 hover:bg-brand-green-50/50 dark:hover:bg-brand-green-900/10 transition-all duration-200 text-neutral-600 dark:text-neutral-400 hover:text-brand-green-600 dark:hover:text-brand-green-400"
          onClick={onAddStage}
        >
          <Plus className="h-5 w-5 mr-2" />
          <span className="font-medium">Adicionar Coluna</span>
        </Button>
      </div>
    </div>
  );
}
