// @ts-nocheck
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { ActionConfig, ActionType } from "@/types/workflow";

interface ActionConfigProps {
  action: ActionConfig;
  onChange: (action: ActionConfig) => void;
  onRemove: () => void;
}

export const ActionConfigComponent: React.FC<ActionConfigProps> = ({
  action,
  onChange,
  onRemove,
}) => {
  const renderSendEmailAction = () => {
    return (
      <div className="space-y-4">
        <div>
          <Label>Para (Email) *</Label>
          <Input
            placeholder="email@exemplo.com ou {{lead.email}}"
            value={action.to || ""}
            onChange={(e) => onChange({ ...action, to: e.target.value })}
          />
        </div>
        <div>
          <Label>Assunto *</Label>
          <Input
            placeholder="Ex: Bem-vindo(a), {{lead.name}}!"
            value={action.subject || ""}
            onChange={(e) => onChange({ ...action, subject: e.target.value })}
          />
        </div>
        <div>
          <Label>Corpo do Email *</Label>
          <Textarea
            rows={5}
            placeholder="Use variáveis como {{lead.name}}, {{lead.email}}, etc."
            value={action.body || ""}
            onChange={(e) => onChange({ ...action, body: e.target.value })}
          />
        </div>
      </div>
    );
  };

  const renderCreateTaskAction = () => {
    return (
      <div className="space-y-4">
        <div>
          <Label>Título da Tarefa *</Label>
          <Input
            placeholder="Ex: Follow-up com {{lead.name}}"
            value={action.title || ""}
            onChange={(e) => onChange({ ...action, title: e.target.value })}
          />
        </div>
        <div>
          <Label>Descrição</Label>
          <Textarea
            rows={3}
            placeholder="Detalhes da tarefa..."
            value={action.description || ""}
            onChange={(e) => onChange({ ...action, description: e.target.value })}
          />
        </div>
        <div>
          <Label>Data de Vencimento</Label>
          <Input
            placeholder="Ex: +3 days, +1 week"
            value={action.dueDate || ""}
            onChange={(e) => onChange({ ...action, dueDate: e.target.value })}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Use expressões como "+3 days", "+1 week" ou data específica
          </p>
        </div>
        <div>
          <Label>Prioridade</Label>
          <Select
            value={action.priority || "medium"}
            onValueChange={(value) => onChange({ ...action, priority: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const renderSendNotificationAction = () => {
    return (
      <div className="space-y-4">
        <div>
          <Label>Título *</Label>
          <Input
            placeholder="Ex: Novo lead recebido!"
            value={action.title || ""}
            onChange={(e) => onChange({ ...action, title: e.target.value })}
          />
        </div>
        <div>
          <Label>Mensagem *</Label>
          <Textarea
            rows={3}
            placeholder="Texto da notificação..."
            value={action.message || ""}
            onChange={(e) => onChange({ ...action, message: e.target.value })}
          />
        </div>
        <div>
          <Label>Link (opcional)</Label>
          <Input
            placeholder="/leads/{{lead.id}}"
            value={action.link || ""}
            onChange={(e) => onChange({ ...action, link: e.target.value })}
          />
        </div>
      </div>
    );
  };

  const renderUpdateFieldAction = () => {
    return (
      <div className="space-y-4">
        <div>
          <Label>Campo *</Label>
          <Input
            placeholder="Ex: status, priority, assigned_to..."
            value={action.field || ""}
            onChange={(e) => onChange({ ...action, field: e.target.value })}
          />
        </div>
        <div>
          <Label>Novo Valor *</Label>
          <Input
            placeholder="Valor ou variável {{...}}"
            value={action.value || ""}
            onChange={(e) => onChange({ ...action, value: e.target.value })}
          />
        </div>
        <div>
          <Label>Operação</Label>
          <Select
            value={action.operation || "set"}
            onValueChange={(value) => onChange({ ...action, operation: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="set">Definir (Set)</SelectItem>
              <SelectItem value="increment">Incrementar</SelectItem>
              <SelectItem value="decrement">Decrementar</SelectItem>
              <SelectItem value="append">Adicionar ao final</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  const renderWebhookAction = () => {
    return (
      <div className="space-y-4">
        <div>
          <Label>URL *</Label>
          <Input
            placeholder="https://seu-webhook.com/endpoint"
            value={action.url || ""}
            onChange={(e) => onChange({ ...action, url: e.target.value })}
          />
        </div>
        <div>
          <Label>Método HTTP</Label>
          <Select
            value={action.method || "POST"}
            onValueChange={(value) => onChange({ ...action, method: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Corpo (JSON)</Label>
          <Textarea
            rows={4}
            placeholder='{"key": "value", "lead": "{{lead.id}}"}'
            value={
              typeof action.body === "string"
                ? action.body
                : JSON.stringify(action.body || {}, null, 2)
            }
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                onChange({ ...action, body: parsed });
              } catch {
                onChange({ ...action, body: e.target.value });
              }
            }}
          />
        </div>
      </div>
    );
  };

  const renderActionConfig = () => {
    switch (action.type) {
      case "send_email":
        return renderSendEmailAction();
      case "create_task":
        return renderCreateTaskAction();
      case "send_notification":
        return renderSendNotificationAction();
      case "update_field":
        return renderUpdateFieldAction();
      case "webhook":
        return renderWebhookAction();
      default:
        return (
          <p className="text-sm text-muted-foreground">
            Configuração para este tipo de ação ainda não implementada.
          </p>
        );
    }
  };

  const getActionTitle = () => {
    switch (action.type) {
      case "send_email":
        return "Enviar Email";
      case "create_task":
        return "Criar Tarefa";
      case "send_notification":
        return "Enviar Notificação";
      case "update_field":
        return "Atualizar Campo";
      case "webhook":
        return "Chamar Webhook";
      case "assign_user":
        return "Atribuir Usuário";
      case "add_tag":
        return "Adicionar Tag";
      case "move_stage":
        return "Mover Stage";
      default:
        return "Ação";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{getActionTitle()}</CardTitle>
            {action.name && (
              <CardDescription>{action.name}</CardDescription>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label>Nome da Ação (opcional)</Label>
            <Input
              placeholder="Nome descritivo"
              value={action.name || ""}
              onChange={(e) => onChange({ ...action, name: e.target.value })}
            />
          </div>
          {renderActionConfig()}
        </div>
      </CardContent>
    </Card>
  );
};
