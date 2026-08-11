CREATE TABLE IF NOT EXISTS companies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(32),
    address TEXT,
    logo_url TEXT,
    code VARCHAR(64) UNIQUE,
    admin_name VARCHAR(150),
    admin_email VARCHAR(255),
    plan VARCHAR(120) NOT NULL DEFAULT 'Enterprise',
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    description TEXT,
    budget NUMERIC(15,2) NOT NULL DEFAULT 0,
    spent NUMERIC(15,2) NOT NULL DEFAULT 0,
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    status VARCHAR(32) NOT NULL DEFAULT 'PLANNED',
    start_date DATE,
    est_end_date DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS project_milestones (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    planned_start_date DATE,
    planned_end_date DATE,
    actual_end_date DATE,
    status VARCHAR(32) NOT NULL DEFAULT 'PLANNED',
    completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
    depends_on_id BIGINT REFERENCES project_milestones(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_projects_company ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project ON project_milestones(project_id);
