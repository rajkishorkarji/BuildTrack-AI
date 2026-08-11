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
