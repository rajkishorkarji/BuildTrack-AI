# Database table reference

The SQL migrations in `database/migrations` are the source of truth for a fresh PostgreSQL database.

| Module | Primary tables | Supporting tables |
| --- | --- | --- |
| Identity and RBAC | `users`, `roles`, `permissions` | `user_roles`, `role_permissions`, `refresh_tokens`, `email_verification_tokens`, `password_reset_tokens` |
| Tenant and project management | `companies`, `projects` | `project_milestones` |
| Workforce | `workers`, `attendance` | `shifts`, `worker_performance` |
| Live site execution | `tasks`, `notifications`, `reports` | `site_images` |
| Equipment | `equipment` | `equipment_maintenance` |
| Finance | `finances`, `invoices`, `payments` | — |
| Documents | `documents` | `site_images` |
| AI | `ai_insights` | — |

All operational tables use PostgreSQL foreign keys and indexes for their common ownership and timeline queries. Status values are stored as strings so the Spring enum-backed entities can evolve without database enum migrations.
