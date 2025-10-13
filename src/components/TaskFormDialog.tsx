/**
 * TaskFormDialog Component
 * 
 * Dialog para criar/editar tarefas com:
 * - Formulário completo (título, descrição, prioridade, data)
 * - Validações
 * - Date picker para due_date
 * - Select para status, prioridade
 * - Relacionamentos opcionais (lead, company, deal)
 */

import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task, TaskFormData, TaskStatus, TaskPriority } from "@/types/task";
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG } from "@/types/task";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TaskFormData) => void;
  task?: Task | null;  // Se fornecido, modo edição
  isLoading?: boolean;
  leadId?: string;     // Pre-preencher relacionamento com lead
  companyId?: string;  // Pre-preencher relacionamento com company
  dealId?: string;     // Pre-preencher relacionamento com deal
}

export function TaskFormDialog({
  open,
  onOpenChange,
  onSubmit,
  task,
  isLoading = false,
  leadId,
  companyId,
  dealId,
}: TaskFormDialogProps) {
  const isEditMode = !!task;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    defaultValues: {
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      due_date: undefined,
      lead_id: leadId,
      company_id: companyId,
      deal_id: dealId,
    },
  });

  const statusValue = watch("status");
  const priorityValue = watch("priority");

  // Reset form quando abrir/fechar ou mudar tarefa
  useEffect(() => {
    if (open) {
      if (task) {
        // Modo edição: preencher com dados da tarefa
        reset({
          title: task.title,
          description: task.description || "",
          status: task.status,
          priority: task.priority,
          due_date: task.due_date || undefined,
          lead_id: task.lead_id || leadId,
          company_id: task.company_id || companyId,
          deal_id: task.deal_id || dealId,
        });
      } else {
        // Modo criação: valores padrão
        reset({
          title: "",
          description: "",
          status: "todo",
          priority: "medium",
          due_date: undefined,
          lead_id: leadId,
          company_id: companyId,
          deal_id: dealId,
        });
      }
    }
  }, [open, task, reset, leadId, companyId, dealId]);

  const handleFormSubmit = (data: TaskFormData) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Editar Tarefa" : "Nova Tarefa"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Atualize as informações da tarefa."
              : "Preencha os detalhes para criar uma nova tarefa."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4 py-4">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Título <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Ex: Ligar para cliente"
                {...register("title", {
                  required: "Título é obrigatório",
                  minLength: {
                    value: 3,
                    message: "Título deve ter no mínimo 3 caracteres",
                  },
                })}
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-sm text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Detalhes adicionais sobre a tarefa..."
                rows={3}
                {...register("description")}
                disabled={isLoading}
              />
            </div>

            {/* Linha 1: Status e Prioridade */}
            <div className="grid grid-cols-2 gap-4">
              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={statusValue}
                  onValueChange={(value) =>
                    setValue("status", value as TaskStatus)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_STATUS_CONFIG).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          {config.icon} {config.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prioridade */}
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  value={priorityValue}
                  onValueChange={(value) =>
                    setValue("priority", value as TaskPriority)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id="priority">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_PRIORITY_CONFIG).map(
                      ([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center gap-2">
                            {config.icon} {config.label}
                          </span>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Data de vencimento */}
            <div className="space-y-2">
              <Label htmlFor="due_date">Data de Vencimento</Label>
              <Input
                id="due_date"
                type="date"
                {...register("due_date")}
                disabled={isLoading}
                min={new Date().toISOString().split("T")[0]}
              />
              <p className="text-xs text-muted-foreground">
                Opcional: Defina quando esta tarefa deve ser concluída
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Salvando..."
                : isEditMode
                ? "Atualizar"
                : "Criar Tarefa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
