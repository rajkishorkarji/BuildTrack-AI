# BuildTrack AI - Step 4 Attendance

Step 4 builds directly on Step 3 and makes attendance PostgreSQL-backed and tenant/role aware.

## Flow
React -> Nginx -> Gateway -> Spring Security/JWT -> AttendanceController -> AttendanceService -> AttendanceRepository -> Hibernate/JPA -> PostgreSQL.

Attendance mutations publish a domain event to Kafka and a company-scoped realtime event to WebSocket.

## Supported actions
- Worker check-in for an assigned project.
- Worker check-out.
- QR-token check-in for a worker.
- Company Admin attendance visibility and verification.
- Project Manager attendance visibility and verification for assigned projects.
- Site Engineer QR check-in, check-out and verification for assigned projects.
- Contractor attendance visibility for assigned projects.
- Worker self attendance history.
- Duplicate same-day/open-session protection.
- Hours worked calculation on checkout.
- Overtime status when a session exceeds eight hours.

## Ownership rules
- Company Admin can view/verify attendance inside their company.
- Project Manager/Site Engineer/Contractor can act only inside assigned projects.
- Worker can manage only their own attendance.
- Worker QR token is linked to the worker account.
- Cross-company attendance access is rejected.

## Database
Migration: `database/migrations/014_step4_attendance.sql`

Adds `workers.user_id` so an invited WORKER account maps to one workforce profile, plus attendance indexes.
