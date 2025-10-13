// @ts-nocheck
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { TriggerConfigComponent } from "./TriggerConfig";
import { ActionConfigComponent } from "./ActionConfig";
import type {
  Workflow,
  WorkflowEntityType,
  TriggerType,
  ActionType,
  CreateWorkflowInput,
} from "@/types/workflow";

interface WorkflowEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow?: Workflow;
  onSave: (data: CreateWorkflowInput) => void;
}

export const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  open,
  onOpenChange,
  workflow,
  onSave,
}) => {
  const [name, setName] = useState(workflow?.name || "");
  const [description, setDescription] = useState(workflow?.description || "");
  const [entityType, setEntityType] = useState<WorkflowEntityType>(
    workflow?.entityType || "lead"
  );
  const [triggerType, setTriggerType] = useState<TriggerType>(
    workflow?.triggerType || "stage_change"
  );
  const [triggerConfig, setTriggerConfig] = useState<any>(
    workflow?.triggerConfig || { type: "stage_change" }
  );
  const [actions, setActions] = useState<any[]>(workflow?.actions || []);

  const handleAddAction = (actionType: ActionType) => {
    const newAction: any = {
      type: actionType,
      id: `action-${Date.now()}`,
    };

    // Inicializar com valores padrão baseado no tipo
    switch (actionType) {
      case "send_email":
        newAction.to = "";
        newAction.subject = "";
        newAction.body = "";
        break;
      case "create_task":
        newAction.title = "";
        newAction.priority = "medium";
        break;
      case "send_notification":
        newAction.title = "";
        newAction.message = "";
        break;
      case "update_field":
        newAction.field = "";
        newAction.value = "";
        newAction.operation = "set";
        break;
      case "webhook":
        newAction.url = "";
        newAction.method = "POST";
        break;
    }

    setActions([...actions, newAction]);
  };

  const handleUpdateAction = (index: number, updatedAction: any) => {
    const newActions = [...actions];
    newActions[index] = updatedAction;
    setActions(newActions);
  };

  const handleRemoveAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const data: CreateWorkflowInput = {
      name,
      description,
      entityType,
      triggerType,
      triggerConfig: { ...triggerConfig, type: triggerType },
      actions,
      isActive: workflow?.isActive ?? false, // Criar desativado por padrão
    };

    onSave(data);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setName("");
    setDescription("");
    setEntityType("lead");
    setTriggerType("stage_change");
    setTriggerConfig({ type: "stage_change" });
    setActions([]);
    onOpenChange(false);
  };

  const isValid = () => {
    return name.trim().length > 0 && actions.length > 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {workflow ? "Editar Workflow" : "Novo Workflow"}
          </DialogTitle>
          <DialogDescription>
            Configure o gatilho e as ações para automatizar seu processo
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Workflow *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Email de boas-vindas"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  rows={2}
                  placeholder="Descreva o que este workflow faz..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="entityType">Tipo de Entidade *</Label>
                  <Select value={entityType} onValueChange={setEntityType}>
                    <SelectTrigger id="entityType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Leads</SelectItem>
                      <SelectItem value="company">Empresas</SelectItem>
                      <SelectItem value="deal">Deals</SelectItem>
                      <SelectItem value="task">Tarefas</SelectItem>
                      <SelectItem value="meeting">Reuniões</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="triggerType">Tipo de Gatilho *</Label>
                  <Select
                    value={triggerType}
                    onValueChange={(value: TriggerType) => {
                      setTriggerType(value);
                      setTriggerConfig({ type: value });
                    }}
                  >
                    <SelectTrigger id="triggerType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stage_change">
                        Mudança de Stage
                      </SelectItem>
                      <SelectItem value="field_change">
                        Mudança de Campo
                      </SelectItem>
                      <SelectItem value="time_based">
                        Baseado em Tempo
                      </SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="webhook">Webhook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Configuração do Gatilho */}
            <div>
              <TriggerConfigComponent
                triggerType={triggerType}
                config={triggerConfig}
                onChange={setTriggerConfig}
              />
            </div>

            {/* Ações */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Ações * (pelo menos uma)</Label>
                <div className="flex gap-2">
                  <Select onValueChange={handleAddAction}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Adicionar ação" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="send_email">Enviar Email</SelectItem>
                      <SelectItem value="create_task">Criar Tarefa</SelectItem>
                      <SelectItem value="send_notification">
                        Enviar Notificação
                      </SelectItem>
                      <SelectItem value="update_field">
                        Atualizar Campo
                      </SelectItem>
                      <SelectItem value="webhook">Chamar Webhook</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {actions.length === 0 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhuma ação adicionada ainda.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use o menu acima para adicionar uma ação.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {actions.map((action, index) => (
                  <ActionConfigComponent
                    key={action.id || index}
                    action={action}
                    onChange={(updated) => handleUpdateAction(index, updated)}
                    onRemove={() => handleRemoveAction(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!isValid()}>
            {workflow ? "Salvar Alterações" : "Criar Workflow"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
