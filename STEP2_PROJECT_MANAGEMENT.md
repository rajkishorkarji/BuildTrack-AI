# BuildTrack AI — Step 2: Project Management

This step is cumulative on top of Step 1.

## Business rule
Only COMPANY_ADMIN (and SUPER_ADMIN for platform support) can create projects and assign project personnel.

Allowed project assignments:
- PROJECT_MANAGER
- SITE_ENGINEER
- CONTRACTOR
- WORKER

## Data flow
React -> Nginx -> Spring Cloud Gateway -> Spring Security/JWT -> ProjectController -> ProjectService -> JPA Repository -> PostgreSQL

Project mutations also publish:
- Kafka domain events
- company-scoped WebSocket events

## New endpoints
- GET /api/projects
- GET /api/projects/{id}
- POST /api/projects
- PUT /api/projects/{id}
- DELETE /api/projects/{id}
- GET /api/projects/{id}/assignments
- POST /api/projects/{id}/assignments
- DELETE /api/projects/{id}/assignments/{userId}
- GET /api/projects/eligible-users?role=PROJECT_MANAGER

## Tenant rules
- Super Admin: all projects.
- Company Admin: all projects in their company.
- Project Manager/Site Engineer/Contractor/Worker: only assigned projects.
- A user from another company can never be assigned to a project.
- A user must already have the selected role before assignment.

## Database
Migration: database/migrations/012_create_project_assignments.sql
