# BuildTrack AI - Requirements Specification Document

## 1. Executive Summary
**Project Title**: BuildTrack AI - Smart Construction Workforce & Project Management Platform
**Organization**: Solviontech Pvt. Ltd.
**Intern**: Rajkishor Karji (Java Full Stack Development Intern)

BuildTrack AI is an enterprise-level platform enabling project managers, site engineers, contractors, and workers to collaborate on construction site activities in real-time.

---

## 2. Functional Requirements

### Module 1: Authentication & Authorization (RBAC)
- **FR-1.1**: JWT-based stateless authentication with Refresh Tokens.
- **FR-1.2**: Role-Based Access Control (RBAC) supporting 6 roles:
  1. `SUPER_ADMIN`: Full system management.
  2. `COMPANY_ADMIN`: Company tenant setup and workforce oversight.
  3. `PROJECT_MANAGER`: Project creation, timeline management, budget allocation.
  4. `SITE_ENGINEER`: Live task logging, site image uploads, worker verification.
  5. `CONTRACTOR`: Sub-contractor equipment and invoice management.
  6. `WORKER`: Shift check-in via QR code, daily wage view.

### Module 2: Project & Task Management
- **FR-2.1**: Project lifecycle management (Creation, Milestones, Status: `PLANNED`, `IN_PROGRESS`, `DELAYED`, `COMPLETED`).
- **FR-2.2**: Interactive Gantt chart dataset generation and dependency tracking.
- **FR-2.3**: Document attachment per project (blueprints, site permits).

### Module 3: Workforce & QR Attendance Management
- **FR-3.1**: Worker registration with skill tag, daily rate, and unique QR code string.
- **FR-3.2**: QR-code based instant check-in/check-out for site attendance.
- **FR-3.3**: Automated daily/weekly salary calculation based on clock-in hours.

### Module 4: Real-Time Site Monitoring & WebSockets
- **FR-4.1**: Live task progress update broadcast via WebSocket (`/topic/site-updates`).
- **FR-4.2**: Site alert notifications and geo-tagged progress reports.

### Module 5: Equipment Management
- **FR-5.1**: Equipment tracking (Cranes, Excavators, Concrete Mixers) with operational status.
- **FR-5.2**: Service reminder alerts and daily operational cost tracking.

### Module 6: Finance & Expense Analytics
- **FR-6.1**: Invoice generation, vendor payment logs, GST calculation (18%).
- **FR-6.2**: Expense tracking versus allocated project budgets.

### Module 7: AI Predictive Analytics
- **FR-7.1**: ML-driven project delay risk prediction (% probability of delay).
- **FR-7.2**: Cost overrun prediction based on milestone burn rate.
- **FR-7.3**: Worker productivity scoring and skill matching recommendation engine.

---

## 3. Non-Functional Requirements
- **NFR-1 Security**: Passwords hashed using BCrypt (cost factor 10). CORS enabled for authorized origins.
- **NFR-2 Performance**: REST endpoints response time < 200ms. WebSocket latency < 50ms.
- **NFR-3 Responsiveness**: Mobile and Desktop compliant responsive design using CSS Grid/Flexbox.
