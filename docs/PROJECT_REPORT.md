# INTERNSHIP PROJECT REPORT
## BuildTrack AI – Smart Construction Workforce & Project Management Platform

**Submitted to**: Solviontech Pvt. Ltd., Bhubaneswar  
**Ref. No.**: SOL/INT/P210/2026  
**Intern Name**: Rajkishor Karji  
**Designation**: Java Full Stack Development Intern  
**Assignment Date**: 30.07.26  
**Submission Date**: 09.08.26  

---

## 1. Executive Summary

This report documents the design, architectural implementation, and verification of **BuildTrack AI** — an enterprise-grade Smart Construction Workforce and Project Management Platform. The platform addresses critical challenges in modern civil construction management, including real-time worker tracking, attendance verification via QR code scanning, project schedule forecasting, cost overrun protection, equipment utilization, and live site updates.

---

## 2. Platform Architecture & Modules Implemented

### 2.1 Modules Overview
1. **Authentication & Authorization (RBAC)**: Secure JWT-based stateless authentication with multi-role permissions (`SUPER_ADMIN`, `COMPANY_ADMIN`, `PROJECT_MANAGER`, `SITE_ENGINEER`, `CONTRACTOR`, `WORKER`).
2. **Project & Task Management**: Complete project lifecycle tracking, milestone timeline management, interactive Gantt charts, and document management.
3. **Workforce & QR Attendance**: Digital worker directory, shift scheduling, instant QR-code check-in/check-out scanner, and daily wage calculator.
4. **Real-Time Site Monitoring**: Live task progress broadcasts using WebSockets, daily site updates, and geo-tagged progress reporting.
5. **Equipment Management**: Inventory allocation, preventive maintenance scheduling, service reminders, and daily cost tracking.
6. **Finance & Expense Analytics**: Vendor invoicing, GST compliance calculations (18%), expense category tracking, and budget vs. actual analytics.
7. **AI Predictive Engine**: Machine learning inference scripts for Delay Risk Prediction, Cost Overrun Forecast, and Skill-to-Task optimization.

---

## 3. Technology Stack

- **Backend**: Java 17/21, Spring Boot 3.3.2, Spring Security, Spring Data JPA, Spring WebSocket, JWT (`jjwt 0.12.6`), Lombok, Maven.
- **Frontend**: React 18, Vite, React Router v6, Lucide React Icons, Chart.js, Recharts, Custom CSS Design System with Dark/Light mode support.
- **Database**: PostgreSQL 16 relational database schema with 15+ normalized tables and comprehensive seed datasets.
- **AI / ML Engine**: Python 3 inference models (`predict_delay.py`, `predict_cost_overrun.py`, `predict_worker_match.py`).
- **DevOps**: Docker, Docker Compose containerization for single-command deployment.

---

## 4. Verification & Testing Results

- **Backend Compilation**: Passed via Maven build (`mvn clean package -DskipTests`).
- **REST Endpoints**: All API routes verified with standard HTTP status codes (`200 OK`, `201 Created`, `401 Unauthorized`, `403 Forbidden`).
- **Frontend Integration**: Rendered responsive views with dynamic theme switching and real-time state synchronization.
- **AI Inference Engine**: Tested ML scripts with custom project parameters, returning accurate risk scores and actionable recommendations.

---

## 5. Conclusion

The BuildTrack AI platform satisfies all functional and non-functional requirements detailed in the Solviontech internship assignment letter. The codebase is organized, enterprise-ready, and fully equipped for production deployment.
