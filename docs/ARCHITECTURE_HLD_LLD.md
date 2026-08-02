# BuildTrack AI - System Architecture Document (HLD & LLD)

## 1. High-Level Design (HLD)

BuildTrack AI follows a modern N-Tier modular architecture designed for high availability and low-latency real-time updates.

```
+-----------------------------------------------------------------------+
|                          CLIENT LAYER                                 |
|   React Single Page Application (Vite + CSS Modules + WebSockets)     |
+--------------------------------──┬────────────────────────────────----+
                                  │ HTTPS REST / WSS (WebSockets)
                                  ▼
+-----------------------------------------------------------------------+
|                        APPLICATION GATEWAY & SECURITY                 |
|   Spring Security (Filter Chain) + JWT Token Parser + CORS Policy     |
+--------------------------------──┬────────────────────────────────----+
                                  │ Direct Dispatch
                                  ▼
+-----------------------------------------------------------------------+
|                        BUSINESS SERVICE MODULES                       |
|   +-------------------+  +-------------------+  +-------------------+ |
|   |  Auth & User Service|  |  Project & Task Svc|  | Workforce & QR Svc| |
|   +-------------------+  +-------------------+  +-------------------+ |
|   |  Equipment Service|  |  Finance Service  |  | Notification Svc  | |
|   +-------------------+  +-------------------+  +-------------------+ |
+--------------------------------──┬──────────────────────────┬─────────+
                                   │                          │
                      Spring JPA   ▼                          ▼ Subprocess / API
+---------------------------------------+   +---------------------------+
|          PERSISTENCE LAYER            |   |      AI / ML SERVICE      |
|    PostgreSQL Relational Storage      |   |   Python Predictive Model |
+---------------------------------------+   +---------------------------+
```

---

## 2. Low-Level Design (LLD)

### 2.1 Backend Package Structure (`backend/src/main/java/com/buildtrack/ai`)
- `config/`: SecurityConfig, CorsConfig, WebSocketConfig.
- `controller/`: REST endpoints for Auth, Projects, Tasks, Workforce, Attendance, Equipment, Finance, AI.
- `dto/`: Request & Response payloads (e.g., `LoginRequest`, `ProjectDTO`, `AttendanceCheckInRequest`).
- `entity/`: JPA entities mapping to relational tables.
- `exception/`: Global Exception Handler (`@RestControllerAdvice`).
- `repository/`: Spring Data JPA Interfaces.
- `security/`: JwtService, JwtAuthFilter, UserDetailsService.
- `service/`: Interfaces and Business Implementation classes.

### 2.2 Frontend Architecture (`frontend/src`)
- `context/`: `ThemeContext` (Dark/Light mode support), `AuthContext` (User session state).
- `layouts/`: `DashboardLayout` (Sidebar + Topbar + Main outlet).
- `pages/`: `Dashboard`, `Projects`, `Workforce`, `Attendance`, `TaskManagement`, `Equipment`, `Finance`, `AIInsights`, `Notifications`, `Reports`, `Documents`, `Login`.
- `styles/`: Custom design tokens (`variables.css`, `dashboard.css`, `globals.css`).
