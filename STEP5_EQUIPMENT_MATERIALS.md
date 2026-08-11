# BuildTrack AI — Step 5: Equipment + Materials

Step 5 is cumulative on Step 4.

## Equipment
- Company Admin registers equipment against a real project.
- Equipment has category, serial number, daily INR cost and lifecycle status.
- Company Admin assigns equipment to a user who is actively assigned to the same project.
- Company Admin, Project Manager, Site Engineer and Contractor can change status according to backend authorization.
- Company Admin and Site Engineer can create maintenance records.
- Equipment visibility is tenant/project scoped.

## Materials
- Materials belong to a real project.
- Company Admin and Site Engineer can create inventory records.
- Company Admin, Site Engineer and Contractor can receive stock.
- Company Admin, Site Engineer, Contractor and Worker can issue stock.
- Stock cannot go below zero.
- LOW_STOCK is calculated from reorder level.
- Every receipt/issue is persisted in material_transactions.

## Data flow
React -> Nginx -> Gateway -> Spring Security/JWT -> Controller -> Service -> Repository -> Hibernate/JPA -> PostgreSQL.

Equipment/material mutations publish Kafka domain events and company-scoped WebSocket updates.

## Migration
`database/migrations/015_step5_equipment_materials.sql`
