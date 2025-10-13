/**
 * RelatedTasksSection Component
 * 
 * Seção para exibir e gerenciar tarefas relacionadas a um lead, company ou deal.
 * Usado em páginas de detalhes (LeadProfile, CompanyDetail, DealDetail).
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskList } from "./TaskList";
import { TaskFormDialog } from "./TaskFormDialog";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useCompleteTask } from "@/hooks/useTasks";
import { Plus, CheckCircle2 } from "lucide-react";
import type { Task, TaskFormData } from "@/types/task";

interface RelatedTasksSectionProps {
  leadId?: string;
  companyId?: string;
  dealId?: string;
  title?: string;
}

export function RelatedTasksSection({
  leadId,
  companyId,
  dealId,
  title = "Tarefas",
}: RelatedTasksSectionProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Buscar tarefas com filtro apropriado
  const filters = {
    ...(leadId && { lead_id: leadId }),
    ...(companyId && { company_id: companyId }),
    ...(dealId && { deal_id: dealId }),
  };

  const { data, isLoading } = useTasks(filters, 1, 50);
  const tasks = data?.tasks || [];

  // Mutations
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const completeTaskMutation = useCompleteTask();

  const handleCreateTask = (taskData: TaskFormData) => {
    // Adicionar relacionamento automático
    const dataWithRelation = {
      ...taskData,
      ...(leadId && { lead_id: leadId }),
      ...(companyId && { company_id: companyId }),
      ...(dealId && { deal_id: dealId }),
    };

    createTaskMutation.mutate(dataWithRelation);
    setShowCreateDialog(false);
  };

  const handleUpdateTask = (taskData: TaskFormData) => {
    if (!editingTask) return;

    updateTaskMutation.mutate({
      id: editingTask.id,
      updates: taskData,
    });
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm("Tem certeza que deseja deletar esta tarefa?")) {
      deleteTaskMutation.mutate(id);
    }
  };

  const handleCompleteTask = (id: string) => {
    completeTaskMutation.mutate(id);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  // Estatísticas rápidas
  const completedCount = tasks.filter((t) => t.status === "done").length;
  const pendingCount = tasks.filter((t) => t.status !== "done" && t.status !== "cancelled").length;
  const overdueCount = tasks.filter((t) => {
    if (t.status === "done" || t.status === "cancelled") return false;
    if (!t.due_date) return false;
    return new Date(t.due_date) < new Date();
  }).length;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            {title}
            <span className="text-sm text-muted-foreground font-normal">
              ({pendingCount} pendente{pendingCount !== 1 ? "s" : ""})
            </span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </CardHeader>

        <CardContent>
          {/* Estatísticas rápidas */}
          {tasks.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-muted-foreground">
                  {pendingCount}
                </div>
                <div className="text-xs text-muted-foreground">Pendentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {completedCount}
                </div>
                <div className="text-xs text-muted-foreground">Concluídas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-destructive">
                  {overdueCount}
                </div>
                <div className="text-xs text-muted-foreground">Vencidas</div>
              </div>
            </div>
          )}

          {/* Lista de tarefas */}
          <TaskList
            tasks={tasks}
            isLoading={isLoading}
            onTaskClick={handleEditTask}
            onComplete={handleCompleteTask}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            showRelated={false}
            enableFilters={tasks.length > 5}
            groupByStatus={false}
            emptyMessage="Nenhuma tarefa criada ainda"
          />
        </CardContent>
      </Card>

      {/* Dialog para criar tarefa */}
      <TaskFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateTask}
        isLoading={createTaskMutation.isPending}
        leadId={leadId}
        companyId={companyId}
        dealId={dealId}
      />

      {/* Dialog para editar tarefa */}
      <TaskFormDialog
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onSubmit={handleUpdateTask}
        task={editingTask}
        isLoading={updateTaskMutation.isPending}
        leadId={leadId}
        companyId={companyId}
        dealId={dealId}
      />
    </>
  );
}
