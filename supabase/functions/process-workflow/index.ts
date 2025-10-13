// FASE 9: Process Workflow Edge Function
// Executa workflows e suas ações

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WorkflowExecutionRequest {
  workflowId: string;
  entityId: string;
  triggerData?: any;
  manual?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get request body
    const { workflowId, entityId, triggerData, manual }: WorkflowExecutionRequest =
      await req.json();

    console.log(`Processing workflow ${workflowId} for entity ${entityId}`);

    // Get workflow
    const { data: workflow, error: workflowError } = await supabase
      .from("workflows")
      .select("*")
      .eq("id", workflowId)
      .single();

    if (workflowError || !workflow) {
      throw new Error("Workflow not found");
    }

    // Check if workflow is active
    if (!workflow.is_active && !manual) {
      console.log("Workflow is not active, skipping");
      return new Response(
        JSON.stringify({ message: "Workflow is not active" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Create execution record
    const executionStartTime = Date.now();
    const { data: execution, error: executionError } = await supabase
      .from("workflow_executions")
      .insert({
        workflow_id: workflowId,
        entity_type: workflow.entity_type,
        entity_id: entityId,
        trigger_data: triggerData || {},
        status: "running",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (executionError) {
      throw executionError;
    }

    console.log(`Created execution ${execution.id}`);

    // Get entity data for context
    const { data: entity } = await supabase
      .from(workflow.entity_type === "lead" ? "leads" : workflow.entity_type + "s")
      .select("*")
      .eq("id", entityId)
      .single();

    // Build context for variable interpolation
    const context = {
      trigger: {
        entity_id: entityId,
        entity_type: workflow.entity_type,
        user_id: workflow.user_id,
        timestamp: new Date().toISOString(),
        ...triggerData,
      },
      entity: entity || {},
      [workflow.entity_type]: entity || {},
    };

    // Execute actions
    const actionsExecuted = [];
    let hasError = false;
    let errorMessage = "";

    for (const action of workflow.actions) {
      try {
        console.log(`Executing action: ${action.type}`);
        const actionResult = await executeAction(action, context, supabase);
        actionsExecuted.push({
          actionId: action.id,
          actionType: action.type,
          status: "success",
          result: actionResult,
        });
      } catch (error: any) {
        console.error(`Action ${action.type} failed:`, error);
        actionsExecuted.push({
          actionId: action.id,
          actionType: action.type,
          status: "failed",
          error: error.message,
        });
        hasError = true;
        errorMessage = error.message;
        // Continue to next action even if one fails
      }
    }

    // Update execution status
    const executionEndTime = Date.now();
    const { error: updateError } = await supabase
      .from("workflow_executions")
      .update({
        status: hasError ? "failed" : "completed",
        actions_executed: actionsExecuted,
        error_message: errorMessage || null,
        completed_at: new Date().toISOString(),
        execution_time_ms: executionEndTime - executionStartTime,
      })
      .eq("id", execution.id);

    if (updateError) {
      console.error("Error updating execution:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        executionId: execution.id,
        actionsExecuted,
        hasError,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Workflow execution error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// Helper function to execute individual actions
async function executeAction(action: any, context: any, supabase: any) {
  switch (action.type) {
    case "send_email":
      return await executeSendEmail(action, context);

    case "create_task":
      return await executeCreateTask(action, context, supabase);

    case "send_notification":
      return await executeSendNotification(action, context, supabase);

    case "update_field":
      return await executeUpdateField(action, context, supabase);

    case "webhook":
      return await executeWebhook(action, context);

    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

// Action executors

async function executeSendEmail(action: any, context: any) {
  // TODO: Implement email sending via Resend or similar
  // For now, just log
  console.log("Send email action:", {
    to: interpolate(action.to, context),
    subject: interpolate(action.subject, context),
    body: interpolate(action.body, context),
  });

  return { message: "Email queued (not implemented yet)" };
}

async function executeCreateTask(action: any, context: any, supabase: any) {
  const taskData = {
    user_id: context.trigger.user_id,
    title: interpolate(action.title, context),
    description: interpolate(action.description, context),
    status: "pending",
    priority: action.priority || "medium",
    due_date: parseDueDate(action.dueDate),
    related_entity_type: context.trigger.entity_type,
    related_entity_id: context.trigger.entity_id,
  };

  const { data, error } = await supabase
    .from("tasks")
    .insert(taskData)
    .select()
    .single();

  if (error) throw error;

  return { taskId: data.id };
}

async function executeSendNotification(action: any, context: any, supabase: any) {
  // TODO: Implement in-app notifications
  // For now, just log
  console.log("Send notification action:", {
    userId: interpolate(action.userId, context),
    title: interpolate(action.title, context),
    message: interpolate(action.message, context),
  });

  return { message: "Notification sent (not implemented yet)" };
}

async function executeUpdateField(action: any, context: any, supabase: any) {
  const entityType = action.entityType || context.trigger.entity_type;
  const entityId = interpolate(action.entityId, context);
  const field = action.field;
  const value = interpolate(action.value, context);

  const tableName = entityType === "lead" ? "leads" : `${entityType}s`;

  const { error } = await supabase
    .from(tableName)
    .update({ [field]: value })
    .eq("id", entityId);

  if (error) throw error;

  return { updated: true, field, value };
}

async function executeWebhook(action: any, context: any) {
  const url = interpolate(action.url, context);
  const body = JSON.stringify(interpolateObject(action.body, context));

  const response = await fetch(url, {
    method: action.method || "POST",
    headers: {
      "Content-Type": "application/json",
      ...action.headers,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Webhook failed with status ${response.status}`);
  }

  return { status: response.status };
}

// Helper functions

function interpolate(text: string, context: any): string {
  if (typeof text !== "string") return text;

  return text.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    const keys = path.trim().split(".");
    let value: any = context;

    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = value[key];
      } else {
        return match;
      }
    }

    return String(value ?? match);
  });
}

function interpolateObject(obj: any, context: any): any {
  if (typeof obj === "string") {
    return interpolate(obj, context);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => interpolateObject(item, context));
  }

  if (obj && typeof obj === "object") {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = interpolateObject(value, context);
    }
    return result;
  }

  return obj;
}

function parseDueDate(dueDate: string): string | null {
  if (!dueDate) return null;

  // Parse relative dates like "+3 days", "+1 week"
  const match = dueDate.match(/^\+(\d+)\s*(day|week|month)s?$/i);
  if (match) {
    const amount = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    const now = new Date();

    switch (unit) {
      case "day":
        now.setDate(now.getDate() + amount);
        break;
      case "week":
        now.setDate(now.getDate() + amount * 7);
        break;
      case "month":
        now.setMonth(now.getMonth() + amount);
        break;
    }

    return now.toISOString();
  }

  // Try parsing as ISO date
  try {
    return new Date(dueDate).toISOString();
  } catch {
    return null;
  }
}
