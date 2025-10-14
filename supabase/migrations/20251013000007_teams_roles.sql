-- =====================================================
-- FASE 11: Multiusuário & Permissões
-- Sistema de times, roles e gerenciamento de permissões
-- =====================================================

-- =====================================================
-- 1. TABLE: teams
-- =====================================================

CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Owner
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Settings
  visibility_default TEXT DEFAULT 'team' CHECK (visibility_default IN ('own', 'team', 'all')),
  allow_member_invite BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT teams_name_unique UNIQUE(name)
);

-- =====================================================
-- 2. TABLE: team_members
-- =====================================================

CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Role
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'member')),
  
  -- Permissions override (JSON com permissões customizadas)
  custom_permissions JSONB DEFAULT '{}',
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'invited')),
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT team_members_unique UNIQUE(team_id, user_id)
);

-- =====================================================
-- 3. TABLE: team_invitations
-- =====================================================

CREATE TABLE team_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  
  -- Convidado
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'member')),
  
  -- Convite
  invited_by UUID REFERENCES profiles(id) NOT NULL,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  
  -- Token para aceitar convite
  token UUID DEFAULT uuid_generate_v4(),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT team_invitations_unique UNIQUE(team_id, email, status)
);

-- =====================================================
-- 4. TABLE: permissions (Sistema de permissões)
-- =====================================================

CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identificação
  name TEXT NOT NULL UNIQUE,
  resource TEXT NOT NULL,  -- leads, deals, activities, tasks, meetings, settings
  action TEXT NOT NULL,    -- create, read, update, delete, manage
  
  -- Descrição
  description TEXT,
  
  -- Categoria
  category TEXT DEFAULT 'general',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT permissions_name_unique UNIQUE(resource, action)
);

-- =====================================================
-- 5. TABLE: role_permissions (Permissões por Role)
-- =====================================================

CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'member')),
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
  
  granted BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT role_permissions_unique UNIQUE(role, permission_id)
);

-- =====================================================
-- 6. INSERT: Permissões padrão
-- =====================================================

INSERT INTO permissions (name, resource, action, description, category) VALUES
-- Leads
('leads.create', 'leads', 'create', 'Criar novos leads', 'leads'),
('leads.read', 'leads', 'read', 'Visualizar leads', 'leads'),
('leads.update', 'leads', 'update', 'Editar leads', 'leads'),
('leads.delete', 'leads', 'delete', 'Deletar leads', 'leads'),
('leads.manage', 'leads', 'manage', 'Gerenciar todos os leads do time', 'leads'),

-- Deals
('deals.create', 'deals', 'create', 'Criar novos deals', 'deals'),
('deals.read', 'deals', 'read', 'Visualizar deals', 'deals'),
('deals.update', 'deals', 'update', 'Editar deals', 'deals'),
('deals.delete', 'deals', 'delete', 'Deletar deals', 'deals'),
('deals.manage', 'deals', 'manage', 'Gerenciar todos os deals do time', 'deals'),

-- Activities
('activities.create', 'activities', 'create', 'Criar atividades', 'activities'),
('activities.read', 'activities', 'read', 'Visualizar atividades', 'activities'),
('activities.update', 'activities', 'update', 'Editar atividades', 'activities'),
('activities.delete', 'activities', 'delete', 'Deletar atividades', 'activities'),

-- Tasks
('tasks.create', 'tasks', 'create', 'Criar tarefas', 'tasks'),
('tasks.read', 'tasks', 'read', 'Visualizar tarefas', 'tasks'),
('tasks.update', 'tasks', 'update', 'Editar tarefas', 'tasks'),
('tasks.delete', 'tasks', 'delete', 'Deletar tarefas', 'tasks'),
('tasks.assign', 'tasks', 'assign', 'Atribuir tarefas a outros usuários', 'tasks'),

-- Meetings
('meetings.create', 'meetings', 'create', 'Criar reuniões', 'meetings'),
('meetings.read', 'meetings', 'read', 'Visualizar reuniões', 'meetings'),
('meetings.update', 'meetings', 'update', 'Editar reuniões', 'meetings'),
('meetings.delete', 'meetings', 'delete', 'Deletar reuniões', 'meetings'),

-- Team
('team.invite', 'team', 'invite', 'Convidar membros para o time', 'team'),
('team.manage', 'team', 'manage', 'Gerenciar membros do time', 'team'),
('team.settings', 'team', 'settings', 'Alterar configurações do time', 'team'),

-- Workflows
('workflows.create', 'workflows', 'create', 'Criar workflows', 'workflows'),
('workflows.read', 'workflows', 'read', 'Visualizar workflows', 'workflows'),
('workflows.update', 'workflows', 'update', 'Editar workflows', 'workflows'),
('workflows.delete', 'workflows', 'delete', 'Deletar workflows', 'workflows'),

-- Reports
('reports.view', 'reports', 'view', 'Visualizar relatórios', 'reports'),
('reports.export', 'reports', 'export', 'Exportar relatórios', 'reports');

-- =====================================================
-- 7. INSERT: Permissões por Role
-- =====================================================

-- ADMIN: Todas as permissões
INSERT INTO role_permissions (role, permission_id, granted)
SELECT 'admin', id, true FROM permissions;

-- MANAGER: Todas exceto team.settings
INSERT INTO role_permissions (role, permission_id, granted)
SELECT 'manager', id, true FROM permissions
WHERE name NOT IN ('team.settings');

-- MEMBER: Permissões básicas (sem manage, sem delete de outros, sem team management)
INSERT INTO role_permissions (role, permission_id, granted)
SELECT 'member', id, true FROM permissions
WHERE name IN (
  'leads.create', 'leads.read', 'leads.update',
  'deals.create', 'deals.read', 'deals.update',
  'activities.create', 'activities.read', 'activities.update',
  'tasks.create', 'tasks.read', 'tasks.update',
  'meetings.create', 'meetings.read', 'meetings.update',
  'workflows.read',
  'reports.view'
);

-- =====================================================
-- 8. FUNCTIONS
-- =====================================================

-- Function: Atualizar updated_at de teams
CREATE OR REPLACE FUNCTION update_teams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER teams_updated_at_trigger
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_teams_updated_at();

-- Function: Atualizar updated_at de team_members
CREATE OR REPLACE FUNCTION update_team_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER team_members_updated_at_trigger
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_team_members_updated_at();

-- Function: Adicionar owner como admin ao criar time
CREATE OR REPLACE FUNCTION add_owner_to_team()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO team_members (team_id, user_id, role, status)
  VALUES (NEW.id, NEW.owner_id, 'admin', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER add_owner_to_team_trigger
  AFTER INSERT ON teams
  FOR EACH ROW
  EXECUTE FUNCTION add_owner_to_team();

-- Function: Expirar convites antigos
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
  UPDATE team_invitations
  SET status = 'expired'
  WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function: Verificar se usuário tem permissão
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID,
  p_team_id UUID,
  p_permission_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_has_permission BOOLEAN;
  v_role TEXT;
  v_custom_permissions JSONB;
BEGIN
  -- Buscar role e custom permissions do usuário
  SELECT tm.role, tm.custom_permissions
  INTO v_role, v_custom_permissions
  FROM team_members tm
  WHERE tm.team_id = p_team_id
    AND tm.user_id = p_user_id
    AND tm.status = 'active';
  
  -- Se não é membro do time, sem permissão
  IF v_role IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar custom permissions primeiro
  IF v_custom_permissions ? p_permission_name THEN
    RETURN (v_custom_permissions->>p_permission_name)::BOOLEAN;
  END IF;
  
  -- Verificar permissões do role
  SELECT rp.granted
  INTO v_has_permission
  FROM role_permissions rp
  JOIN permissions p ON rp.permission_id = p.id
  WHERE rp.role = v_role
    AND p.name = p_permission_name;
  
  RETURN COALESCE(v_has_permission, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Obter team do usuário
CREATE OR REPLACE FUNCTION get_user_team_id(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_team_id UUID;
BEGIN
  SELECT team_id
  INTO v_team_id
  FROM team_members
  WHERE user_id = p_user_id
    AND status = 'active'
  LIMIT 1;
  
  RETURN v_team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. RLS POLICIES: teams
-- =====================================================

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Policy: Ver apenas times onde é membro
CREATE POLICY teams_select_policy ON teams
  FOR SELECT
  USING (
    id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Policy: Criar time (qualquer usuário autenticado)
CREATE POLICY teams_insert_policy ON teams
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Policy: Atualizar apenas se é admin
CREATE POLICY teams_update_policy ON teams
  FOR UPDATE
  USING (
    id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
        AND role = 'admin'
        AND status = 'active'
    )
  );

-- Policy: Deletar apenas se é owner
CREATE POLICY teams_delete_policy ON teams
  FOR DELETE
  USING (owner_id = auth.uid());

-- =====================================================
-- 10. RLS POLICIES: team_members
-- =====================================================

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Policy: Ver membros do próprio time
CREATE POLICY team_members_select_policy ON team_members
  FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Policy: Adicionar membros (admins e managers)
CREATE POLICY team_members_insert_policy ON team_members
  FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
        AND role IN ('admin', 'manager')
        AND status = 'active'
    )
  );

-- Policy: Atualizar membros (apenas admins)
CREATE POLICY team_members_update_policy ON team_members
  FOR UPDATE
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
        AND role = 'admin'
        AND status = 'active'
    )
  );

-- Policy: Remover membros (apenas admins)
CREATE POLICY team_members_delete_policy ON team_members
  FOR DELETE
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
        AND role = 'admin'
        AND status = 'active'
    )
  );

-- =====================================================
-- 11. RLS POLICIES: team_invitations
-- =====================================================

ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Ver convites do próprio time
CREATE POLICY team_invitations_select_policy ON team_invitations
  FOR SELECT
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid() AND status = 'active'
    )
    OR email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Policy: Criar convites (admins, managers, ou se allow_member_invite)
CREATE POLICY team_invitations_insert_policy ON team_invitations
  FOR INSERT
  WITH CHECK (
    invited_by = auth.uid()
    AND (
      -- Admin ou Manager
      team_id IN (
        SELECT team_id FROM team_members
        WHERE user_id = auth.uid()
          AND role IN ('admin', 'manager')
          AND status = 'active'
      )
      OR
      -- Member com permissão
      (
        team_id IN (
          SELECT t.id FROM teams t
          JOIN team_members tm ON t.id = tm.team_id
          WHERE tm.user_id = auth.uid()
            AND tm.status = 'active'
            AND t.allow_member_invite = true
        )
      )
    )
  );

-- Policy: Atualizar convites (apenas quem convidou ou admins)
CREATE POLICY team_invitations_update_policy ON team_invitations
  FOR UPDATE
  USING (
    invited_by = auth.uid()
    OR team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
        AND role = 'admin'
        AND status = 'active'
    )
  );

-- Policy: Deletar convites (apenas quem convidou ou admins)
CREATE POLICY team_invitations_delete_policy ON team_invitations
  FOR DELETE
  USING (
    invited_by = auth.uid()
    OR team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
        AND role = 'admin'
        AND status = 'active'
    )
  );

-- =====================================================
-- 12. RLS POLICIES: permissions & role_permissions
-- =====================================================

ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Todos podem ler permissões
CREATE POLICY permissions_select_policy ON permissions
  FOR SELECT
  USING (true);

CREATE POLICY role_permissions_select_policy ON role_permissions
  FOR SELECT
  USING (true);

-- Apenas service role pode modificar
CREATE POLICY permissions_admin_policy ON permissions
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

CREATE POLICY role_permissions_admin_policy ON role_permissions
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- =====================================================
-- 13. INDEXES
-- =====================================================

-- Teams
CREATE INDEX idx_teams_owner_id ON teams(owner_id);

-- Team Members
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_role ON team_members(role);
CREATE INDEX idx_team_members_status ON team_members(status);

-- Team Invitations
CREATE INDEX idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX idx_team_invitations_email ON team_invitations(email);
CREATE INDEX idx_team_invitations_status ON team_invitations(status);
CREATE INDEX idx_team_invitations_token ON team_invitations(token);
CREATE INDEX idx_team_invitations_expires_at ON team_invitations(expires_at);

-- Permissions
CREATE INDEX idx_permissions_resource ON permissions(resource);
CREATE INDEX idx_permissions_action ON permissions(action);

-- Role Permissions
CREATE INDEX idx_role_permissions_role ON role_permissions(role);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE teams IS 'Times/equipes para organização multiusuário';
COMMENT ON TABLE team_members IS 'Membros dos times com roles';
COMMENT ON TABLE team_invitations IS 'Convites pendentes para times';
COMMENT ON TABLE permissions IS 'Permissões disponíveis no sistema';
COMMENT ON TABLE role_permissions IS 'Permissões atribuídas a cada role';

COMMENT ON FUNCTION user_has_permission(UUID, UUID, TEXT) IS 'Verifica se usuário tem permissão específica';
COMMENT ON FUNCTION get_user_team_id(UUID) IS 'Retorna team_id do usuário';
COMMENT ON FUNCTION expire_old_invitations() IS 'Marca convites expirados';
