-- BuildTrack AI consolidated schema. Generated from database/migrations.

-- ===== 001_create_users_table.sql =====
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    role_name VARCHAR(64) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS permissions (
    id BIGSERIAL PRIMARY KEY,
    permission_name VARCHAR(96) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(32),
    password VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    provider VARCHAR(32) NOT NULL DEFAULT 'LOCAL',
    company_id BIGINT,
    company_code VARCHAR(64),
    assigned_project_id BIGINT,
    assigned_contractor_id BIGINT,
    assigned_se_id BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id BIGINT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    expiry_date TIMESTAMP NOT NULL,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id);

INSERT INTO roles (name) VALUES
    ('SUPER_ADMIN'), ('COMPANY_ADMIN'), ('PROJECT_MANAGER'),
    ('SITE_ENGINEER'), ('CONTRACTOR'), ('WORKER')
ON CONFLICT (role_name) DO NOTHING;

-- ===== 002_create_projects_table.sql =====
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

-- ===== 003_create_workers_table.sql =====
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

-- ===== 004_create_attendance_table.sql =====
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

-- ===== 005_create_tasks_table.sql =====
CREATE TABLE IF NOT EXISTS tasks (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    milestone_id BIGINT REFERENCES project_milestones(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(32) NOT NULL DEFAULT 'TODO',
    priority VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
    completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
    due_date DATE,
    assigned_worker_id BIGINT REFERENCES workers(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_worker ON tasks(assigned_worker_id);

-- ===== 006_create_equipment_table.sql =====
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

-- ===== 007_create_finance_table.sql =====
CREATE TABLE IF NOT EXISTS finances (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    vendor_name VARCHAR(255) NOT NULL,
    category VARCHAR(80) NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    gst_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    due_date DATE NOT NULL,
    paid_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    vendor_name VARCHAR(255) NOT NULL,
    category VARCHAR(80) NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    gst_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(15,2) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    due_date DATE
);

CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,
    transaction_ref VARCHAR(120) NOT NULL UNIQUE,
    amount NUMERIC(15,2) NOT NULL,
    payment_method VARCHAR(40) NOT NULL,
    category VARCHAR(80) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED',
    payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_finances_project_status ON finances(project_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_project_status ON invoices(project_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_project_date ON payments(project_id, payment_date DESC);


-- ===== 008_create_documents_table.sql =====
CREATE TABLE IF NOT EXISTS documents (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by VARCHAR(150),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_images (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    document_id BIGINT REFERENCES documents(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    caption TEXT,
    latitude NUMERIC(10,7),
    longitude NUMERIC(10,7),
    captured_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(150)
);

CREATE INDEX IF NOT EXISTS idx_documents_project ON documents(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_images_project ON site_images(project_id, captured_at DESC);

-- ===== 009_create_notifications_table.sql =====
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'INFO',
    read BOOLEAN NOT NULL DEFAULT FALSE,
    recipient_user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    company_id BIGINT REFERENCES companies(id) ON DELETE CASCADE,
    project_id BIGINT REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reports (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT REFERENCES projects(id) ON DELETE SET NULL,
    company_id BIGINT REFERENCES companies(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    report_type VARCHAR(64) NOT NULL,
    summary_json TEXT,
    generated_by VARCHAR(150) NOT NULL,
    generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_insights (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    insight_type VARCHAR(80) NOT NULL,
    risk_level VARCHAR(32) NOT NULL,
    risk_score NUMERIC(5,2) NOT NULL,
    recommendation TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read ON notifications(recipient_user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_project_type ON reports(project_id, report_type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_project_risk ON ai_insights(project_id, risk_level);

-- ===== 010_add_attendance_verification.sql =====
ALTER TABLE attendance
    ADD COLUMN IF NOT EXISTS verification_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    ADD COLUMN IF NOT EXISTS verified_by VARCHAR(255);

-- ===== 011_create_invitation_and_payment_support.sql =====
CREATE TABLE IF NOT EXISTS user_invitations (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(80) NOT NULL,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    token VARCHAR(100) NOT NULL UNIQUE,
    claimed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    CONSTRAINT uq_user_invitation_email_company UNIQUE(email, company_id)
);

CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_company ON user_invitations(company_id);

ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(120);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(120);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS company_id BIGINT;
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order ON payments(razorpay_order_id);

-- ===== 012_create_project_assignments.sql =====
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

-- ===== 013_step3_workforce_tasks.sql =====
-- STEP 3: workforce visibility + project task assignment to invited personnel
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_user ON tasks(assigned_user_id);

-- Existing worker-level assignment remains supported through assigned_worker_id.
-- New application flows use assigned_user_id so invited WORKER/CONTRACTOR/SITE_ENGINEER/PM accounts
-- can be assigned safely through project_assignments.

-- ===== 014_step4_attendance.sql =====
-- STEP 4: Real attendance ownership, QR check-in and worker-account linkage.
ALTER TABLE workers
    ADD COLUMN IF NOT EXISTS user_id BIGINT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_workers_user'
    ) THEN
        ALTER TABLE workers
            ADD CONSTRAINT fk_workers_user
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_workers_user_id
    ON workers(user_id)
    WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_workers_company_user
    ON workers(company_id, user_id);

CREATE INDEX IF NOT EXISTS idx_attendance_worker_checkin
    ON attendance(worker_id, check_in DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_project_checkin
    ON attendance(project_id, check_in DESC);

CREATE INDEX IF NOT EXISTS idx_attendance_verification
    ON attendance(verification_status, check_in DESC);

-- ===== 015_step5_equipment_materials.sql =====
ALTER TABLE equipment
    ADD COLUMN IF NOT EXISTS assigned_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_equipment_assigned_user ON equipment(assigned_user_id);

CREATE TABLE IF NOT EXISTS materials (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    unit VARCHAR(40) NOT NULL,
    quantity NUMERIC(14,3) NOT NULL DEFAULT 0,
    reorder_level NUMERIC(14,3) NOT NULL DEFAULT 0,
    unit_cost NUMERIC(14,2) NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_material_project_name UNIQUE(project_id, name)
);

CREATE TABLE IF NOT EXISTS material_transactions (
    id BIGSERIAL PRIMARY KEY,
    material_id BIGINT NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    quantity NUMERIC(14,3) NOT NULL,
    unit_cost NUMERIC(14,2) NOT NULL DEFAULT 0,
    performed_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_material_project ON materials(project_id);
CREATE INDEX IF NOT EXISTS idx_material_transactions_material ON material_transactions(material_id);
CREATE INDEX IF NOT EXISTS idx_material_status ON materials(status);

-- ===== 016_step6_finance_razorpay.sql =====
-- STEP 6: Finance + Razorpay
-- PostgreSQL migration. Safe to run more than once.

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS currency VARCHAR(10) NOT NULL DEFAULT 'INR';

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS plan_code VARCHAR(60);

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS plan_name VARCHAR(120);

ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS company_id BIGINT;

CREATE INDEX IF NOT EXISTS idx_payments_company_date
    ON payments(company_id, payment_date DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_razorpay_order
    ON payments(razorpay_order_id)
    WHERE razorpay_order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_razorpay_payment
    ON payments(razorpay_payment_id)
    WHERE razorpay_payment_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS razorpay_webhook_events (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR(160) NOT NULL UNIQUE,
    event_type VARCHAR(80) NOT NULL,
    received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_razorpay_webhook_received
    ON razorpay_webhook_events(received_at);

-- Keep the application tenant-safe.
UPDATE payments p
SET company_id = pr.company_id
FROM projects pr
WHERE p.project_id = pr.id
  AND p.company_id IS NULL;

ALTER TABLE payments
    ADD CONSTRAINT fk_payments_company
    FOREIGN KEY (company_id) REFERENCES companies(id);

-- Existing rows may predate Step 6 and may not have a company.
-- New Step 6 payments are always created with a company_id.

-- ===== 017_step7_daily_logs.sql =====
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

-- ===== 018_step7_document_security.sql =====
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT;
CREATE INDEX IF NOT EXISTS idx_documents_project_created ON documents(project_id, created_at DESC);

-- ===== 019_step8_notifications_events.sql =====
-- Step 8: tenant-safe notification/event persistence.
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS recipient_email VARCHAR(255) DEFAULT '';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS recipient_user_id BIGINT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS project_id BIGINT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sender_name VARCHAR(255);
UPDATE notifications n SET recipient_email = u.email FROM users u WHERE n.recipient_user_id = u.id AND (n.recipient_email IS NULL OR n.recipient_email = '');
ALTER TABLE notifications ALTER COLUMN recipient_email SET NOT NULL;

UPDATE notifications n
SET recipient_email = u.email
FROM users u
WHERE n.recipient_email IS NULL
  AND n.recipient_user_id = u.id;

CREATE INDEX IF NOT EXISTS idx_notifications_company_created
    ON notifications(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_email_read
    ON notifications(recipient_email, read, created_at DESC);

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

-- ===== 020_final_schema_alignment.sql =====
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
