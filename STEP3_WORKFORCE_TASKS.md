# Step 3 — Workforce + Task Management

Built on Step 2.

## Workforce
- `/api/workforce` returns only personnel visible to the authenticated tenant/assigned projects.
- Company Admin sees active personnel in the company.
- Project Manager/Site Engineer/Contractor/Worker see workforce from their assigned projects.
- Only Company Admin invitation endpoint creates organizational personnel accounts.

## Tasks
- Tasks belong to projects.
- Tasks may be assigned to an invited project member through `assigned_user_id`.
- Assignees must belong to the same company and be actively assigned to the project.
- Company Admin and assigned project managers/site engineers/contractors can create tasks according to role policy.
- Assigned workers/personnel can update progress on their tasks.
- Task reads are tenant/project scoped.

## Data flow
React → Nginx → Gateway → Spring Security/JWT → Controller → Service → Repository → Hibernate/JPA → PostgreSQL

Project/task mutations publish Kafka domain events and company-scoped realtime events.
