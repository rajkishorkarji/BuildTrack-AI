# BuildTrack AI — Enhanced Architecture

This version keeps only the requested stack and business flows:

```text
React
  ↓
Nginx
  ↓
Spring Cloud Gateway
  ↓
Spring Security
  ↓
JWT verification
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Hibernate/JPA
  ↓
PostgreSQL
```

Event flow:

```text
User action
   ↓
Spring Boot
   ↓
PostgreSQL
   ↓
Kafka
   ├── Notification consumer
   └── AI/analytics event consumers can be added here
   ↓
WebSocket
   ↓
Tenant-scoped React dashboard
```

Payment flow:

```text
React
 ↓
Spring Boot
 ↓
Razorpay order API
 ↓
Razorpay Checkout
 ↓
Payment
 ↓
Razorpay webhook
 ↓
Signature verification
 ↓
PostgreSQL
 ↓
Kafka event
 ↓
WebSocket / UI refresh
```

## Role hierarchy

```text
SUPER_ADMIN
    ↓ creates/approves companies
COMPANY_ADMIN
    ↓ invites only
PROJECT_MANAGER
SITE_ENGINEER
CONTRACTOR
WORKER
```

Public signup for organizational users is disabled. Company Admin is the only role allowed to create invitations for the four delivery roles.

## Company Admin invitation endpoint

`POST /api/company/personnel/invitations`

Request:

```json
{
  "fullName": "Amit Kumar",
  "email": "amit@example.com",
  "role": "PROJECT_MANAGER"
}
```

Allowed roles:

- PROJECT_MANAGER
- SITE_ENGINEER
- CONTRACTOR
- WORKER

The backend checks the authenticated JWT, role, tenant, subscription and duplicate email before creating a 24-hour invitation and sending the email.

## Frontend role sidebars

### Super Admin
Dashboard, Companies, Projects, Workforce, Finance, AI Insights, Reports, Notifications, Users, Settings.

### Company Admin
Dashboard, Projects, Workforce, Attendance, Task Management, Equipment, Finance, Reports, Documents, Notifications, AI Insights, Settings.

### Project Manager
Dashboard, Projects, Task Management, Team, Daily Logs, Equipment, Reports, Documents, Notifications, Settings.

### Site Engineer
Dashboard, Daily Logs, Attendance, Equipment, Materials, Issues, Documents, Notifications, Settings.

### Contractor
Dashboard, Assigned Projects, Team, Attendance, Tasks, Materials, Issues, Documents, Notifications, Settings.

### Worker
Dashboard, Tasks, Attendance, Equipment, Materials, Documents, Notifications, Settings.

## No fake business source

Business data must come from PostgreSQL through Spring Boot. Authentication state may be kept client-side, but projects, workforce, attendance, tasks, finance, notifications and AI results must not use localStorage as a database.

## Run locally

1. Start PostgreSQL and Kafka with Docker Compose.
2. Configure `.env` from `.env.example`.
3. Build backend and gateway with Maven.
4. Run frontend with Vite, or build the frontend Docker image.
5. Use Nginx as the public entry point.

For production, use strong secrets, HTTPS and a managed PostgreSQL/Kafka deployment or appropriately secured infrastructure.


## Step 5
Equipment and Materials are now backed by PostgreSQL with project/tenant authorization, maintenance history, stock transactions, Kafka events, and company-scoped WebSocket updates.
