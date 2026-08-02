# BuildTrack AI - Entity-Relationship Diagram (ERD) Specification

## 1. Schema Diagram (Mermaid)

```mermaid
erDiagram
    USERS ||--o{ PROJECTS : manages
    USERS ||--o{ ATTENDANCE : records
    PROJECTS ||--o{ TASKS : contains
    PROJECTS ||--o{ EQUIPMENT : allocates
    PROJECTS ||--o{ INVOICES : bills
    PROJECTS ||--o{ AI_INSIGHTS : generates
    WORKERS ||--o{ ATTENDANCE : logs
    TASKS ||--o{ WORKERS : assigns

    USERS {
        bigint id PK
        string full_name
        string email UK
        string password
        string role
        boolean enabled
        timestamp created_at
    }

    PROJECTS {
        bigint id PK
        string name
        string location
        double budget
        double spent_amount
        string status
        date start_date
        date estimated_end_date
    }

    TASKS {
        bigint id PK
        bigint project_id FK
        string title
        string description
        string status
        int progress_percentage
        date due_date
    }

    WORKERS {
        bigint id PK
        string full_name
        string skill_trade
        double daily_wage
        string qr_code_token
        string status
    }

    ATTENDANCE {
        bigint id PK
        bigint worker_id FK
        timestamp check_in
        timestamp check_out
        double hours_worked
        string status
    }

    EQUIPMENT {
        bigint id PK
        bigint project_id FK
        string name
        string category
        string status
        double daily_cost
    }

    INVOICES {
        bigint id PK
        bigint project_id FK
        string invoice_number UK
        string vendor_name
        double amount
        double gst_amount
        string status
    }

    AI_INSIGHTS {
        bigint id PK
        bigint project_id FK
        string insight_type
        double risk_score
        string recommendation
    }
```

## 2. Table Summary
- **users**: Authentication credentials, roles (`ADMIN`, `MANAGER`, `ENGINEER`, `WORKER`).
- **projects**: Construction site master data, financial budget caps, status tracking.
- **tasks**: Individual work packages associated with Gantt chart milestones.
- **workers**: Skilled/Unskilled workforce directory with unique QR code payload tokens.
- **attendance**: Clock-in and clock-out timestamps for salary calculation.
- **equipment**: Heavy machinery inventory and maintenance status.
- **invoices**: Vendor billings, payments, and 18% GST audit records.
- **ai_insights**: Machine learning output predictions for delay risk, cost overrun, and worker productivity.
