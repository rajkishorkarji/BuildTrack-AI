-- BuildTrack AI reference seed.
-- Business records are intentionally NOT seeded; create them through the application workflows.

INSERT INTO roles (role_name) VALUES
('SUPER_ADMIN'),
('COMPANY_ADMIN'),
('PROJECT_MANAGER'),
('SITE_ENGINEER'),
('CONTRACTOR'),
('WORKER')
ON CONFLICT (role_name) DO NOTHING;

INSERT INTO permissions (permission_name, description) VALUES
('DASHBOARD_VIEW','View role dashboard'),
('PROJECT_VIEW','View permitted projects'),
('PROJECT_MANAGE','Create and manage permitted projects'),
('TASK_MANAGE','Manage permitted tasks'),
('WORKFORCE_VIEW','View permitted workforce'),
('WORKFORCE_MANAGE','Manage permitted workforce'),
('ATTENDANCE_MARK','Mark and view permitted attendance'),
('SHIFT_MANAGE','Manage shifts'),
('EQUIPMENT_VIEW','View permitted equipment'),
('EQUIPMENT_MANAGE','Manage permitted equipment'),
('FINANCE_VIEW','View permitted finance data'),
('FINANCE_MANAGE','Manage permitted finance data'),
('AI_VIEW','View permitted AI insights'),
('REPORT_VIEW','View permitted reports'),
('DOCUMENT_VIEW','View permitted documents'),
('DOCUMENT_MANAGE','Manage permitted documents'),
('NOTIFICATION_VIEW','View permitted notifications'),
('COMPANY_ADMIN_MANAGE','Manage company administration'),
('SYSTEM_ADMIN_MANAGE','Manage platform administration'),
('PROFILE_EDIT','Edit own profile')
ON CONFLICT (permission_name) DO NOTHING;
