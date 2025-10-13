/**
 * TaskCard Component
 * 
 * Card compacto para exibir uma tarefa individual com:
 * - Checkbox para marcar como concluída
 * - Badges de prioridade e status
 * - Informações da tarefa (título, descrição, data)
 * - Countdown visual para vencimento
 * - Relacionamentos (lead, company, deal)
 */

import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Clock, AlertCircle } from "lucide-react";
import type { Task } from "@/types/task";
import {
  getTaskStatusConfig,
  getTaskPriorityConfig,
  isTaskOverdue,
  isTaskDueToday,
  formatDueMessage,
  getDueColor,
} from "@/types/task";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onComplete?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onClick?: (task: Task) => void;
  showRelated?: boolean;      // Exibir informações de relacionamentos
  compact?: boolean;           // Modo compacto (para widgets)
  disabled?: boolean;
}

export function TaskCard({
  task,
  onComplete,
  onEdit,
  onDelete,
  onClick,
  showRelated = true,
  compact = false,
  disabled = false,
}: TaskCardProps) {
  const statusConfig = getTaskStatusConfig(task.status);
  const priorityConfig = getTaskPriorityConfig(task.priority);
  const isOverdue = isTaskOverdue(task);
  const isDueToday = isTaskDueToday(task);
  const dueMessage = formatDueMessage(task);
  const dueColor = getDueColor(task);

  const isDone = task.status === "done";
  const isCancelled = task.status === "cancelled";

  const handleComplete = (checked: boolean) => {
    if (checked && onComplete) {
      onComplete(task.id);
    }
  };

  const handleCardClick = () => {
    if (onClick && !disabled) {
      onClick(task);
    }
  };

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md",
        isDone && "opacity-60",
        isCancelled && "opacity-40",
        onClick && !disabled && "cursor-pointer",
        compact && "text-sm"
      )}
      onClick={handleCardClick}
    >
      <CardContent className={cn("p-4", compact && "p-3")}>
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <Checkbox
            checked={isDone}
            onCheckedChange={handleComplete}
            disabled={disabled || isCancelled}
            className="mt-1"
          />

          {/* Conteúdo principal */}
          <div className="flex-1 min-w-0">
            {/* Header: Título e badges */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4
                className={cn(
                  "font-semibold",
                  compact ? "text-sm" : "text-base",
                  isDone && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </h4>

              <div className="flex gap-1 shrink-0">
                {/* Badge de prioridade */}
                <Badge
                  variant="secondary"
                  style={{
                    backgroundColor: priorityConfig.bgColor,
                    color: priorityConfig.color,
                  }}
                  className="text-xs"
                >
                  {priorityConfig.icon} {priorityConfig.label}
                </Badge>

                {/* Badge de status */}
                {!compact && (
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: statusConfig.bgColor,
                      color: statusConfig.color,
                    }}
                    className="text-xs"
                  >
                    {statusConfig.icon} {statusConfig.label}
                  </Badge>
                )}
              </div>
            </div>

            {/* Descrição */}
            {task.description && !compact && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {task.description}
              </p>
            )}

            {/* Informações de data e vencimento */}
            {task.due_date && !isDone && !isCancelled && (
              <div className="flex items-center gap-2 mb-3">
                {isOverdue ? (
                  <div className="flex items-center gap-1 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">{dueMessage}</span>
                  </div>
                ) : isDueToday ? (
                  <div className="flex items-center gap-1 text-amber-600 text-sm">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{dueMessage}</span>
                  </div>
                ) : (
                  <div
                    className="flex items-center gap-1 text-sm"
                    style={{ color: dueColor }}
                  >
                    <Clock className="h-4 w-4" />
                    <span>{dueMessage}</span>
                  </div>
                )}
              </div>
            )}

            {/* Data de conclusão */}
            {isDone && task.completed_at && (
              <div className="text-xs text-muted-foreground mb-2">
                ✅ Concluída em{" "}
                {new Date(task.completed_at).toLocaleDateString("pt-BR")}
              </div>
            )}

            {/* Relacionamentos (lead, company, deal) */}
            {showRelated && !compact && (
              <div className="flex flex-wrap gap-2 mb-2">
                {task.lead && (
                  <Badge variant="outline" className="text-xs">
                    👤 {task.lead.name}
                  </Badge>
                )}
                {task.company && (
                  <Badge variant="outline" className="text-xs">
                    🏢 {task.company.name}
                  </Badge>
                )}
                {task.deal && (
                  <Badge variant="outline" className="text-xs">
                    💼 {task.deal.title}
                  </Badge>
                )}
              </div>
            )}

            {/* Ações (edit e delete) */}
            {!compact && (onEdit || onDelete) && (
              <div className="flex gap-2 mt-3">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(task);
                    }}
                    disabled={disabled}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                )}

                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(task.id);
                    }}
                    disabled={disabled}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Deletar
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
