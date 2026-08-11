CREATE TABLE IF NOT EXISTS site_issues (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(32) NOT NULL DEFAULT 'HIGH',
    location VARCHAR(255),
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    reported_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_site_issues_project_created ON site_issues(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_issues_status ON site_issues(status);
