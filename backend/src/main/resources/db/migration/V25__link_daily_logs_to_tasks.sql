ALTER TABLE daily_logs
    ADD COLUMN IF NOT EXISTS task_id BIGINT REFERENCES tasks(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_daily_logs_task_date
    ON daily_logs(task_id, log_date DESC);
