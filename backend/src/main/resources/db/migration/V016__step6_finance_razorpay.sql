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
