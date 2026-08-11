# BuildTrack AI enhancement notes

## Final technology scope

Only these requested runtime technologies are part of this enhancement:

- React
- Nginx
- Spring Cloud Gateway
- Spring Boot / Spring Security
- JWT
- Spring MVC Controller → Service → Repository → Hibernate/JPA → PostgreSQL
- Kafka
- WebSocket/STOMP
- Razorpay
- Email via Spring Mail for invitations

No MongoDB, Redis, Redux Toolkit, Material UI, Chart.js, Cloudinary, Jenkins or AWS deployment is added to this enhancement.

## Authentication

1. React submits `/api/auth/login` through Nginx.
2. Nginx proxies `/api/*` to Gateway.
3. Gateway proxies to the Spring Boot API.
4. Spring Security JWT filter validates the bearer token on protected requests.
5. Controller calls the service.
6. Service checks role and tenant ownership.
7. Repository loads tenant-scoped data from PostgreSQL.

Public organizational signup is disabled. `/api/public/company-registration` is only a company registration request; it does not create a login account.

## Company Admin invitation rule

Only a JWT-authenticated `COMPANY_ADMIN` can call:

`POST /api/company/personnel/invitations`

Allowed roles:

- PROJECT_MANAGER
- SITE_ENGINEER
- CONTRACTOR
- WORKER

The invitation is stored in PostgreSQL with a random token and 24-hour expiry. Email contains the invitation URL. Accepting the URL creates a new personnel account or activates the disabled Company Admin account created by Super Admin.

## Role sidebars

| Role | Sidebar features |
|---|---|
| SUPER_ADMIN | Dashboard, Companies, Projects, Workforce, Finance, AI Insights, Reports, Notifications, Users, Settings |
| COMPANY_ADMIN | Dashboard, Projects, Workforce, Attendance, Task Management, Equipment, Finance, Reports, Documents, Notifications, AI Insights, Settings |
| PROJECT_MANAGER | Dashboard, Projects, Task Management, Team, Daily Logs, Equipment, Reports, Documents, Notifications, Settings |
| SITE_ENGINEER | Dashboard, Daily Logs, Attendance, Equipment, Materials, Issues, Documents, Notifications, Settings |
| CONTRACTOR | Dashboard, Assigned Projects, Team, Attendance, Tasks, Materials, Issues, Documents, Notifications, Settings |
| WORKER | Dashboard, Tasks, Attendance, Equipment, Materials, Documents, Notifications, Settings |

## Kafka + WebSocket

Database-backed business events can publish to the Kafka `buildtrack.domain.events` topic. The notification consumer persists notification records. WebSocket publishes tenant-scoped updates to `/topic/company/{companyId}/...` so one company does not receive another company's live events.

## Razorpay

`POST /api/payments/razorpay/order` is Company Admin only. Amounts are INR and converted to paise for Razorpay. The browser opens Razorpay Checkout using the returned order id. Razorpay calls `/api/payments/razorpay/webhook`; the server verifies `X-Razorpay-Signature`, updates the payment record, and for `SUBSCRIPTION` payments activates the company's subscription.

## Important production rule

Do not commit JWT secrets, mail passwords, Razorpay secrets or other credentials. Use environment variables in every deployment.

## Current validation limitation

The environment used to prepare this archive does not have Maven installed, so a full Spring Boot compilation could not be executed here. Frontend build validation is also blocked by the uploaded project's existing Rollup optional-dependency installation issue. Run `mvn clean verify` and `npm ci && npm run build` in your local development environment before deployment.
