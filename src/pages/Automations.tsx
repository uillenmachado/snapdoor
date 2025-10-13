// @ts-nocheck
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { WorkflowEditor } from "@/components/WorkflowEditor";
import {
  useWorkflows,
  useCreateWorkflow,
  useToggleWorkflow,
  useDeleteWorkflow,
  useWorkflowsOverview,
} from "@/hooks/useWorkflows";
import {
  Plus,
  MoreVertical,
  Play,
  Edit,
  Copy,
  Trash2,
  Activity,
  Zap,
  Clock,
  Mail,
  CheckSquare,
  Bell,
  Webhook,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Automations: React.FC = () => {
  const [showEditor, setShowEditor] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<string | null>(null);

  const { data: workflows, isLoading } = useWorkflows();
  const { data: overview } = useWorkflowsOverview();
  const createWorkflow = useCreateWorkflow();
  const toggleWorkflow = useToggleWorkflow();
  const deleteWorkflow = useDeleteWorkflow();

  const handleCreateWorkflow = (data: any) => {
    createWorkflow.mutate(data);
  };

  const handleToggle = (id: string, currentStatus: boolean) => {
    toggleWorkflow.mutate({ id, isActive: !currentStatus });
  };

  const handleDelete = () => {
    if (workflowToDelete) {
      deleteWorkflow.mutate(workflowToDelete);
      setWorkflowToDelete(null);
    }
  };

  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case "stage_change":
        return <Activity className="h-4 w-4" />;
      case "field_change":
        return <Edit className="h-4 w-4" />;
      case "time_based":
        return <Clock className="h-4 w-4" />;
      case "manual":
        return <Play className="h-4 w-4" />;
      case "webhook":
        return <Webhook className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getTriggerLabel = (triggerType: string) => {
    switch (triggerType) {
      case "stage_change":
        return "Mudança de Stage";
      case "field_change":
        return "Mudança de Campo";
      case "time_based":
        return "Baseado em Tempo";
      case "manual":
        return "Manual";
      case "webhook":
        return "Webhook";
      default:
        return triggerType;
    }
  };

  const getEntityLabel = (entityType: string) => {
    switch (entityType) {
      case "lead":
        return "Leads";
      case "company":
        return "Empresas";
      case "deal":
        return "Deals";
      case "task":
        return "Tarefas";
      case "meeting":
        return "Reuniões";
      default:
        return entityType;
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case "send_email":
        return <Mail className="h-3 w-3" />;
      case "create_task":
        return <CheckSquare className="h-3 w-3" />;
      case "send_notification":
        return <Bell className="h-3 w-3" />;
      case "webhook":
        return <Webhook className="h-3 w-3" />;
      default:
        return <Zap className="h-3 w-3" />;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automações</h1>
          <p className="text-muted-foreground mt-1">
            Automatize processos com workflows inteligentes
          </p>
        </div>
        <Button onClick={() => setShowEditor(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Workflow
        </Button>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total de Workflows</CardDescription>
              <CardTitle className="text-3xl">{overview.totalWorkflows}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Workflows Ativos</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {overview.activeWorkflows}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Execuções Hoje</CardDescription>
              <CardTitle className="text-3xl">
                {overview.totalExecutionsToday}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Execuções Este Mês</CardDescription>
              <CardTitle className="text-3xl">
                {overview.totalExecutionsThisMonth}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Workflows List */}
      <div className="space-y-4">
        {workflows && workflows.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Zap className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Nenhum workflow criado ainda
              </h3>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                Crie seu primeiro workflow para automatizar tarefas repetitivas e
                aumentar sua produtividade.
              </p>
              <Button onClick={() => setShowEditor(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Workflow
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows?.map((workflow) => (
            <Card key={workflow.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{workflow.name}</CardTitle>
                    {workflow.description && (
                      <CardDescription className="mt-1">
                        {workflow.description}
                      </CardDescription>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setWorkflowToDelete(workflow.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Deletar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">
                    {getTriggerIcon(workflow.triggerType)}
                    <span className="ml-1">
                      {getTriggerLabel(workflow.triggerType)}
                    </span>
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {getEntityLabel(workflow.entityType)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Ações ({workflow.actions?.length || 0}):
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {workflow.actions?.map((action: any, idx: number) => (
                        <div
                          key={idx}
                          className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs"
                        >
                          {getActionIcon(action.type)}
                          <span className="capitalize">
                            {action.type.replace(/_/g, " ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <p>
                      Execuções: {workflow.executionCount || 0}
                    </p>
                    {workflow.lastExecutedAt && (
                      <p>
                        Última execução:{" "}
                        {formatDistanceToNow(new Date(workflow.lastExecutedAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t pt-4">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={workflow.isActive}
                      onCheckedChange={() =>
                        handleToggle(workflow.id, workflow.isActive)
                      }
                    />
                    <span className="text-sm">
                      {workflow.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  {workflow.isActive && (
                    <Badge variant="secondary" className="text-xs">
                      <Activity className="h-3 w-3 mr-1" />
                      Em execução
                    </Badge>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Workflow Editor Dialog */}
      <WorkflowEditor
        open={showEditor}
        onOpenChange={setShowEditor}
        onSave={handleCreateWorkflow}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!workflowToDelete}
        onOpenChange={(open) => !open && setWorkflowToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar Workflow</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este workflow? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Automations;
