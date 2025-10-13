// =====================================================
// FASE 9: Workflow Types
// Sistema de automação e workflows
// =====================================================

// =====================================================
// ENUMS
// =====================================================

/**
 * Tipo de entidade que pode acionar workflows
 */
export type WorkflowEntityType = "lead" | "company" | "deal" | "task" | "meeting";

/**
 * Tipos de gatilhos (triggers)
 */
export type TriggerType = 
  | "stage_change"      // Quando stage/status muda
  | "field_change"      // Quando campo específico muda
  | "time_based"        // Baseado em tempo (cron, interval)
  | "manual"            // Acionado manualmente
  | "webhook";          // Via webhook externo

/**
 * Tipos de ações
 */
export type ActionType =
  | "send_email"        // Enviar email
  | "create_task"       // Criar tarefa
  | "send_notification" // Enviar notificação in-app
  | "update_field"      // Atualizar campo
  | "webhook"           // Chamar webhook externo
  | "assign_user"       // Atribuir a usuário
  | "add_tag"           // Adicionar tag
  | "move_stage";       // Mover para outro stage

/**
 * Status de execução do workflow
 */
export type ExecutionStatus = 
  | "pending"           // Aguardando execução
  | "running"           // Em execução
  | "completed"         // Concluído com sucesso
  | "failed"            // Falhou
  | "skipped";          // Pulado (condições não atendidas)

/**
 * Tipo de schedule para time_based triggers
 */
export type ScheduleType =
  | "cron"              // Expressão cron (ex: "0 9 * * 1")
  | "interval"          // Intervalo em minutos
  | "once";             // Executar uma vez em data/hora específica

// =====================================================
// TRIGGER CONFIGURATIONS
// =====================================================

/**
 * Configuração base de trigger
 */
export interface BaseTriggerConfig {
  type: TriggerType;
}

/**
 * Configuração de trigger de mudança de stage
 */
export interface StageChangeTriggerConfig extends BaseTriggerConfig {
  type: "stage_change";
  fromStage?: string;   // Stage de origem (opcional - qualquer se vazio)
  toStage?: string;     // Stage de destino (opcional - qualquer se vazio)
  pipelineId?: string;  // Pipeline específico (opcional)
}

/**
 * Configuração de trigger de mudança de campo
 */
export interface FieldChangeTriggerConfig extends BaseTriggerConfig {
  type: "field_change";
  field: string;                // Nome do campo
  fromValue?: any;              // Valor anterior (opcional)
  toValue?: any;                // Novo valor (opcional)
  operator?: "equals" | "contains" | "greater_than" | "less_than" | "changes";
}

/**
 * Configuração de trigger baseado em tempo
 */
export interface TimeBasedTriggerConfig extends BaseTriggerConfig {
  type: "time_based";
  scheduleType: ScheduleType;
  cronExpression?: string;      // Para scheduleType = "cron"
  intervalMinutes?: number;     // Para scheduleType = "interval"
  executeAt?: string;           // Para scheduleType = "once" (ISO datetime)
  conditions?: TriggerCondition[]; // Condições opcionais para filtrar registros
}

/**
 * Configuração de trigger manual
 */
export interface ManualTriggerConfig extends BaseTriggerConfig {
  type: "manual";
  requireConfirmation?: boolean;
}

/**
 * Configuração de trigger via webhook
 */
export interface WebhookTriggerConfig extends BaseTriggerConfig {
  type: "webhook";
  webhookUrl: string;
  secret?: string;              // Para validação de assinatura
  headers?: Record<string, string>;
}

/**
 * União de todos os tipos de trigger config
 */
export type TriggerConfig = 
  | StageChangeTriggerConfig
  | FieldChangeTriggerConfig
  | TimeBasedTriggerConfig
  | ManualTriggerConfig
  | WebhookTriggerConfig;

/**
 * Condição para filtrar quando trigger deve executar
 */
export interface TriggerCondition {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "not_contains" | "greater_than" | "less_than" | "is_empty" | "is_not_empty";
  value?: any;
}

// =====================================================
// ACTION CONFIGURATIONS
// =====================================================

/**
 * Configuração base de ação
 */
export interface BaseActionConfig {
  type: ActionType;
  id?: string;                  // ID único para referência
  name?: string;                // Nome descritivo da ação
}

/**
 * Configuração de ação de enviar email
 */
export interface SendEmailActionConfig extends BaseActionConfig {
  type: "send_email";
  to: string | string[];        // Email(s) destinatário(s) ou variáveis como {{lead.email}}
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;              // Suporta variáveis: {{lead.name}}
  body: string;                 // HTML ou texto com variáveis
  template?: string;            // Template ID (se usar templates salvos)
}

/**
 * Configuração de ação de criar tarefa
 */
export interface CreateTaskActionConfig extends BaseActionConfig {
  type: "create_task";
  title: string;                // Suporta variáveis: "Follow-up com {{lead.name}}"
  description?: string;
  assignedTo?: string;          // User ID ou variável {{trigger.user_id}}
  dueDate?: string;             // ISO date ou expressão: "+3 days", "+1 week"
  priority?: "low" | "medium" | "high";
  relatedEntityType?: WorkflowEntityType;
  relatedEntityId?: string;     // Variável: {{trigger.entity_id}}
}

/**
 * Configuração de ação de enviar notificação
 */
export interface SendNotificationActionConfig extends BaseActionConfig {
  type: "send_notification";
  userId: string;               // User ID ou variável
  title: string;
  message: string;
  link?: string;                // Link opcional para navegar
  icon?: string;
}

/**
 * Configuração de ação de atualizar campo
 */
export interface UpdateFieldActionConfig extends BaseActionConfig {
  type: "update_field";
  entityType: WorkflowEntityType;
  entityId: string;             // Variável: {{trigger.entity_id}}
  field: string;
  value: any;                   // Valor ou expressão: "{{lead.name}} - Updated"
  operation?: "set" | "increment" | "decrement" | "append";
}

/**
 * Configuração de ação de chamar webhook
 */
export interface WebhookActionConfig extends BaseActionConfig {
  type: "webhook";
  url: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: any;                   // Suporta variáveis
  timeout?: number;             // Timeout em ms
}

/**
 * Configuração de ação de atribuir usuário
 */
export interface AssignUserActionConfig extends BaseActionConfig {
  type: "assign_user";
  userId: string;               // User ID ou variável
  entityType: WorkflowEntityType;
  entityId: string;             // Variável: {{trigger.entity_id}}
}

/**
 * Configuração de ação de adicionar tag
 */
export interface AddTagActionConfig extends BaseActionConfig {
  type: "add_tag";
  tag: string;                  // Tag name ou variável
  entityType: WorkflowEntityType;
  entityId: string;
}

/**
 * Configuração de ação de mover stage
 */
export interface MoveStageActionConfig extends BaseActionConfig {
  type: "move_stage";
  toStage: string;              // Stage ID ou nome
  pipelineId?: string;
  entityId: string;             // Variável: {{trigger.entity_id}}
}

/**
 * União de todos os tipos de action config
 */
export type ActionConfig = 
  | SendEmailActionConfig
  | CreateTaskActionConfig
  | SendNotificationActionConfig
  | UpdateFieldActionConfig
  | WebhookActionConfig
  | AssignUserActionConfig
  | AddTagActionConfig
  | MoveStageActionConfig;

// =====================================================
// WORKFLOW
// =====================================================

/**
 * Workflow completo
 */
export interface Workflow {
  id: string;
  userId: string;
  
  // Informações básicas
  name: string;
  description?: string;
  
  // Configuração
  entityType: WorkflowEntityType;
  triggerType: TriggerType;
  triggerConfig: TriggerConfig;
  
  // Ações
  actions: ActionConfig[];
  
  // Estado
  isActive: boolean;
  lastExecutedAt?: string;
  executionCount: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

/**
 * Input para criar workflow
 */
export interface CreateWorkflowInput {
  name: string;
  description?: string;
  entityType: WorkflowEntityType;
  triggerType: TriggerType;
  triggerConfig: TriggerConfig;
  actions: ActionConfig[];
  isActive?: boolean;
}

/**
 * Input para atualizar workflow
 */
export interface UpdateWorkflowInput {
  name?: string;
  description?: string;
  triggerConfig?: TriggerConfig;
  actions?: ActionConfig[];
  isActive?: boolean;
}

// =====================================================
// WORKFLOW EXECUTION
// =====================================================

/**
 * Resultado de execução de uma ação
 */
export interface ActionExecutionResult {
  actionId?: string;
  actionType: ActionType;
  status: "success" | "failed" | "skipped";
  result?: any;
  error?: string;
  executionTimeMs?: number;
}

/**
 * Log de execução de workflow
 */
export interface WorkflowExecution {
  id: string;
  workflowId: string;
  
  // Contexto
  entityType: WorkflowEntityType;
  entityId: string;
  triggerData?: any;
  
  // Resultado
  status: ExecutionStatus;
  actionsExecuted: ActionExecutionResult[];
  errorMessage?: string;
  
  // Timing
  startedAt: string;
  completedAt?: string;
  executionTimeMs?: number;
  
  // Metadata
  createdAt: string;
}

/**
 * Input para executar workflow manualmente
 */
export interface ExecuteWorkflowInput {
  workflowId: string;
  entityId: string;
  triggerData?: any;
}

// =====================================================
// WORKFLOW TRIGGER (scheduled)
// =====================================================

/**
 * Schedule configuration
 */
export interface ScheduleConfig {
  type: ScheduleType;
  cronExpression?: string;
  intervalMinutes?: number;
  executeAt?: string;
}

/**
 * Trigger agendado
 */
export interface WorkflowTrigger {
  id: string;
  workflowId: string;
  
  // Schedule
  scheduleType: ScheduleType;
  scheduleConfig: ScheduleConfig;
  
  // Estado
  isActive: boolean;
  lastTriggeredAt?: string;
  nextTriggerAt?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// =====================================================
// WORKFLOW STATISTICS
// =====================================================

/**
 * Estatísticas de um workflow
 */
export interface WorkflowStats {
  workflowId: string;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  averageExecutionTimeMs: number;
  lastExecution?: WorkflowExecution;
  successRate: number;
}

/**
 * Estatísticas gerais de workflows
 */
export interface WorkflowsOverview {
  totalWorkflows: number;
  activeWorkflows: number;
  inactiveWorkflows: number;
  totalExecutionsToday: number;
  totalExecutionsThisWeek: number;
  totalExecutionsThisMonth: number;
  mostUsedWorkflows: Array<{
    workflow: Workflow;
    executionCount: number;
  }>;
}

// =====================================================
// HELPERS & UTILITIES
// =====================================================

/**
 * Template de workflow pré-configurado
 */
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: "sales" | "marketing" | "support" | "operations";
  entityType: WorkflowEntityType;
  triggerType: TriggerType;
  triggerConfig: TriggerConfig;
  actions: ActionConfig[];
  icon?: string;
  tags?: string[];
}

/**
 * Opções de variáveis disponíveis para interpolação
 */
export interface VariableOption {
  key: string;                  // Ex: "lead.name"
  label: string;                // Ex: "Nome do Lead"
  type: "string" | "number" | "boolean" | "date" | "email" | "url";
  example?: string;
}

/**
 * Contexto disponível para interpolação de variáveis
 */
export interface WorkflowContext {
  trigger: {
    entity_id: string;
    entity_type: WorkflowEntityType;
    user_id: string;
    timestamp: string;
    [key: string]: any;
  };
  entity: Record<string, any>;  // Dados da entidade que acionou
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

/**
 * Validação de workflow
 */
export interface WorkflowValidation {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
  warnings: Array<{
    field: string;
    message: string;
  }>;
}

// =====================================================
// CONSTANTS
// =====================================================

/**
 * Templates de workflow pré-configurados
 */
export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: "welcome-email",
    name: "Email de Boas-vindas",
    description: "Envia email automático quando novo lead é criado",
    category: "sales",
    entityType: "lead",
    triggerType: "field_change",
    triggerConfig: {
      type: "field_change",
      field: "status",
      toValue: "new",
      operator: "equals",
    },
    actions: [
      {
        type: "send_email",
        to: "{{lead.email}}",
        subject: "Bem-vindo(a) à {{company.name}}!",
        body: "<p>Olá {{lead.name}},</p><p>Obrigado pelo seu interesse...</p>",
      },
    ],
    icon: "Mail",
    tags: ["email", "leads", "onboarding"],
  },
  {
    id: "follow-up-task",
    name: "Criar Tarefa de Follow-up",
    description: "Cria tarefa automática 3 dias após lead entrar em contato",
    category: "sales",
    entityType: "lead",
    triggerType: "stage_change",
    triggerConfig: {
      type: "stage_change",
      toStage: "contacted",
    },
    actions: [
      {
        type: "create_task",
        title: "Follow-up com {{lead.name}}",
        description: "Entrar em contato para acompanhamento",
        dueDate: "+3 days",
        priority: "medium",
        assignedTo: "{{trigger.user_id}}",
      },
    ],
    icon: "CheckSquare",
    tags: ["task", "follow-up", "sales"],
  },
  {
    id: "deal-won-notification",
    name: "Notificação de Deal Ganho",
    description: "Notifica equipe quando deal é ganho",
    category: "sales",
    entityType: "deal",
    triggerType: "stage_change",
    triggerConfig: {
      type: "stage_change",
      toStage: "won",
    },
    actions: [
      {
        type: "send_notification",
        userId: "{{deal.assigned_to}}",
        title: "🎉 Deal Ganho!",
        message: "Parabéns! O deal {{deal.title}} foi ganho!",
        icon: "trophy",
      },
      {
        type: "send_email",
        to: "team@company.com",
        subject: "Novo Deal Ganho: {{deal.title}}",
        body: "<p>O deal {{deal.title}} no valor de {{deal.value}} foi ganho!</p>",
      },
    ],
    icon: "Trophy",
    tags: ["notification", "deal", "celebration"],
  },
  {
    id: "inactive-lead-reminder",
    name: "Lembrete de Lead Inativo",
    description: "Cria tarefa para leads sem atividade há 7 dias",
    category: "sales",
    entityType: "lead",
    triggerType: "time_based",
    triggerConfig: {
      type: "time_based",
      scheduleType: "cron",
      cronExpression: "0 9 * * *", // Todo dia às 9h
      conditions: [
        {
          field: "last_activity_at",
          operator: "less_than",
          value: "-7 days",
        },
        {
          field: "status",
          operator: "not_equals",
          value: "won",
        },
      ],
    },
    actions: [
      {
        type: "create_task",
        title: "Reengajar lead inativo: {{lead.name}}",
        description: "Lead sem atividade há mais de 7 dias",
        priority: "high",
        dueDate: "+1 day",
        assignedTo: "{{lead.assigned_to}}",
      },
    ],
    icon: "Clock",
    tags: ["automation", "reminder", "engagement"],
  },
];

/**
 * Variáveis disponíveis por tipo de entidade
 */
export const ENTITY_VARIABLES: Record<WorkflowEntityType, VariableOption[]> = {
  lead: [
    { key: "lead.id", label: "ID do Lead", type: "string" },
    { key: "lead.name", label: "Nome", type: "string", example: "João Silva" },
    { key: "lead.email", label: "Email", type: "email", example: "joao@empresa.com" },
    { key: "lead.phone", label: "Telefone", type: "string", example: "(11) 99999-9999" },
    { key: "lead.company_name", label: "Empresa", type: "string", example: "Empresa ABC" },
    { key: "lead.status", label: "Status", type: "string", example: "new" },
    { key: "lead.created_at", label: "Data de Criação", type: "date" },
  ],
  company: [
    { key: "company.id", label: "ID da Empresa", type: "string" },
    { key: "company.name", label: "Nome", type: "string", example: "Empresa ABC" },
    { key: "company.website", label: "Website", type: "url", example: "https://empresa.com" },
    { key: "company.industry", label: "Setor", type: "string", example: "Tecnologia" },
    { key: "company.employees", label: "Funcionários", type: "number", example: "150" },
    { key: "company.created_at", label: "Data de Criação", type: "date" },
  ],
  deal: [
    { key: "deal.id", label: "ID do Deal", type: "string" },
    { key: "deal.title", label: "Título", type: "string", example: "Proposta ABC" },
    { key: "deal.value", label: "Valor", type: "number", example: "15000" },
    { key: "deal.stage", label: "Stage", type: "string", example: "proposal" },
    { key: "deal.probability", label: "Probabilidade", type: "number", example: "75" },
    { key: "deal.expected_close_date", label: "Data de Fechamento", type: "date" },
    { key: "deal.created_at", label: "Data de Criação", type: "date" },
  ],
  task: [
    { key: "task.id", label: "ID da Tarefa", type: "string" },
    { key: "task.title", label: "Título", type: "string", example: "Ligar para cliente" },
    { key: "task.description", label: "Descrição", type: "string" },
    { key: "task.status", label: "Status", type: "string", example: "pending" },
    { key: "task.priority", label: "Prioridade", type: "string", example: "high" },
    { key: "task.due_date", label: "Data de Vencimento", type: "date" },
  ],
  meeting: [
    { key: "meeting.id", label: "ID da Reunião", type: "string" },
    { key: "meeting.title", label: "Título", type: "string", example: "Reunião de alinhamento" },
    { key: "meeting.start_time", label: "Horário de Início", type: "date" },
    { key: "meeting.end_time", label: "Horário de Fim", type: "date" },
    { key: "meeting.location", label: "Local", type: "string", example: "Sala 1" },
    { key: "meeting.status", label: "Status", type: "string", example: "scheduled" },
  ],
};

/**
 * Helper: Interpolar variáveis em texto
 */
export const interpolateVariables = (
  text: string,
  context: WorkflowContext
): string => {
  return text.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const keys = path.trim().split(".");
    let value: any = context;

    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = value[key];
      } else {
        return match; // Manter original se não encontrar
      }
    }

    return String(value ?? match);
  });
};

/**
 * Helper: Validar workflow
 */
export const validateWorkflow = (workflow: Partial<Workflow>): WorkflowValidation => {
  const errors: WorkflowValidation["errors"] = [];
  const warnings: WorkflowValidation["warnings"] = [];

  // Validações obrigatórias
  if (!workflow.name || workflow.name.trim().length === 0) {
    errors.push({ field: "name", message: "Nome é obrigatório" });
  }

  if (!workflow.entityType) {
    errors.push({ field: "entityType", message: "Tipo de entidade é obrigatório" });
  }

  if (!workflow.triggerType) {
    errors.push({ field: "triggerType", message: "Tipo de trigger é obrigatório" });
  }

  if (!workflow.actions || workflow.actions.length === 0) {
    errors.push({ field: "actions", message: "Pelo menos uma ação é obrigatória" });
  }

  // Validações de trigger config
  if (workflow.triggerConfig) {
    if (workflow.triggerType === "time_based") {
      const config = workflow.triggerConfig as TimeBasedTriggerConfig;
      if (!config.scheduleType) {
        errors.push({ field: "triggerConfig.scheduleType", message: "Tipo de schedule é obrigatório" });
      }
      if (config.scheduleType === "cron" && !config.cronExpression) {
        errors.push({ field: "triggerConfig.cronExpression", message: "Expressão cron é obrigatória" });
      }
      if (config.scheduleType === "interval" && !config.intervalMinutes) {
        errors.push({ field: "triggerConfig.intervalMinutes", message: "Intervalo em minutos é obrigatório" });
      }
    }
  }

  // Avisos
  if (workflow.actions && workflow.actions.length > 10) {
    warnings.push({
      field: "actions",
      message: "Muitas ações podem impactar a performance. Considere dividir em múltiplos workflows.",
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Helper: Gerar nome de arquivo para export
 */
export const generateWorkflowExportFilename = (workflow: Workflow): string => {
  const date = new Date().toISOString().split("T")[0];
  const safeName = workflow.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return `workflow-${safeName}-${date}.json`;
};
