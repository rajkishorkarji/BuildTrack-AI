# BuildTrack AI

BuildTrack AI is a role-based construction operations platform for managing project delivery, workforce attendance, site activity, equipment, finance, documents, and AI-assisted risk signals.

## Core workflows

- Secure access: JWT access and refresh tokens, email verification, password reset, Google OAuth, and six-role RBAC.
- Project delivery: project status, budget, task progress, document records, milestones, and a Project Manager Gantt timeline.
- Site operations: QR attendance, check-in/out verification, daily progress, real-time WebSocket updates, and geo-ready attendance/report data.
- Business operations: equipment status and maintenance records, invoices, payments, GST values, notifications, reports, and AI insight records.

## Technology

| Layer | Current implementation |
| --- | --- |
| Frontend | React 18, Vite, Axios, responsive CSS, Lucide UI, native STOMP WebSocket client |
| Backend | Java 21, Spring Boot 3, Spring Security, JPA/Hibernate, WebSocket/STOMP, JWT, OAuth2 |
| Data | PostgreSQL migrations with indexed relational tables; AI/ML Python inference utilities |
| Local runtime | Docker Compose PostgreSQL service |

Kafka, Redis, MongoDB, Spring Cloud Gateway, Cloudinary, Razorpay, and Google Maps are intentionally integration-ready roadmap items rather than declared as working dependencies. Add them only with the related service, configuration, credentials, and operational ownership in place.

## Run locally

1. Start PostgreSQL with `docker compose up -d database`.
2. Apply the SQL files in `database/migrations` in numerical order for a clean database.
3. In `backend`, configure `application.properties` or environment variables, then run `mvn spring-boot:run`.
4. In `frontend`, copy `.env.example` to `.env`, then run `npm install` and `npm run dev`.

The frontend reads the REST API from `VITE_API_BASE_URL` and live events from `VITE_WS_URL`.

## Verification

```powershell
cd backend; mvn test -q
cd ../frontend; npm run build
```

See [database table reference](docs/DATABASE_TABLES.md) for the table-to-module mapping.
