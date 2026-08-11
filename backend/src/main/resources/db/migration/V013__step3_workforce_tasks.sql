-- STEP 3: workforce visibility + project task assignment to invited personnel
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assigned_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_user ON tasks(assigned_user_id);

-- Existing worker-level assignment remains supported through assigned_worker_id.
-- New application flows use assigned_user_id so invited WORKER/CONTRACTOR/SITE_ENGINEER/PM accounts
-- can be assigned safely through project_assignments.
