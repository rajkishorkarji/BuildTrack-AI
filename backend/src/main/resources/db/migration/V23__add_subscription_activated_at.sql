ALTER TABLE companies
    ADD COLUMN IF NOT EXISTS subscription_activated_at TIMESTAMP;