CREATE TABLE IF NOT EXISTS project_assignments (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assignment_role VARCHAR(40) NOT NULL CHECK (assignment_role IN ('PROJECT_MANAGER','SITE_ENGINEER','CONTRACTOR','WORKER')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_project_user UNIQUE (project_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_project_assignments_project ON project_assignments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_user ON project_assignments(user_id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS code VARCHAR(64);
CREATE UNIQUE INDEX IF NOT EXISTS uk_projects_company_code ON projects(company_id, code) WHERE code IS NOT NULL;
