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
