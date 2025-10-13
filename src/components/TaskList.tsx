/**
 * TaskList Component
 * 
 * Lista de tarefas com:
 * - Filtros (status, prioridade, busca)
 * - Agrupamento por status
 * - Loading states
 * - Empty states personalizados
 * - Paginação
 */

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskCard } from "./TaskCard";
import { Search, Plus, Filter } from "lucide-react";
import type { Task, TaskStatus, TaskPriority } from "@/types/task";
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from "@/types/task";

interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
  onTaskClick?: (task: Task) => void;
  onComplete?: (id: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (id: string) => void;
  onCreateNew?: () => void;
  showRelated?: boolean;
  enableFilters?: boolean;
  groupByStatus?: boolean;
  emptyMessage?: string;
}

export function TaskList({
  tasks,
  isLoading = false,
  onTaskClick,
  onComplete,
  onEdit,
  onDelete,
  onCreateNew,
  showRelated = true,
  enableFilters = true,
  groupByStatus = false,
  emptyMessage = "Nenhuma tarefa encontrada",
}: TaskListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">(
    "all"
  );

  // Filtrar tarefas
  const filteredTasks = tasks.filter((task) => {
    // Filtro de busca
    if (search) {
      const searchLower = search.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(searchLower);
      const matchDescription = task.description
        ?.toLowerCase()
        .includes(searchLower);
      if (!matchTitle && !matchDescription) {
        return false;
      }
    }

    // Filtro de status
    if (statusFilter !== "all" && task.status !== statusFilter) {
      return false;
    }

    // Filtro de prioridade
    if (priorityFilter !== "all" && task.priority !== priorityFilter) {
      return false;
    }

    return true;
  });

  // Agrupar tarefas por status
  const groupedTasks = groupByStatus
    ? {
        todo: filteredTasks.filter((t) => t.status === "todo"),
        in_progress: filteredTasks.filter((t) => t.status === "in_progress"),
        done: filteredTasks.filter((t) => t.status === "done"),
        cancelled: filteredTasks.filter((t) => t.status === "cancelled"),
      }
    : null;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-muted/50 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header: Filtros e botão criar */}
      {(enableFilters || onCreateNew) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Busca */}
          {enableFilters && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tarefas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          )}

          {/* Filtro de status */}
          {enableFilters && (
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as TaskStatus | "all")
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                {Object.entries(TASK_STATUS_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.icon} {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Filtro de prioridade */}
          {enableFilters && (
            <Select
              value={priorityFilter}
              onValueChange={(value) =>
                setPriorityFilter(value as TaskPriority | "all")
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas prioridades</SelectItem>
                {Object.entries(TASK_PRIORITY_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.icon} {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Botão criar nova tarefa */}
          {onCreateNew && (
            <Button onClick={onCreateNew} className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          )}
        </div>
      )}

      {/* Lista de tarefas */}
      {groupByStatus && groupedTasks ? (
        // Modo agrupado por status
        <div className="space-y-6">
          {Object.entries(groupedTasks).map(([status, statusTasks]) => {
            const config = TASK_STATUS_CONFIG[status as TaskStatus];
            if (statusTasks.length === 0) return null;

            return (
              <div key={status}>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span>{config.icon}</span>
                  <span>{config.label}</span>
                  <span className="text-sm text-muted-foreground">
                    ({statusTasks.length})
                  </span>
                </h3>
                <div className="space-y-3">
                  {statusTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onClick={onTaskClick}
                      onComplete={onComplete}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      showRelated={showRelated}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Modo lista simples
        <>
          {filteredTasks.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-muted-foreground">{emptyMessage}</p>
              {onCreateNew && search === "" && (
                <Button onClick={onCreateNew} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeira tarefa
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={onTaskClick}
                  onComplete={onComplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  showRelated={showRelated}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Info de filtros ativos */}
      {enableFilters &&
        (search || statusFilter !== "all" || priorityFilter !== "all") && (
          <div className="text-sm text-muted-foreground text-center">
            {filteredTasks.length} de {tasks.length} tarefas exibidas
            {(search || statusFilter !== "all" || priorityFilter !== "all") && (
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                }}
                className="ml-2"
              >
                Limpar filtros
              </Button>
            )}
          </div>
        )}
    </div>
  );
}
