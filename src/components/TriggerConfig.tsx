// @ts-nocheck
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { TriggerConfig, TriggerType } from "@/types/workflow";

interface TriggerConfigProps {
  triggerType: TriggerType;
  config: TriggerConfig;
  onChange: (config: TriggerConfig) => void;
}

export const TriggerConfigComponent: React.FC<TriggerConfigProps> = ({
  triggerType,
  config,
  onChange,
}) => {
  const renderStageChangeTrigger = () => {
    const cfg = config as any;
    return (
      <div className="space-y-4">
        <div>
          <Label>Do Stage (opcional)</Label>
          <Input
            placeholder="Ex: lead, contacted, proposal..."
            value={cfg.fromStage || ""}
            onChange={(e) =>
              onChange({ ...config, fromStage: e.target.value || undefined })
            }
          />
        </div>
        <div>
          <Label>Para Stage (opcional)</Label>
          <Input
            placeholder="Ex: contacted, qualified, won..."
            value={cfg.toStage || ""}
            onChange={(e) =>
              onChange({ ...config, toStage: e.target.value || undefined })
            }
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Deixe em branco para acionar em qualquer mudança de stage
        </p>
      </div>
    );
  };

  const renderFieldChangeTrigger = () => {
    const cfg = config as any;
    return (
      <div className="space-y-4">
        <div>
          <Label>Campo *</Label>
          <Input
            placeholder="Ex: status, email, phone..."
            value={cfg.field || ""}
            onChange={(e) => onChange({ ...config, field: e.target.value })}
          />
        </div>
        <div>
          <Label>Operador</Label>
          <Select
            value={cfg.operator || "equals"}
            onValueChange={(value) => onChange({ ...config, operator: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equals">Igual a</SelectItem>
              <SelectItem value="contains">Contém</SelectItem>
              <SelectItem value="greater_than">Maior que</SelectItem>
              <SelectItem value="less_than">Menor que</SelectItem>
              <SelectItem value="changes">Quando mudar</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Valor (opcional)</Label>
          <Input
            placeholder="Valor para comparação"
            value={cfg.toValue || ""}
            onChange={(e) =>
              onChange({ ...config, toValue: e.target.value || undefined })
            }
          />
        </div>
      </div>
    );
  };

  const renderTimeBasedTrigger = () => {
    const cfg = config as any;
    return (
      <div className="space-y-4">
        <div>
          <Label>Tipo de Agendamento</Label>
          <Select
            value={cfg.scheduleType || "cron"}
            onValueChange={(value) =>
              onChange({ ...config, scheduleType: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cron">Expressão Cron</SelectItem>
              <SelectItem value="interval">Intervalo</SelectItem>
              <SelectItem value="once">Uma Vez</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {cfg.scheduleType === "cron" && (
          <div>
            <Label>Expressão Cron *</Label>
            <Input
              placeholder="Ex: 0 9 * * * (todo dia às 9h)"
              value={cfg.cronExpression || ""}
              onChange={(e) =>
                onChange({ ...config, cronExpression: e.target.value })
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Formato: minuto hora dia mês dia-da-semana
            </p>
          </div>
        )}

        {cfg.scheduleType === "interval" && (
          <div>
            <Label>Intervalo (minutos) *</Label>
            <Input
              type="number"
              placeholder="Ex: 60"
              value={cfg.intervalMinutes || ""}
              onChange={(e) =>
                onChange({
                  ...config,
                  intervalMinutes: parseInt(e.target.value) || undefined,
                })
              }
            />
          </div>
        )}

        {cfg.scheduleType === "once" && (
          <div>
            <Label>Data e Hora *</Label>
            <Input
              type="datetime-local"
              value={cfg.executeAt || ""}
              onChange={(e) =>
                onChange({ ...config, executeAt: e.target.value })
              }
            />
          </div>
        )}
      </div>
    );
  };

  const renderManualTrigger = () => {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Este workflow será executado apenas manualmente, quando você clicar no
          botão "Executar".
        </p>
      </div>
    );
  };

  const renderWebhookTrigger = () => {
    const cfg = config as any;
    return (
      <div className="space-y-4">
        <div>
          <Label>URL do Webhook *</Label>
          <Input
            placeholder="https://seu-webhook.com/endpoint"
            value={cfg.webhookUrl || ""}
            onChange={(e) =>
              onChange({ ...config, webhookUrl: e.target.value })
            }
          />
        </div>
        <div>
          <Label>Secret (opcional)</Label>
          <Input
            type="password"
            placeholder="Para validação de assinatura"
            value={cfg.secret || ""}
            onChange={(e) =>
              onChange({ ...config, secret: e.target.value || undefined })
            }
          />
        </div>
      </div>
    );
  };

  const renderTriggerConfig = () => {
    switch (triggerType) {
      case "stage_change":
        return renderStageChangeTrigger();
      case "field_change":
        return renderFieldChangeTrigger();
      case "time_based":
        return renderTimeBasedTrigger();
      case "manual":
        return renderManualTrigger();
      case "webhook":
        return renderWebhookTrigger();
      default:
        return null;
    }
  };

  const getTriggerTitle = () => {
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
        return "Configuração do Gatilho";
    }
  };

  const getTriggerDescription = () => {
    switch (triggerType) {
      case "stage_change":
        return "Aciona quando o stage/status de um registro muda";
      case "field_change":
        return "Aciona quando um campo específico é alterado";
      case "time_based":
        return "Executa em intervalos regulares ou em horários específicos";
      case "manual":
        return "Executado apenas quando você clicar manualmente";
      case "webhook":
        return "Acionado por uma chamada HTTP externa";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getTriggerTitle()}</CardTitle>
        <CardDescription>{getTriggerDescription()}</CardDescription>
      </CardHeader>
      <CardContent>{renderTriggerConfig()}</CardContent>
    </Card>
  );
};
