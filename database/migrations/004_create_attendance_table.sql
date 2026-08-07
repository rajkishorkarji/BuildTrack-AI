CREATE TABLE IF NOT EXISTS attendance (
    id BIGSERIAL PRIMARY KEY,
    worker_id BIGINT NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,
    shift_id BIGINT REFERENCES shifts(id) ON DELETE SET NULL,
    check_in TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    check_out TIMESTAMP,
    hours_worked NUMERIC(8,2),
    status VARCHAR(32) NOT NULL DEFAULT 'PRESENT',
    verification_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    verified_by VARCHAR(150),
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attendance_worker_date ON attendance(worker_id, check_in DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_project_date ON attendance(project_id, check_in DESC);
