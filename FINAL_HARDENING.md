# BuildTrack AI — Final Hardening

This checkpoint is the cumulative codebase through Step 10.

## Security and data-flow rules

- No public company registration. Companies are created by SUPER_ADMIN.
- Only COMPANY_ADMIN can invite PROJECT_MANAGER, SITE_ENGINEER, CONTRACTOR, and WORKER.
- PostgreSQL is the business source of truth.
- Spring Security + JWT + tenant checks enforce backend authorization.
- Kafka is used for domain events; WebSocket is used for realtime delivery.
- Razorpay amounts are determined by the backend.
- Business secrets are supplied through environment variables.

## Database

Flyway now executes `database/migrations` copied into `backend/src/main/resources/db/migration`. Hibernate uses `validate` by default so schema drift fails fast instead of silently changing production tables.

## Run locally

1. Create `.env` from `.env.example` and provide strong secrets.
2. Start PostgreSQL and Kafka with `docker compose up -d database kafka`.
3. Start the backend with Maven.
4. Start the gateway.
5. Start the frontend.

## Production

The intended request path is:

React → Nginx → Spring Cloud Gateway → Spring Security/JWT → Controller → Service → Repository → Hibernate/JPA → PostgreSQL.

Domain changes persist first, then publish Kafka events. Realtime notifications are delivered through tenant-scoped WebSocket channels and private user queues.
