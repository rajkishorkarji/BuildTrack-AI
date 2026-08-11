ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_size_bytes BIGINT;
CREATE INDEX IF NOT EXISTS idx_documents_project_created ON documents(project_id, created_at DESC);
