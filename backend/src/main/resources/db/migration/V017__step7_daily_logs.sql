CREATE TABLE IF NOT EXISTS daily_logs (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    created_by_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    log_date DATE NOT NULL,
    work_summary VARCHAR(1000) NOT NULL,
    blockers TEXT,
    safety_notes TEXT,
    weather VARCHAR(255),
    progress_percentage INTEGER CHECK (progress_percentage BETWEEN 0 AND 100),
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_daily_logs_project_date ON daily_logs(project_id, log_date DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_logs_company_date ON daily_logs(company_id, log_date DESC, created_at DESC);
