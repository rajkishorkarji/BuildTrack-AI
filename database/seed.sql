-- BuildTrack AI Seed Data

-- 1. Insert Users (Password is BCrypt encoded for 'password123')
INSERT INTO users (full_name, email, password, role, enabled) VALUES
('Vikram Nair', 'vikram@buildtrack.ai', '$2a$10$eD4t0lC1Mh.n.fV5eRzJ2.6l.B1N5bY4jO8v9W/1F1/1F1/1F1/1', 'PROJECT_MANAGER', true),
('Divya Krishnan', 'divya@buildtrack.ai', '$2a$10$eD4t0lC1Mh.n.fV5eRzJ2.6l.B1N5bY4jO8v9W/1F1/1F1/1F1/1', 'SITE_ENGINEER', true),
('Rajkishor Karji', 'rajkishor@buildtrack.ai', '$2a$10$eD4t0lC1Mh.n.fV5eRzJ2.6l.B1N5bY4jO8v9W/1F1/1F1/1F1/1', 'COMPANY_ADMIN', true),
('Robert Fox', 'robert@buildtrack.ai', '$2a$10$eD4t0lC1Mh.n.fV5eRzJ2.6l.B1N5bY4jO8v9W/1F1/1F1/1F1/1', 'CONTRACTOR', true);

-- 2. Insert Projects
INSERT INTO projects (name, location, description, budget, spent_amount, status, start_date, estimated_end_date) VALUES
('Metro Tower Complex', 'Bhubaneswar, Odisha', '32-story commercial complex featuring sustainable structural steel framing.', 162600.00, 132600.00, 'IN_PROGRESS', '2024-01-15', '2025-12-20'),
('Skyview Residency', 'Cuttack, Odisha', 'Luxury residential apartments with smart energy management systems.', 95000.00, 42000.00, 'IN_PROGRESS', '2024-03-01', '2025-08-30'),
('Kalinga Highway Expansion', 'Khurda, Odisha', '4-lane highway expansion with automated toll plazas.', 240000.00, 210000.00, 'ON_HOLD', '2023-06-10', '2025-11-15');

-- 3. Insert Tasks
INSERT INTO tasks (project_id, title, description, assigned_to_user_id, status, priority, progress_percentage, start_date, due_date) VALUES
(1, '02120 Diamond Saw Cutting', 'Precision concrete cutting for Floor 14 riser shafts', 2, 'IN_PROGRESS', 'HIGH', 66, '2025-06-01', '2025-06-25'),
(1, '02190 Core Drilling', 'HVAC ducting penetration through reinforced core walls', 2, 'IN_PROGRESS', 'HIGH', 80, '2025-06-05', '2025-06-30'),
(1, '02298 Mass Excavation', 'Sub-basement level 3 structural soil removal', 1, 'COMPLETED', 'CRITICAL', 100, '2024-01-20', '2024-04-10'),
(2, 'Piling & Foundation Slab', 'Deep pile driving and waterproof concrete pouring', 2, 'IN_PROGRESS', 'HIGH', 45, '2024-03-05', '2024-07-15');

-- 4. Insert Workers
INSERT INTO workers (full_name, phone, skill_trade, daily_wage, qr_code_token, status, assigned_project_id) VALUES
('Rose Smith', '+91 9876543210', 'Senior Mason', 850.00, 'QR-WRK-001', 'ACTIVE', 1),
('Robert Fox', '+91 9876543211', 'Structural Welder', 950.00, 'QR-WRK-002', 'ACTIVE', 1),
('Theresa Webb', '+91 9876543212', 'Electrician', 900.00, 'QR-WRK-003', 'ACTIVE', 1),
('Ronald Richards', '+91 9876543213', 'Heavy Equipment Operator', 1200.00, 'QR-WRK-004', 'ACTIVE', 1),
('Josh Wilson', '+91 9876543214', 'Site Supervisor', 1100.00, 'QR-WRK-005', 'ACTIVE', 2);

-- 5. Insert Attendance
INSERT INTO attendance (worker_id, project_id, check_in, check_out, hours_worked, status) VALUES
(1, 1, CURRENT_TIMESTAMP - INTERVAL '8 hours', CURRENT_TIMESTAMP, 8.0, 'PRESENT'),
(2, 1, CURRENT_TIMESTAMP - INTERVAL '7 hours', CURRENT_TIMESTAMP, 7.0, 'PRESENT'),
(3, 1, CURRENT_TIMESTAMP - INTERVAL '8 hours', CURRENT_TIMESTAMP, 8.0, 'PRESENT'),
(4, 1, CURRENT_TIMESTAMP - INTERVAL '9 hours', CURRENT_TIMESTAMP, 9.0, 'OVERTIME');

-- 6. Insert Equipment
INSERT INTO equipment (project_id, name, category, serial_number, status, daily_cost, last_serviced_date, next_service_due) VALUES
(1, 'Tower Crane CAT-900', 'Heavy Equipment', 'EQ-TC-900', 'OPERATIONAL', 3500.00, '2025-05-10', '2025-08-10'),
(1, 'Hydraulic Excavator EX-200', 'Heavy Equipment', 'EQ-EX-200', 'OPERATIONAL', 2800.00, '2025-04-15', '2025-07-15'),
(2, 'Mobile Concrete Pump 5000', 'Concrete Tools', 'EQ-CP-500', 'IN_MAINTENANCE', 1800.00, '2025-06-01', '2025-06-28');

-- 7. Insert Invoices
INSERT INTO invoices (project_id, invoice_number, vendor_name, category, amount, gst_amount, status, due_date) VALUES
(1, 'INV-2025-001', 'Ultratech Cement Ltd.', 'Raw Materials', 45000.00, 8100.00, 'PAID', '2025-06-15'),
(1, 'INV-2025-002', 'Tata Steel Ltd.', 'Structural Steel', 78000.00, 14040.00, 'APPROVED', '2025-07-05'),
(2, 'INV-2025-003', 'Mahindra Heavy Power', 'Fuel & Generators', 18500.00, 3330.00, 'PENDING', '2025-07-12');

-- 8. Insert AI Insights
INSERT INTO ai_insights (project_id, insight_type, risk_level, risk_score, recommendation) VALUES
(1, 'DELAY_PREDICTION', 'MEDIUM', 34.50, 'Increase concrete curing crew allocation on Floor 14 to mitigate potential 4-day HVAC ducting delay.'),
(1, 'COST_OVERRUN', 'LOW', 12.00, 'Material expense rate is currently within 3% tolerance of target baseline budget.'),
(2, 'PRODUCTIVITY_RECOMMENDATION', 'HIGH', 78.20, 'Mobile Concrete Pump maintenance delay is impeding foundation slab timeline. Re-allocate secondary pump unit immediately.');

-- 9. Insert Notifications
INSERT INTO notifications (title, message, type, is_read) VALUES
('Site Alert: Metro Tower', 'Floor 14 core drilling safety inspection completed successfully.', 'SUCCESS', false),
('Maintenance Reminder', 'Mobile Concrete Pump 5000 scheduled maintenance is pending approval.', 'WARNING', false),
('Budget Update', 'Invoice #INV-2025-002 approved for payment ($78,000 + GST).', 'INFO', true);
