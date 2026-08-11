-- Final schema alignment for BuildTrack AI
-- Keeps older installations compatible with current JPA entities.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roles' AND column_name = 'name')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roles' AND column_name = 'role_name') THEN
        ALTER TABLE roles RENAME COLUMN name TO role_name;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uk_roles_role_name ON roles(role_name);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_user_status ON project_assignments(user_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_company_created ON notifications(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_project_created ON ai_insights(project_id, created_at DESC);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permissions' AND column_name = 'name')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'permissions' AND column_name = 'permission_name') THEN
        ALTER TABLE permissions RENAME COLUMN name TO permission_name;
    END IF;
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS uk_permissions_permission_name ON permissions(permission_name);
