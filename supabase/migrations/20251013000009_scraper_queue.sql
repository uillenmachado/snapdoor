-- =====================================================
-- MIGRATION: Scraper Queue System
-- Description: Advanced queue system for LinkedIn scraping with
--              detailed logging, retry logic, and rate limiting
-- Author: AI Assistant
-- Date: 2025-10-13
-- =====================================================

-- =====================================================
-- 1. SCRAPER QUEUE TABLE
-- =====================================================

CREATE TABLE scraper_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Job identification
  job_type TEXT NOT NULL CHECK (job_type IN ('profile', 'company', 'search', 'bulk')),
  priority INTEGER DEFAULT 0, -- Higher = more priority
  
  -- Target information
  linkedin_url TEXT NOT NULL,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  
  -- User & Team
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Status tracking
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',    -- Waiting to be processed
    'processing', -- Currently being processed
    'completed',  -- Successfully completed
    'failed',     -- Failed (will retry if attempts < max)
    'cancelled',  -- Manually cancelled
    'expired'     -- Expired (too old)
  )),
  
  -- Retry logic
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT,
  
  -- Results
  result JSONB, -- Scraped data
  
  -- Rate limiting
  scheduled_at TIMESTAMPTZ DEFAULT NOW(), -- When to process (for rate limiting)
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Webhooks
  webhook_url TEXT,
  webhook_delivered BOOLEAN DEFAULT false,
  webhook_delivered_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_scraper_queue_status ON scraper_queue(status);
CREATE INDEX idx_scraper_queue_user_id ON scraper_queue(user_id);
CREATE INDEX idx_scraper_queue_team_id ON scraper_queue(team_id);
CREATE INDEX idx_scraper_queue_scheduled_at ON scraper_queue(scheduled_at);
CREATE INDEX idx_scraper_queue_priority ON scraper_queue(priority DESC);
CREATE INDEX idx_scraper_queue_lead_id ON scraper_queue(lead_id);
CREATE INDEX idx_scraper_queue_company_id ON scraper_queue(company_id);

-- Composite index for queue processing
CREATE INDEX idx_scraper_queue_processing ON scraper_queue(status, priority DESC, scheduled_at);

-- =====================================================
-- 2. SCRAPER LOGS TABLE
-- =====================================================

CREATE TABLE scraper_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Reference to job
  job_id UUID REFERENCES scraper_queue(id) ON DELETE CASCADE NOT NULL,
  
  -- Log details
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warning', 'error')),
  message TEXT NOT NULL,
  
  -- Additional context
  details JSONB,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_scraper_logs_job_id ON scraper_logs(job_id);
CREATE INDEX idx_scraper_logs_level ON scraper_logs(level);
CREATE INDEX idx_scraper_logs_created_at ON scraper_logs(created_at DESC);

-- =====================================================
-- 3. SCRAPER STATS TABLE (for analytics)
-- =====================================================

CREATE TABLE scraper_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Time period
  date DATE NOT NULL,
  hour INTEGER CHECK (hour >= 0 AND hour < 24),
  
  -- User/Team
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  
  -- Metrics
  jobs_total INTEGER DEFAULT 0,
  jobs_completed INTEGER DEFAULT 0,
  jobs_failed INTEGER DEFAULT 0,
  jobs_cancelled INTEGER DEFAULT 0,
  
  -- Performance
  avg_duration_seconds NUMERIC(10, 2),
  total_credits_used INTEGER DEFAULT 0,
  
  -- Rate limiting
  rate_limit_hits INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint for aggregation
  UNIQUE(date, hour, user_id, team_id)
);

-- Indexes
CREATE INDEX idx_scraper_stats_date ON scraper_stats(date DESC);
CREATE INDEX idx_scraper_stats_user_id ON scraper_stats(user_id);
CREATE INDEX idx_scraper_stats_team_id ON scraper_stats(team_id);

-- =====================================================
-- 4. RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE scraper_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraper_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraper_stats ENABLE ROW LEVEL SECURITY;

-- scraper_queue policies
CREATE POLICY "Users can view own jobs" ON scraper_queue
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own jobs" ON scraper_queue
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own jobs" ON scraper_queue
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own jobs" ON scraper_queue
  FOR DELETE
  USING (user_id = auth.uid());

-- scraper_logs policies (read-only for users, system writes)
CREATE POLICY "Users can view logs for their jobs" ON scraper_logs
  FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM scraper_queue WHERE user_id = auth.uid()
    )
  );

-- scraper_stats policies
CREATE POLICY "Users can view own stats" ON scraper_stats
  FOR SELECT
  USING (user_id = auth.uid());

-- =====================================================
-- 5. FUNCTIONS
-- =====================================================

-- Function to get next job from queue
CREATE OR REPLACE FUNCTION get_next_scraper_job()
RETURNS TABLE (
  job_id UUID,
  job_type TEXT,
  linkedin_url TEXT,
  lead_id UUID,
  company_id UUID,
  user_id UUID,
  team_id UUID,
  attempts INTEGER,
  metadata JSONB
) AS $$
BEGIN
  -- Get next job with SKIP LOCKED for concurrency
  RETURN QUERY
  SELECT 
    sq.id,
    sq.job_type,
    sq.linkedin_url,
    sq.lead_id,
    sq.company_id,
    sq.user_id,
    sq.team_id,
    sq.attempts,
    sq.metadata
  FROM scraper_queue sq
  WHERE sq.status = 'pending'
    AND sq.scheduled_at <= NOW()
    AND sq.attempts < sq.max_attempts
  ORDER BY sq.priority DESC, sq.scheduled_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark job as processing
CREATE OR REPLACE FUNCTION mark_job_processing(p_job_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE scraper_queue
  SET 
    status = 'processing',
    started_at = NOW(),
    updated_at = NOW()
  WHERE id = p_job_id
    AND status = 'pending';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark job as completed
CREATE OR REPLACE FUNCTION mark_job_completed(
  p_job_id UUID,
  p_result JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE scraper_queue
  SET 
    status = 'completed',
    result = p_result,
    completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_job_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark job as failed (with retry logic)
CREATE OR REPLACE FUNCTION mark_job_failed(
  p_job_id UUID,
  p_error TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_attempts INTEGER;
  v_max_attempts INTEGER;
  v_new_status TEXT;
  v_next_scheduled TIMESTAMPTZ;
BEGIN
  -- Get current attempts
  SELECT attempts, max_attempts 
  INTO v_attempts, v_max_attempts
  FROM scraper_queue
  WHERE id = p_job_id;
  
  -- Increment attempts
  v_attempts := v_attempts + 1;
  
  -- Determine new status
  IF v_attempts >= v_max_attempts THEN
    v_new_status := 'failed';
    v_next_scheduled := NULL;
  ELSE
    v_new_status := 'pending';
    -- Exponential backoff: 2^attempts minutes
    v_next_scheduled := NOW() + (POWER(2, v_attempts) || ' minutes')::INTERVAL;
  END IF;
  
  -- Update job
  UPDATE scraper_queue
  SET 
    status = v_new_status,
    attempts = v_attempts,
    last_error = p_error,
    scheduled_at = COALESCE(v_next_scheduled, scheduled_at),
    updated_at = NOW()
  WHERE id = p_job_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add log entry
CREATE OR REPLACE FUNCTION add_scraper_log(
  p_job_id UUID,
  p_level TEXT,
  p_message TEXT,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO scraper_logs (job_id, level, message, details)
  VALUES (p_job_id, p_level, p_message, p_details)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update stats
CREATE OR REPLACE FUNCTION update_scraper_stats(
  p_user_id UUID,
  p_team_id UUID,
  p_status TEXT,
  p_duration_seconds NUMERIC DEFAULT NULL,
  p_credits_used INTEGER DEFAULT 0
)
RETURNS VOID AS $$
DECLARE
  v_date DATE := CURRENT_DATE;
  v_hour INTEGER := EXTRACT(HOUR FROM NOW());
BEGIN
  -- Upsert stats
  INSERT INTO scraper_stats (
    date, 
    hour, 
    user_id, 
    team_id,
    jobs_total,
    jobs_completed,
    jobs_failed,
    jobs_cancelled,
    avg_duration_seconds,
    total_credits_used
  )
  VALUES (
    v_date,
    v_hour,
    p_user_id,
    p_team_id,
    1, -- jobs_total
    CASE WHEN p_status = 'completed' THEN 1 ELSE 0 END,
    CASE WHEN p_status = 'failed' THEN 1 ELSE 0 END,
    CASE WHEN p_status = 'cancelled' THEN 1 ELSE 0 END,
    p_duration_seconds,
    p_credits_used
  )
  ON CONFLICT (date, hour, user_id, team_id)
  DO UPDATE SET
    jobs_total = scraper_stats.jobs_total + 1,
    jobs_completed = scraper_stats.jobs_completed + 
      CASE WHEN p_status = 'completed' THEN 1 ELSE 0 END,
    jobs_failed = scraper_stats.jobs_failed + 
      CASE WHEN p_status = 'failed' THEN 1 ELSE 0 END,
    jobs_cancelled = scraper_stats.jobs_cancelled + 
      CASE WHEN p_status = 'cancelled' THEN 1 ELSE 0 END,
    avg_duration_seconds = 
      CASE 
        WHEN p_duration_seconds IS NOT NULL THEN
          (COALESCE(scraper_stats.avg_duration_seconds, 0) * scraper_stats.jobs_total + p_duration_seconds) / 
          (scraper_stats.jobs_total + 1)
        ELSE scraper_stats.avg_duration_seconds
      END,
    total_credits_used = scraper_stats.total_credits_used + p_credits_used,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10, -- 10 jobs per minute
  p_window_minutes INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Count jobs created in last N minutes
  SELECT COUNT(*)
  INTO v_count
  FROM scraper_queue
  WHERE user_id = p_user_id
    AND created_at > NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  
  RETURN v_count < p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. TRIGGERS
-- =====================================================

-- Trigger to update updated_at on scraper_queue
CREATE OR REPLACE FUNCTION update_scraper_queue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_scraper_queue_updated_at
  BEFORE UPDATE ON scraper_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_scraper_queue_updated_at();

-- Trigger to auto-set team_id from user
CREATE OR REPLACE FUNCTION set_scraper_queue_team_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.team_id IS NULL AND NEW.user_id IS NOT NULL THEN
    NEW.team_id := (
      SELECT t.id 
      FROM teams t
      INNER JOIN team_members tm ON t.id = tm.team_id
      WHERE tm.user_id = NEW.user_id
      LIMIT 1
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_scraper_queue_team_id
  BEFORE INSERT ON scraper_queue
  FOR EACH ROW
  EXECUTE FUNCTION set_scraper_queue_team_id();

-- Trigger to update stats when job completes/fails
CREATE OR REPLACE FUNCTION trigger_update_scraper_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_duration NUMERIC;
BEGIN
  -- Only update stats on status change to terminal state
  IF NEW.status IN ('completed', 'failed', 'cancelled') AND
     OLD.status != NEW.status THEN
    
    -- Calculate duration if job was started
    IF NEW.started_at IS NOT NULL AND NEW.updated_at IS NOT NULL THEN
      v_duration := EXTRACT(EPOCH FROM (NEW.updated_at - NEW.started_at));
    END IF;
    
    -- Update stats
    PERFORM update_scraper_stats(
      NEW.user_id,
      NEW.team_id,
      NEW.status,
      v_duration,
      1 -- credits_used (todo: get from result)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_scraper_stats
  AFTER UPDATE ON scraper_queue
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_scraper_stats();

-- =====================================================
-- 7. VIEWS FOR MONITORING
-- =====================================================

-- View for queue dashboard
CREATE OR REPLACE VIEW scraper_queue_dashboard AS
SELECT 
  u.id as user_id,
  u.email as user_email,
  COUNT(*) FILTER (WHERE sq.status = 'pending') as pending_jobs,
  COUNT(*) FILTER (WHERE sq.status = 'processing') as processing_jobs,
  COUNT(*) FILTER (WHERE sq.status = 'completed') as completed_jobs,
  COUNT(*) FILTER (WHERE sq.status = 'failed') as failed_jobs,
  COUNT(*) FILTER (WHERE sq.status = 'cancelled') as cancelled_jobs,
  AVG(EXTRACT(EPOCH FROM (sq.completed_at - sq.started_at))) 
    FILTER (WHERE sq.status = 'completed' AND sq.started_at IS NOT NULL) as avg_duration_seconds,
  MAX(sq.created_at) as last_job_at
FROM profiles u
LEFT JOIN scraper_queue sq ON u.id = sq.user_id
GROUP BY u.id, u.email;

COMMENT ON VIEW scraper_queue_dashboard IS 'Real-time dashboard of scraper queue per user';

-- View for recent jobs
CREATE OR REPLACE VIEW scraper_recent_jobs AS
SELECT 
  sq.id,
  sq.job_type,
  sq.status,
  sq.linkedin_url,
  sq.attempts,
  sq.max_attempts,
  sq.last_error,
  sq.created_at,
  sq.started_at,
  sq.completed_at,
  sq.user_id,
  u.email as user_email,
  u.full_name as user_name,
  l.id as lead_id,
  l.full_name as lead_name,
  c.id as company_id,
  c.name as company_name
FROM scraper_queue sq
INNER JOIN profiles u ON sq.user_id = u.id
LEFT JOIN leads l ON sq.lead_id = l.id
LEFT JOIN companies c ON sq.company_id = c.id
ORDER BY sq.created_at DESC
LIMIT 100;

COMMENT ON VIEW scraper_recent_jobs IS 'Recent 100 scraper jobs with related data';

-- =====================================================
-- 8. COMMENTS
-- =====================================================

COMMENT ON TABLE scraper_queue IS 'Queue system for LinkedIn scraping jobs';
COMMENT ON TABLE scraper_logs IS 'Detailed logs for scraper jobs';
COMMENT ON TABLE scraper_stats IS 'Aggregated statistics for scraper performance';

COMMENT ON COLUMN scraper_queue.priority IS 'Higher priority jobs are processed first';
COMMENT ON COLUMN scraper_queue.scheduled_at IS 'When the job should be processed (for rate limiting and retries)';
COMMENT ON COLUMN scraper_queue.attempts IS 'Number of processing attempts';
COMMENT ON COLUMN scraper_queue.max_attempts IS 'Maximum retry attempts before marking as failed';
COMMENT ON COLUMN scraper_queue.webhook_url IS 'URL to call when job completes';

COMMENT ON FUNCTION get_next_scraper_job IS 'Get next job from queue (SKIP LOCKED for concurrency)';
COMMENT ON FUNCTION mark_job_processing IS 'Mark job as being processed';
COMMENT ON FUNCTION mark_job_completed IS 'Mark job as successfully completed';
COMMENT ON FUNCTION mark_job_failed IS 'Mark job as failed with exponential backoff retry';
COMMENT ON FUNCTION add_scraper_log IS 'Add log entry for a job';
COMMENT ON FUNCTION update_scraper_stats IS 'Update aggregated statistics';
COMMENT ON FUNCTION check_rate_limit IS 'Check if user is within rate limit';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Summary:
-- - 3 tables: scraper_queue, scraper_logs, scraper_stats
-- - 7 functions for queue management
-- - 3 triggers for automation
-- - 2 views for monitoring
-- - RLS policies for security
-- - Indexes for performance
-- - Rate limiting support
-- - Retry logic with exponential backoff
-- - Webhook support
-- - Detailed logging
-- =====================================================
