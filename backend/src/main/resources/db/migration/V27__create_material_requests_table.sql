CREATE TABLE IF NOT EXISTS material_requests (
    id BIGSERIAL PRIMARY KEY,
    material_id BIGINT NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    task_id BIGINT REFERENCES tasks(id) ON DELETE SET NULL,
    requested_by_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    issued_by_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    quantity NUMERIC(14,3) NOT NULL,
    required_date VARCHAR(50),
    reason TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_material_requests_project ON material_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_material_requests_material ON material_requests(material_id);
CREATE INDEX IF NOT EXISTS idx_material_requests_status ON material_requests(status);
