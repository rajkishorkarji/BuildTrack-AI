CREATE TABLE IF NOT EXISTS equipment (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(120) NOT NULL,
    serial_number VARCHAR(120) UNIQUE,
    status VARCHAR(32) NOT NULL DEFAULT 'OPERATIONAL',
    daily_cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    last_serviced_date DATE,
    next_service_due DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS equipment_maintenance (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    service_date DATE NOT NULL,
    next_due_date DATE,
    service_type VARCHAR(120) NOT NULL,
    cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'SCHEDULED'
);

CREATE INDEX IF NOT EXISTS idx_equipment_project ON equipment(project_id);
CREATE INDEX IF NOT EXISTS idx_equipment_service_due ON equipment(next_service_due);
CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_due ON equipment_maintenance(next_due_date);
