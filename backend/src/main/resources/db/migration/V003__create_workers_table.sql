CREATE TABLE IF NOT EXISTS workers (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(32),
    skill_trade VARCHAR(120) NOT NULL,
    daily_wage NUMERIC(12,2) NOT NULL DEFAULT 0,
    qr_code_token VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    assigned_project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,
    company_id BIGINT,
    contractor_name VARCHAR(150),
    site_engineer_name VARCHAR(150),
    assignment_type VARCHAR(32) NOT NULL DEFAULT 'DIRECT_PROJECT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shifts (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    starts_at TIME NOT NULL,
    ends_at TIME NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS worker_performance (
    id BIGSERIAL PRIMARY KEY,
    worker_id BIGINT NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,
    score NUMERIC(5,2) NOT NULL CHECK (score BETWEEN 0 AND 100),
    productivity_hours NUMERIC(8,2) NOT NULL DEFAULT 0,
    recorded_on DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_workers_project ON workers(assigned_project_id);
CREATE INDEX IF NOT EXISTS idx_workers_company ON workers(company_id);
CREATE INDEX IF NOT EXISTS idx_worker_performance_worker ON worker_performance(worker_id, recorded_on DESC);
