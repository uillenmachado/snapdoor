-- FASE 9: Automação & Workflows
-- Migration para sistema de automações e workflows

-- =====================================================
-- WORKFLOWS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Informações básicas
  name TEXT NOT NULL,
  description TEXT,
  
  -- Configuração
  entity_type TEXT NOT NULL CHECK (entity_type IN ('lead', 'company', 'deal', 'task', 'meeting')),
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('stage_change', 'field_change', 'time_based', 'manual', 'webhook')),
  trigger_config JSONB NOT NULL DEFAULT '{}',
  
  -- Ações a executar
  actions JSONB NOT NULL DEFAULT '[]',
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  last_executed_at TIMESTAMPTZ,
  execution_count INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT workflows_name_user_unique UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_entity_type ON workflows(entity_type);
CREATE INDEX IF NOT EXISTS idx_workflows_trigger_type ON workflows(trigger_type);
CREATE INDEX IF NOT EXISTS idx_workflows_is_active ON workflows(is_active);

-- =====================================================
-- WORKFLOW EXECUTIONS LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE NOT NULL,
  
  -- Contexto da execução
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  trigger_data JSONB,
  
  -- Resultado
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  actions_executed JSONB DEFAULT '[]',
  error_message TEXT,
  
  -- Timing
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  execution_time_ms INTEGER,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_entity ON workflow_executions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_created_at ON workflow_executions(created_at DESC);

-- =====================================================
-- WORKFLOW TRIGGERS (scheduled tasks)
-- =====================================================
CREATE TABLE IF NOT EXISTS workflow_triggers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE NOT NULL,
  
  -- Schedule configuration
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('cron', 'interval', 'once')),
  schedule_config JSONB NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  next_trigger_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_workflow_triggers_workflow_id ON workflow_triggers(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_triggers_next_trigger ON workflow_triggers(next_trigger_at) WHERE is_active = true;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Workflows policies
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workflows"
  ON workflows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflows"
  ON workflows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflows"
  ON workflows FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflows"
  ON workflows FOR DELETE
  USING (auth.uid() = user_id);

-- Workflow executions policies
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view executions of their workflows"
  ON workflow_executions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workflows
      WHERE workflows.id = workflow_executions.workflow_id
      AND workflows.user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert executions"
  ON workflow_executions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update executions"
  ON workflow_executions FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Workflow triggers policies
ALTER TABLE workflow_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view triggers of their workflows"
  ON workflow_triggers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workflows
      WHERE workflows.id = workflow_triggers.workflow_id
      AND workflows.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage triggers of their workflows"
  ON workflow_triggers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workflows
      WHERE workflows.id = workflow_triggers.workflow_id
      AND workflows.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workflows
      WHERE workflows.id = workflow_triggers.workflow_id
      AND workflows.user_id = auth.uid()
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_workflows_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for workflows updated_at
CREATE TRIGGER workflows_updated_at_trigger
  BEFORE UPDATE ON workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_workflows_updated_at();

-- Function to calculate execution time
CREATE OR REPLACE FUNCTION calculate_execution_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    NEW.execution_time_ms = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) * 1000;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for workflow_executions timing
CREATE TRIGGER workflow_executions_timing_trigger
  BEFORE UPDATE ON workflow_executions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_execution_time();

-- Function to increment workflow execution count
CREATE OR REPLACE FUNCTION increment_workflow_execution_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE workflows
    SET 
      execution_count = execution_count + 1,
      last_executed_at = NEW.completed_at
    WHERE id = NEW.workflow_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update workflow stats
CREATE TRIGGER workflow_execution_stats_trigger
  AFTER UPDATE ON workflow_executions
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION increment_workflow_execution_count();

-- =====================================================
-- SAMPLE DATA (for testing)
-- =====================================================

-- Note: Sample data will be added via application
-- This migration only creates the schema

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE workflows IS 'Workflow automation definitions';
COMMENT ON TABLE workflow_executions IS 'Log of workflow executions with results';
COMMENT ON TABLE workflow_triggers IS 'Scheduled triggers for time-based workflows';

COMMENT ON COLUMN workflows.trigger_type IS 'Type of trigger: stage_change, field_change, time_based, manual, webhook';
COMMENT ON COLUMN workflows.trigger_config IS 'JSON config for trigger (e.g., which field to watch, cron schedule)';
COMMENT ON COLUMN workflows.actions IS 'Array of actions to execute (send_email, create_task, update_field, send_notification)';

COMMENT ON COLUMN workflow_executions.status IS 'Execution status: pending, running, completed, failed, skipped';
COMMENT ON COLUMN workflow_executions.actions_executed IS 'Array of executed actions with results';
COMMENT ON COLUMN workflow_executions.execution_time_ms IS 'Execution time in milliseconds (auto-calculated)';

COMMENT ON COLUMN workflow_triggers.schedule_type IS 'Type of schedule: cron (cron expression), interval (every X minutes), once (specific datetime)';
COMMENT ON COLUMN workflow_triggers.schedule_config IS 'JSON config for schedule (e.g., {cron: "0 9 * * 1"} or {interval_minutes: 60})';
