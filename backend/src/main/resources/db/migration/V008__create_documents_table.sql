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
