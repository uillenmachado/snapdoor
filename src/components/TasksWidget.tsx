/**
 * TasksWidget Component
 * 
 * Widget para exibir tarefas pendentes no Dashboard com:
 * - Lista compacta das próximas 5 tarefas
 * - Contador de tarefas vencidas
 * - Atalhos para criar nova tarefa
 * - Link para página completa de tarefas
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "./TaskCard";
import { TaskFormDialog } from "./TaskFormDialog";
import { useUpcomingTasks, useOverdueTasks, useCompleteTask, useCreateTask } from "@/hooks/useTasks";
import { Plus, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { TaskFormData } from "@/types/task";

export function TasksWidget() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const { data: upcomingTasks = [], isLoading: loadingUpcoming } = useUpcomingTasks(5);
  const { data: overdueTasks = [], isLoading: loadingOverdue } = useOverdueTasks();

  const completeTaskMutation = useCompleteTask();
  const createTaskMutation = useCreateTask();

  const handleComplete = (id: string) => {
    completeTaskMutation.mutate(id);
  };

  const handleCreateTask = (data: TaskFormData) => {
    createTaskMutation.mutate(data);
    setShowCreateDialog(false);
  };

  const isLoading = loadingUpcoming || loadingOverdue;
  const overdueCount = overdueTasks.length;
  const hasOverdue = overdueCount > 0;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Tarefas Pendentes
            {hasOverdue && (
              <Badge variant="destructive" className="ml-2">
                {overdueCount} vencida{overdueCount > 1 ? "s" : ""}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-muted/50 animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : upcomingTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-sm text-muted-foreground mb-3">
                Nenhuma tarefa pendente
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar tarefa
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleComplete}
                  compact={true}
                  showRelated={false}
                />
              ))}
            </div>
          )}
        </CardContent>

        {upcomingTasks.length > 0 && (
          <CardFooter className="pt-0">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              asChild
            >
              <Link to="/tasks">
                Ver todas as tarefas
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardFooter>
        )}
      </Card>

      <TaskFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateTask}
        isLoading={createTaskMutation.isPending}
      />
    </>
  );
}
