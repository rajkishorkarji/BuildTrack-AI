-- ============================================================
-- BuildTrack AI
-- V22 - Existing Database Schema Alignment
--
-- Existing users, companies and invitations are preserved.
-- This migration adds the missing enhanced BuildTrack schema.
-- ============================================================

-- ============================================================
-- PROJECT ALIGNMENT
-- ============================================================

ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS code VARCHAR(64);

ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS spent NUMERIC(15,2) DEFAULT 0;

ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0;

ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS est_end_date DATE;

ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS assigned_project_manager_email VARCHAR(255);

CREATE UNIQUE INDEX IF NOT EXISTS uk_projects_company_code
    ON projects(company_id, code)
    WHERE code IS NOT NULL;


-- Copy old values into the current application columns where possible.
UPDATE projects
SET spent = COALESCE(spent, 0)
WHERE spent IS NULL;

-- Copy legacy estimated end date only when that legacy column exists.
-- Current schema does not contain estimated_end_date, so no migration is required.

-- ============================================================
-- PROJECT MILESTONES
-- ============================================================

CREATE TABLE IF NOT EXISTS project_milestones (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL
        REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    planned_start_date DATE,
    planned_end_date DATE,
    actual_end_date DATE,
    status VARCHAR(32) NOT NULL DEFAULT 'PLANNED',
    completion_percentage INTEGER NOT NULL DEFAULT 0
        CHECK (completion_percentage BETWEEN 0 AND 100),
    depends_on_id BIGINT
        REFERENCES project_milestones(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_project_milestones_project
    ON project_milestones(project_id);


-- ============================================================
-- SHIFTS
-- ============================================================

CREATE TABLE IF NOT EXISTS shifts (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL
        REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    starts_at TIME NOT NULL,
    ends_at TIME NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
);


-- ============================================================
-- WORKER PERFORMANCE
-- ============================================================

CREATE TABLE IF NOT EXISTS worker_performance (
    id BIGSERIAL PRIMARY KEY,
    worker_id BIGINT NOT NULL
        REFERENCES workers(id) ON DELETE CASCADE,
    project_id BIGINT
        REFERENCES projects(id) ON DELETE SET NULL,
    score NUMERIC(5,2) NOT NULL
        CHECK (score BETWEEN 0 AND 100),
    productivity_hours NUMERIC(8,2) NOT NULL DEFAULT 0,
    recorded_on DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_worker_performance_worker
    ON worker_performance(worker_id, recorded_on DESC);


-- ============================================================
-- WORKER ACCOUNT LINK
-- ============================================================

ALTER TABLE workers
    ADD COLUMN IF NOT EXISTS user_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_workers_user'
    ) THEN
        ALTER TABLE workers
            ADD CONSTRAINT fk_workers_user
            FOREIGN KEY (user_id)
            REFERENCES users(id)
            ON DELETE SET NULL;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_workers_user_id
    ON workers(user_id)
    WHERE user_id IS NOT NULL;


-- ============================================================
-- ATTENDANCE ALIGNMENT
-- ============================================================

ALTER TABLE attendance
    ADD COLUMN IF NOT EXISTS shift_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_attendance_shift'
    ) THEN
        ALTER TABLE attendance
            ADD CONSTRAINT fk_attendance_shift
            FOREIGN KEY (shift_id)
            REFERENCES shifts(id)
            ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_attendance_verification
    ON attendance(verification_status, check_in DESC);


-- ============================================================
-- TASK ALIGNMENT
-- ============================================================

ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS milestone_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_tasks_milestone'
    ) THEN
        ALTER TABLE tasks
            ADD CONSTRAINT fk_tasks_milestone
            FOREIGN KEY (milestone_id)
            REFERENCES project_milestones(id)
            ON DELETE SET NULL;
    END IF;
END $$;

ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS assigned_user_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_tasks_assigned_user'
    ) THEN
        ALTER TABLE tasks
            ADD CONSTRAINT fk_tasks_assigned_user
            FOREIGN KEY (assigned_user_id)
            REFERENCES users(id)
            ON DELETE SET NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_tasks_assigned_user
    ON tasks(assigned_user_id);


-- ============================================================
-- EQUIPMENT MAINTENANCE
-- ============================================================

CREATE TABLE IF NOT EXISTS equipment_maintenance (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT NOT NULL
        REFERENCES equipment(id) ON DELETE CASCADE,
    service_date DATE NOT NULL,
    next_due_date DATE,
    service_type VARCHAR(120) NOT NULL,
    cost NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'SCHEDULED'
);

CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_due
    ON equipment_maintenance(next_due_date);


ALTER TABLE equipment
    ADD COLUMN IF NOT EXISTS assigned_user_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_equipment_assigned_user'
    ) THEN
        ALTER TABLE equipment
            ADD CONSTRAINT fk_equipment_assigned_user
            FOREIGN KEY (assigned_user_id)
            REFERENCES users(id)
            ON DELETE SET NULL;
    END IF;
END $$;


-- ============================================================
-- MATERIALS
-- ============================================================

CREATE TABLE IF NOT EXISTS materials (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL
        REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(40) NOT NULL,
    quantity NUMERIC(14,3) NOT NULL DEFAULT 0,
    reorder_level NUMERIC(14,3) NOT NULL DEFAULT 0,
    unit_cost NUMERIC(14,2) NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_material_project_name
        UNIQUE(project_id, name)
);

CREATE INDEX IF NOT EXISTS idx_material_project
    ON materials(project_id);

CREATE INDEX IF NOT EXISTS idx_material_status
    ON materials(status);


CREATE TABLE IF NOT EXISTS material_transactions (
    id BIGSERIAL PRIMARY KEY,
    material_id BIGINT NOT NULL
        REFERENCES materials(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    quantity NUMERIC(14,3) NOT NULL,
    unit_cost NUMERIC(14,2) NOT NULL DEFAULT 0,
    performed_by BIGINT
        REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_material_transactions_material
    ON material_transactions(material_id);


-- ============================================================
-- PROJECT ASSIGNMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS project_assignments (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL
        REFERENCES projects(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE CASCADE,
    assignment_role VARCHAR(40) NOT NULL
        CHECK (
            assignment_role IN (
                'PROJECT_MANAGER',
                'SITE_ENGINEER',
                'CONTRACTOR',
                'WORKER'
            )
        ),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_project_user UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_assignments_project
    ON project_assignments(project_id);

CREATE INDEX IF NOT EXISTS idx_project_assignments_user
    ON project_assignments(user_id);

CREATE INDEX IF NOT EXISTS idx_project_assignments_user_status
    ON project_assignments(user_id, status);


-- ============================================================
-- DOCUMENT ALIGNMENT
-- ============================================================

ALTER TABLE documents
    ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT;

CREATE INDEX IF NOT EXISTS idx_documents_project_created
    ON documents(project_id, created_at DESC);


-- ============================================================
-- SITE IMAGES
-- ============================================================

CREATE TABLE IF NOT EXISTS site_images (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL
        REFERENCES projects(id) ON DELETE CASCADE,
    document_id BIGINT
        REFERENCES documents(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    caption TEXT,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    captured_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(150)
);

CREATE INDEX IF NOT EXISTS idx_site_images_project
    ON site_images(project_id, captured_at DESC);


-- ============================================================
-- PAYMENTS / RAZORPAY
-- ============================================================

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(120);

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(120);

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS company_id BIGINT;

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR';

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS plan_code VARCHAR(60);

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS plan_name VARCHAR(120);

CREATE INDEX IF NOT EXISTS idx_payments_company_date
    ON payments(company_id, payment_date DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_razorpay_order
    ON payments(razorpay_order_id)
    WHERE razorpay_order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_razorpay_payment
    ON payments(razorpay_payment_id)
    WHERE razorpay_payment_id IS NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_payments_company'
    ) THEN
        ALTER TABLE payments
            ADD CONSTRAINT fk_payments_company
            FOREIGN KEY (company_id)
            REFERENCES companies(id);
    END IF;
END $$;


CREATE TABLE IF NOT EXISTS razorpay_webhook_events (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(160) NOT NULL UNIQUE,
    event_type VARCHAR(80) NOT NULL,
    received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_razorpay_webhook_received
    ON razorpay_webhook_events(received_at);


-- ============================================================
-- DAILY LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS daily_logs (
    id BIGSERIAL PRIMARY KEY,
    company_id BIGINT NOT NULL
        REFERENCES companies(id) ON DELETE CASCADE,
    project_id BIGINT NOT NULL
        REFERENCES projects(id) ON DELETE CASCADE,
    created_by_user_id BIGINT NOT NULL
        REFERENCES users(id) ON DELETE RESTRICT,
    log_date DATE NOT NULL,
    work_summary VARCHAR(1000) NOT NULL,
    blockers TEXT,
    safety_notes TEXT,
    weather VARCHAR(255),
    progress_percentage INTEGER
        CHECK(progress_percentage BETWEEN 0 AND 100),
    status VARCHAR(32) NOT NULL DEFAULT 'SUBMITTED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_daily_logs_project_date
    ON daily_logs(project_id, log_date DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_daily_logs_company_date
    ON daily_logs(company_id, log_date DESC, created_at DESC);


-- ============================================================
-- NOTIFICATION ALIGNMENT
-- ============================================================

ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS recipient_email VARCHAR(255);

ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS sender_name VARCHAR(255);

ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS recipient_user_id BIGINT;

ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS project_id BIGINT;

UPDATE notifications n
SET recipient_email = u.email
FROM users u
WHERE n.recipient_user_id = u.id
  AND (n.recipient_email IS NULL OR n.recipient_email = '');

CREATE INDEX IF NOT EXISTS idx_notifications_company_created
    ON notifications(company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_email_read
    ON notifications(recipient_email, read, created_at DESC);


-- ============================================================
-- EVENT ANALYTICS
-- ============================================================

CREATE TABLE IF NOT EXISTS event_analytics (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    company_id BIGINT,
    entity_type VARCHAR(100),
    entity_id BIGINT,
    actor_email VARCHAR(255),
    payload_message TEXT,
    occurred_at TIMESTAMP NOT NULL,
    processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_event_analytics_company_time
    ON event_analytics(company_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_event_analytics_type_time
    ON event_analytics(event_type, occurred_at DESC);


-- ============================================================
-- SITE ISSUES
-- ============================================================

CREATE TABLE IF NOT EXISTS site_issues (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL
        REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(32) NOT NULL DEFAULT 'HIGH',
    location VARCHAR(255),
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    reported_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_site_issues_project_created
    ON site_issues(project_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_site_issues_status
    ON site_issues(status);


-- ============================================================
-- COMPANY / USER SUPPORT
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_users_company_id
    ON users(company_id);

CREATE INDEX IF NOT EXISTS idx_users_email
    ON users(email);

CREATE INDEX IF NOT EXISTS idx_user_invitations_company
    ON user_invitations(company_id);

CREATE INDEX IF NOT EXISTS idx_user_invitations_token
    ON user_invitations(token);