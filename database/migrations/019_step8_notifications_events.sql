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
