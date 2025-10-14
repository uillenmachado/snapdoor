-- =====================================================
-- MIGRATION: Team Visibility & RLS Policies Update
-- Description: Add team_id and visibility columns to existing tables
--              Update RLS policies to respect team visibility settings
-- Author: AI Assistant
-- Date: 2025-10-13
-- =====================================================

-- =====================================================
-- 1. ADD COLUMNS TO EXISTING TABLES
-- =====================================================

-- Add team_id and visibility to leads table
ALTER TABLE leads 
  ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'own' CHECK (visibility IN ('own', 'team', 'all'));

-- Add team_id and visibility to deals table
ALTER TABLE deals 
  ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'own' CHECK (visibility IN ('own', 'team', 'all'));

-- Add team_id and visibility to activities table
ALTER TABLE activities 
  ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'own' CHECK (visibility IN ('own', 'team', 'all'));

-- Add team_id and visibility to tasks table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
    ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'own' CHECK (visibility IN ('own', 'team', 'all'));
  END IF;
END $$;

-- Add team_id and visibility to meetings table (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meetings') THEN
    ALTER TABLE meetings 
      ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'own' CHECK (visibility IN ('own', 'team', 'all'));
  END IF;
END $$;

-- Add team_id to companies table (companies are shared at team level by default)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') THEN
    ALTER TABLE companies 
      ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =====================================================
-- 2. POPULATE team_id FOR EXISTING DATA
-- =====================================================

-- Update leads with team_id from user's team
UPDATE leads 
SET team_id = (
  SELECT t.id 
  FROM teams t 
  WHERE t.owner_id = leads.user_id 
  LIMIT 1
)
WHERE team_id IS NULL AND user_id IS NOT NULL;

-- Update deals with team_id from user's team
UPDATE deals 
SET team_id = (
  SELECT t.id 
  FROM teams t 
  WHERE t.owner_id = deals.user_id 
  LIMIT 1
)
WHERE team_id IS NULL AND user_id IS NOT NULL;

-- Update activities with team_id from user's team
UPDATE activities 
SET team_id = (
  SELECT t.id 
  FROM teams t 
  WHERE t.owner_id = activities.user_id 
  LIMIT 1
)
WHERE team_id IS NULL AND user_id IS NOT NULL;

-- Update tasks with team_id from user's team (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
    UPDATE tasks 
    SET team_id = (
      SELECT t.id 
      FROM teams t 
      WHERE t.owner_id = tasks.user_id 
      LIMIT 1
    )
    WHERE team_id IS NULL AND user_id IS NOT NULL;
  END IF;
END $$;

-- Update meetings with team_id from user's team (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meetings') THEN
    UPDATE meetings 
    SET team_id = (
      SELECT t.id 
      FROM teams t 
      WHERE t.owner_id = meetings.user_id 
      LIMIT 1
    )
    WHERE team_id IS NULL AND user_id IS NOT NULL;
  END IF;
END $$;

-- Update companies with team_id from user's team (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') THEN
    UPDATE companies 
    SET team_id = (
      SELECT t.id 
      FROM teams t 
      WHERE t.owner_id = companies.user_id 
      LIMIT 1
    )
    WHERE team_id IS NULL AND user_id IS NOT NULL;
  END IF;
END $$;

-- =====================================================
-- 3. CREATE HELPER FUNCTION FOR VISIBILITY CHECK
-- =====================================================

CREATE OR REPLACE FUNCTION check_team_visibility(
  p_team_id UUID,
  p_user_id UUID,
  p_visibility TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- If visibility is 'all', anyone can see
  IF p_visibility = 'all' THEN
    RETURN TRUE;
  END IF;
  
  -- If visibility is 'team', check if user is team member
  IF p_visibility = 'team' THEN
    RETURN EXISTS (
      SELECT 1 
      FROM team_members 
      WHERE team_id = p_team_id 
        AND user_id = p_user_id
    );
  END IF;
  
  -- If visibility is 'own', check if user is the owner
  IF p_visibility = 'own' THEN
    RETURN p_user_id = (
      SELECT user_id 
      FROM leads 
      WHERE team_id = p_team_id 
      LIMIT 1
    );
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_team_visibility IS 'Check if user has access based on team visibility settings';

-- =====================================================
-- 4. UPDATE RLS POLICIES FOR LEADS
-- =====================================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own leads" ON leads;
DROP POLICY IF EXISTS "Users can insert own leads" ON leads;
DROP POLICY IF EXISTS "Users can update own leads" ON leads;
DROP POLICY IF EXISTS "Users can delete own leads" ON leads;

-- Create new policies with team visibility
CREATE POLICY "Users can view leads based on visibility" ON leads
  FOR SELECT
  USING (
    visibility = 'all' OR
    (visibility = 'team' AND team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )) OR
    (visibility = 'own' AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert leads in their team" ON leads
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update leads they own or have permission" ON leads
  FOR UPDATE
  USING (
    user_id = auth.uid() OR
    (
      team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      ) AND
      user_has_permission(auth.uid(), 'edit_all_data')
    )
  );

CREATE POLICY "Users can delete leads they own or have permission" ON leads
  FOR DELETE
  USING (
    user_id = auth.uid() OR
    (
      team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      ) AND
      user_has_permission(auth.uid(), 'delete_data')
    )
  );

-- =====================================================
-- 5. UPDATE RLS POLICIES FOR DEALS
-- =====================================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own deals" ON deals;
DROP POLICY IF EXISTS "Users can insert own deals" ON deals;
DROP POLICY IF EXISTS "Users can update own deals" ON deals;
DROP POLICY IF EXISTS "Users can delete own deals" ON deals;

-- Create new policies with team visibility
CREATE POLICY "Users can view deals based on visibility" ON deals
  FOR SELECT
  USING (
    visibility = 'all' OR
    (visibility = 'team' AND team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )) OR
    (visibility = 'own' AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert deals in their team" ON deals
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update deals they own or have permission" ON deals
  FOR UPDATE
  USING (
    user_id = auth.uid() OR
    (
      team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      ) AND
      user_has_permission(auth.uid(), 'edit_all_data')
    )
  );

CREATE POLICY "Users can delete deals they own or have permission" ON deals
  FOR DELETE
  USING (
    user_id = auth.uid() OR
    (
      team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      ) AND
      user_has_permission(auth.uid(), 'delete_data')
    )
  );

-- =====================================================
-- 6. UPDATE RLS POLICIES FOR ACTIVITIES
-- =====================================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own activities" ON activities;
DROP POLICY IF EXISTS "Users can insert own activities" ON activities;
DROP POLICY IF EXISTS "Users can update own activities" ON activities;
DROP POLICY IF EXISTS "Users can delete own activities" ON activities;

-- Create new policies with team visibility
CREATE POLICY "Users can view activities based on visibility" ON activities
  FOR SELECT
  USING (
    visibility = 'all' OR
    (visibility = 'team' AND team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )) OR
    (visibility = 'own' AND user_id = auth.uid())
  );

CREATE POLICY "Users can insert activities in their team" ON activities
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update activities they own or have permission" ON activities
  FOR UPDATE
  USING (
    user_id = auth.uid() OR
    (
      team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      ) AND
      user_has_permission(auth.uid(), 'edit_all_data')
    )
  );

CREATE POLICY "Users can delete activities they own or have permission" ON activities
  FOR DELETE
  USING (
    user_id = auth.uid() OR
    (
      team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      ) AND
      user_has_permission(auth.uid(), 'delete_data')
    )
  );

-- =====================================================
-- 7. UPDATE RLS POLICIES FOR TASKS (if table exists)
-- =====================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
    -- Drop old policies
    DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
    DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
    DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
    DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;

    -- Create new policies with team visibility
    EXECUTE 'CREATE POLICY "Users can view tasks based on visibility" ON tasks
      FOR SELECT
      USING (
        visibility = ''all'' OR
        (visibility = ''team'' AND team_id IN (
          SELECT team_id FROM team_members WHERE user_id = auth.uid()
        )) OR
        (visibility = ''own'' AND user_id = auth.uid())
      )';

    EXECUTE 'CREATE POLICY "Users can insert tasks in their team" ON tasks
      FOR INSERT
      WITH CHECK (
        user_id = auth.uid() AND
        team_id IN (
          SELECT team_id FROM team_members WHERE user_id = auth.uid()
        )
      )';

    EXECUTE 'CREATE POLICY "Users can update tasks they own or have permission" ON tasks
      FOR UPDATE
      USING (
        user_id = auth.uid() OR
        (
          team_id IN (
            SELECT team_id FROM team_members WHERE user_id = auth.uid()
          ) AND
          user_has_permission(auth.uid(), ''edit_all_data'')
        )
      )';

    EXECUTE 'CREATE POLICY "Users can delete tasks they own or have permission" ON tasks
      FOR DELETE
      USING (
        user_id = auth.uid() OR
        (
          team_id IN (
            SELECT team_id FROM team_members WHERE user_id = auth.uid()
          ) AND
          user_has_permission(auth.uid(), ''delete_data'')
        )
      )';
  END IF;
END $$;

-- =====================================================
-- 8. UPDATE RLS POLICIES FOR MEETINGS (if table exists)
-- =====================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meetings') THEN
    -- Drop old policies
    DROP POLICY IF EXISTS "Users can view own meetings" ON meetings;
    DROP POLICY IF EXISTS "Users can insert own meetings" ON meetings;
    DROP POLICY IF EXISTS "Users can update own meetings" ON meetings;
    DROP POLICY IF EXISTS "Users can delete own meetings" ON meetings;

    -- Create new policies with team visibility
    EXECUTE 'CREATE POLICY "Users can view meetings based on visibility" ON meetings
      FOR SELECT
      USING (
        visibility = ''all'' OR
        (visibility = ''team'' AND team_id IN (
          SELECT team_id FROM team_members WHERE user_id = auth.uid()
        )) OR
        (visibility = ''own'' AND user_id = auth.uid())
      )';

    EXECUTE 'CREATE POLICY "Users can insert meetings in their team" ON meetings
      FOR INSERT
      WITH CHECK (
        user_id = auth.uid() AND
        team_id IN (
          SELECT team_id FROM team_members WHERE user_id = auth.uid()
        )
      )';

    EXECUTE 'CREATE POLICY "Users can update meetings they own or have permission" ON meetings
      FOR UPDATE
      USING (
        user_id = auth.uid() OR
        (
          team_id IN (
            SELECT team_id FROM team_members WHERE user_id = auth.uid()
          ) AND
          user_has_permission(auth.uid(), ''edit_all_data'')
        )
      )';

    EXECUTE 'CREATE POLICY "Users can delete meetings they own or have permission" ON meetings
      FOR DELETE
      USING (
        user_id = auth.uid() OR
        (
          team_id IN (
            SELECT team_id FROM team_members WHERE user_id = auth.uid()
          ) AND
          user_has_permission(auth.uid(), ''delete_data'')
        )
      )';
  END IF;
END $$;

-- =====================================================
-- 9. UPDATE RLS POLICIES FOR COMPANIES (if table exists)
-- =====================================================
-- Note: Companies are team-level resources, not individual

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') THEN
    -- Drop old policies
    DROP POLICY IF EXISTS "Users can view own companies" ON companies;
    DROP POLICY IF EXISTS "Users can insert own companies" ON companies;
    DROP POLICY IF EXISTS "Users can update own companies" ON companies;
    DROP POLICY IF EXISTS "Users can delete own companies" ON companies;

    -- Create new policies (companies are always team-level)
    EXECUTE 'CREATE POLICY "Users can view companies in their team" ON companies
      FOR SELECT
      USING (
        team_id IN (
          SELECT team_id FROM team_members WHERE user_id = auth.uid()
        )
      )';

    EXECUTE 'CREATE POLICY "Users can insert companies in their team" ON companies
      FOR INSERT
      WITH CHECK (
        team_id IN (
          SELECT team_id FROM team_members WHERE user_id = auth.uid()
        )
      )';

    EXECUTE 'CREATE POLICY "Users can update companies with permission" ON companies
      FOR UPDATE
      USING (
        team_id IN (
          SELECT team_id FROM team_members WHERE user_id = auth.uid()
        ) AND
        user_has_permission(auth.uid(), ''edit_all_data'')
      )';

    EXECUTE 'CREATE POLICY "Users can delete companies with permission" ON companies
      FOR DELETE
      USING (
        team_id IN (
          SELECT team_id FROM team_members WHERE user_id = auth.uid()
        ) AND
        user_has_permission(auth.uid(), ''delete_data'')
      )';
  END IF;
END $$;

-- =====================================================
-- 10. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for team_id lookups
CREATE INDEX IF NOT EXISTS idx_leads_team_id ON leads(team_id);
CREATE INDEX IF NOT EXISTS idx_deals_team_id ON deals(team_id);
CREATE INDEX IF NOT EXISTS idx_activities_team_id ON activities(team_id);

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
    CREATE INDEX IF NOT EXISTS idx_tasks_team_id ON tasks(team_id);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meetings') THEN
    CREATE INDEX IF NOT EXISTS idx_meetings_team_id ON meetings(team_id);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') THEN
    CREATE INDEX IF NOT EXISTS idx_companies_team_id ON companies(team_id);
  END IF;
END $$;

-- Indexes for visibility lookups
CREATE INDEX IF NOT EXISTS idx_leads_visibility ON leads(visibility);
CREATE INDEX IF NOT EXISTS idx_deals_visibility ON deals(visibility);
CREATE INDEX IF NOT EXISTS idx_activities_visibility ON activities(visibility);

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
    CREATE INDEX IF NOT EXISTS idx_tasks_visibility ON tasks(visibility);
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meetings') THEN
    CREATE INDEX IF NOT EXISTS idx_meetings_visibility ON meetings(visibility);
  END IF;
END $$;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_leads_team_user ON leads(team_id, user_id);
CREATE INDEX IF NOT EXISTS idx_deals_team_user ON deals(team_id, user_id);
CREATE INDEX IF NOT EXISTS idx_activities_team_user ON activities(team_id, user_id);

-- =====================================================
-- 11. CREATE TRIGGER TO AUTO-SET team_id ON INSERT
-- =====================================================

-- Function to auto-set team_id from user's team
CREATE OR REPLACE FUNCTION set_team_id_from_user()
RETURNS TRIGGER AS $$
BEGIN
  -- If team_id is not set, get it from user's team
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

-- Apply trigger to leads
DROP TRIGGER IF EXISTS set_team_id_on_leads_insert ON leads;
CREATE TRIGGER set_team_id_on_leads_insert
  BEFORE INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION set_team_id_from_user();

-- Apply trigger to deals
DROP TRIGGER IF EXISTS set_team_id_on_deals_insert ON deals;
CREATE TRIGGER set_team_id_on_deals_insert
  BEFORE INSERT ON deals
  FOR EACH ROW
  EXECUTE FUNCTION set_team_id_from_user();

-- Apply trigger to activities
DROP TRIGGER IF EXISTS set_team_id_on_activities_insert ON activities;
CREATE TRIGGER set_team_id_on_activities_insert
  BEFORE INSERT ON activities
  FOR EACH ROW
  EXECUTE FUNCTION set_team_id_from_user();

-- Apply trigger to tasks (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks') THEN
    DROP TRIGGER IF EXISTS set_team_id_on_tasks_insert ON tasks;
    EXECUTE 'CREATE TRIGGER set_team_id_on_tasks_insert
      BEFORE INSERT ON tasks
      FOR EACH ROW
      EXECUTE FUNCTION set_team_id_from_user()';
  END IF;
END $$;

-- Apply trigger to meetings (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'meetings') THEN
    DROP TRIGGER IF EXISTS set_team_id_on_meetings_insert ON meetings;
    EXECUTE 'CREATE TRIGGER set_team_id_on_meetings_insert
      BEFORE INSERT ON meetings
      FOR EACH ROW
      EXECUTE FUNCTION set_team_id_from_user()';
  END IF;
END $$;

-- Apply trigger to companies (if exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'companies') THEN
    DROP TRIGGER IF EXISTS set_team_id_on_companies_insert ON companies;
    EXECUTE 'CREATE TRIGGER set_team_id_on_companies_insert
      BEFORE INSERT ON companies
      FOR EACH ROW
      EXECUTE FUNCTION set_team_id_from_user()';
  END IF;
END $$;

-- =====================================================
-- 12. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN leads.team_id IS 'Team that owns this lead';
COMMENT ON COLUMN leads.visibility IS 'Visibility setting: own (only owner), team (team members), all (everyone)';

COMMENT ON COLUMN deals.team_id IS 'Team that owns this deal';
COMMENT ON COLUMN deals.visibility IS 'Visibility setting: own (only owner), team (team members), all (everyone)';

COMMENT ON COLUMN activities.team_id IS 'Team that owns this activity';
COMMENT ON COLUMN activities.visibility IS 'Visibility setting: own (only owner), team (team members), all (everyone)';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Summary:
-- - Added team_id and visibility columns to 6 tables (leads, deals, activities, tasks, meetings, companies)
-- - Migrated existing data to link with user's teams
-- - Updated all RLS policies to respect team visibility
-- - Created helper function for visibility checks
-- - Added performance indexes for team_id and visibility
-- - Created triggers to auto-set team_id on inserts
-- - Companies are always team-level (no individual visibility)
-- 
-- Visibility levels:
-- - 'own': Only the owner can see (default)
-- - 'team': All team members can see
-- - 'all': Everyone can see (public)
-- =====================================================
