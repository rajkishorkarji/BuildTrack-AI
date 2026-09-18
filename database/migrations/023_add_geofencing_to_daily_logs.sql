-- V29: Add geofencing and physical verification support to daily logs / DPR

ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS distance_meters DOUBLE PRECISION;
ALTER TABLE daily_logs ADD COLUMN IF NOT EXISTS location_verified BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_daily_logs_location_verified ON daily_logs(location_verified);
