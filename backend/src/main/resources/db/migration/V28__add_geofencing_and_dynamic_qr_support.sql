-- V28: Add geofencing and dynamic QR support

-- 1. Add geofence coordinates and radius to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS geofence_radius_meters DOUBLE PRECISION DEFAULT 150.00;

-- 2. Add GPS capture and verification fields to attendance
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_in_latitude DOUBLE PRECISION;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_in_longitude DOUBLE PRECISION;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_in_distance_meters DOUBLE PRECISION;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS location_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_out_latitude DOUBLE PRECISION;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_out_longitude DOUBLE PRECISION;

-- 3. Add location tracking fields to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS last_updated_latitude DOUBLE PRECISION;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS last_updated_longitude DOUBLE PRECISION;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS location_verified BOOLEAN DEFAULT FALSE;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_lat_lng ON projects(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_attendance_location_verified ON attendance(location_verified);

