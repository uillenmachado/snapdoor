/**
 * Kanban Board para Deals com Drag & Drop
 * Usa @dnd-kit para arrastar deals entre stages
 */

import { useState, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DealCard } from './DealCard';
import { Deal, formatCurrency, calculateTotalValue } from '@/types/deal';
import { Stage } from '@/hooks/usePipelines';
import { Plus, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DealKanbanBoardProps {
  stages: (Stage & { deals?: Deal[] })[];
  onDealClick?: (deal: Deal) => void;
  onDealEdit?: (deal: Deal) => void;
  onDealDelete?: (dealId: string) => void;
  onDealMove?: (dealId: string, newStageId: string, newPosition: number) => void;
  onStageEdit?: (stageId: string) => void;
  onStageDelete?: (stageId: string) => void;
  onAddDeal?: (stageId: string) => void;
}

// Paleta de cores para stages
const STAGE_COLORS = [
  'border-l-blue-500 bg-blue-50/30',
  'border-l-amber-500 bg-amber-50/30',
  'border-l-violet-500 bg-violet-50/30',
  'border-l-emerald-500 bg-emerald-50/30',
  'border-l-rose-500 bg-rose-50/30',
  'border-l-slate-500 bg-slate-50/30',
];

export function DealKanbanBoard({
  stages,
  onDealClick,
  onDealEdit,
  onDealDelete,
  onDealMove,
  onStageEdit,
  onStageDelete,
  onAddDeal,
}: DealKanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localStages, setLocalStages] = useState(stages);

  // Sensores para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px de movimento antes de iniciar o drag
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Atualizar local stages quando props mudam
  useMemo(() => {
    setLocalStages(stages);
  }, [stages]);

  // Deal ativo sendo arrastado
  const activeDeal = useMemo(() => {
    if (!activeId) return null;
    for (const stage of localStages) {
      const deal = stage.deals?.find(d => d.id === activeId);
      if (deal) return deal;
    }
    return null;
  }, [activeId, localStages]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Encontrar stage do deal ativo e stage de destino
    const activeStage = localStages.find(stage => 
      stage.deals?.some(deal => deal.id === activeId)
    );
    const overStage = localStages.find(stage => 
      stage.id === overId || stage.deals?.some(deal => deal.id === overId)
    );

    if (!activeStage || !overStage || activeStage.id === overStage.id) return;

    setLocalStages(prevStages => {
      const activeDeals = activeStage.deals || [];
      const overDeals = overStage.deals || [];

      const activeDealIndex = activeDeals.findIndex(d => d.id === activeId);
      const activeDeal = activeDeals[activeDealIndex];

      const overDealIndex = overDeals.findIndex(d => d.id === overId);

      return prevStages.map(stage => {
        if (stage.id === activeStage.id) {
          return {
            ...stage,
            deals: activeDeals.filter(d => d.id !== activeId),
          };
        }
        if (stage.id === overStage.id) {
          const newDeals = [...overDeals];
          const insertIndex = overDealIndex >= 0 ? overDealIndex : newDeals.length;
          newDeals.splice(insertIndex, 0, activeDeal);
          return {
            ...stage,
            deals: newDeals,
          };
        }
        return stage;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const overStage = localStages.find(stage => 
      stage.id === overId || stage.deals?.some(deal => deal.id === overId)
    );

    if (!overStage) return;

    const finalDeals = overStage.deals || [];
    const newPosition = finalDeals.findIndex(d => d.id === activeId);

    // Chamar callback de movimento
    if (onDealMove && newPosition >= 0) {
      onDealMove(activeId, overStage.id, newPosition);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setLocalStages(stages);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {localStages.map((stage, index) => {
          const deals = stage.deals || [];
          const totalValue = calculateTotalValue(deals);
          const colorClass = STAGE_COLORS[index % STAGE_COLORS.length];

          return (
            <div key={stage.id} className="flex-shrink-0 w-80">
              <Card className={cn('border-l-4', colorClass)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {stage.name}
                        <Badge variant="secondary" className="text-xs">
                          {deals.length}
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatCurrency(totalValue)}
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onAddDeal && (
                          <DropdownMenuItem onClick={() => onAddDeal(stage.id)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Deal
                          </DropdownMenuItem>
                        )}
                        {onStageEdit && (
                          <DropdownMenuItem onClick={() => onStageEdit(stage.id)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar Stage
                          </DropdownMenuItem>
                        )}
                        {onStageDelete && (
                          <DropdownMenuItem
                            onClick={() => onStageDelete(stage.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Deletar Stage
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <SortableContext
                    items={deals.map(d => d.id)}
                    strategy={verticalListSortingStrategy}
                    id={stage.id}
                  >
                    <div className="space-y-2 min-h-[200px]">
                      {deals.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
                          <p className="text-sm">Nenhum deal</p>
                          {onAddDeal && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-2"
                              onClick={() => onAddDeal(stage.id)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Adicionar
                            </Button>
                          )}
                        </div>
                      ) : (
                        deals.map(deal => (
                          <DealCard
                            key={deal.id}
                            deal={deal}
                            onClick={() => onDealClick?.(deal)}
                            onEdit={() => onDealEdit?.(deal)}
                            onDelete={() => onDealDelete?.(deal.id)}
                          />
                        ))
                      )}
                    </div>
                  </SortableContext>

                  {deals.length > 0 && onAddDeal && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => onAddDeal(stage.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Deal
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeDeal ? (
          <div className="rotate-3 opacity-80">
            <DealCard deal={activeDeal} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
