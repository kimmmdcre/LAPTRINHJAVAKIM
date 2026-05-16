# 🎓 JiraGit Pro - Integrated Project Management System 🚀

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Java](https://img.shields.io/badge/Java-21%2F25-orange.svg)](https://www.oracle.com/java/)
[![Security](https://img.shields.io/badge/Security-JWT%20%2B%20RBAC-red.svg)](https://spring.io/projects/spring-security)
[![License](https://img.shields.io/badge/Status-Internationalized-blue.svg)](#)

**JiraGit Pro** is a professional software project management platform designed to bridge the gap between business requirements (**Jira Cloud**) and source code execution (**GitHub**). The system empowers Teachers in monitoring progress and Students in automating technical documentation.

---

## 🌟 Key Features

### 🔄 Multi-Platform Synchronization
- **Jira Cloud Sync**: Automatically fetch Issues, Tasks, and Sub-tasks. Real-time status tracking.
- **GitHub Commit Tracker**: Scans commit history, automatically linking source code to tasks via Issue Keys (e.g., `PROJ-1`).
- **Data Mapping**: Intelligent algorithms to reconcile actual workload versus planned tasks on Jira.

### 📄 Document Automation (Report Studio)
- **SRS Generator**: Export professional Software Requirement Specification (PDF) documents in seconds.
- **Unified PDF Export**: All progress reports and contribution summaries are standardized in high-quality **PDF** format with premium styling.
- *Note: Legacy Excel exports have been removed to maintain professional document standards.*

### 🧑‍💼 Advanced Management
- **Security First**: 100% English-based backend messaging and logging for professional maintainability.
- **Leader Assignment**: Intuitive interface for assigning Group Leaders, integrated with RBAC.
- **JWT Hardening**: Secure token management with blacklisting capabilities and stateless session policy.

---

## 🛠️ Technology Stack & Optimization

| Component | Technology | Technical Notes |
| :--- | :--- | :--- |
| **Backend** | Spring Boot 3.2.5, Java 21+ | Optimized DTO-based architecture with clean separation of concerns. |
| **Security** | Spring Security 6 & JWT | Standardized RBAC (ADMIN, TEACHER, STUDENT) with encrypted passwords (BCrypt). |
| **Core Libraries**| **Lombok 1.18.40** | Specialized patch supporting JDK 21/25 features. |
| **Reporting** | **OpenPDF 2.0.3** | Secure and stable PDF generation (Replacement for Apache POI). |
| **API Docs** | **SpringDoc OpenAPI** | Interactive API documentation available at `/swagger-ui.html`. |
| **Frontend** | React 19, Vite, Vanilla CSS | Premium **Apple-style** (Glassmorphism) UI design. |

---

## 🚦 Quick Start Guide

### 1. System Requirements
- **JDK 21** or higher (Temurin or Oracle JDK recommended).
- **Node.js v18+**.
- **Database**: SQL Server 2019+ (or MySQL 8.0+).

### 2. Database Configuration
Create a database named `prjAppDB`. Configure credentials in `backend/src/main/resources/application.properties`:

```properties
# SQL Server Configuration
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=prjAppDB
spring.datasource.username=sa
spring.datasource.password=YOUR_PASSWORD
```

### 3. Launching the System

**Start Backend:**
```bash
cd backend
./mvnw spring-boot:run
```
*Access API Docs: http://localhost:8080/swagger-ui.html*

**Start Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Default Access Accounts
The system includes a pre-configured Data Seed. Default passwords are **identical to usernames**:

| Role | Username | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin` | `admin` |
| **Teacher** | `teacher` | `teacher` |
| **Group Leader** | `leader` | `leader` |
| **Group Member** | `member` | `member` |
| **Student** | `student1` | `student1` |

---

## 📂 Project Structure
```text
LAPTRINHJAVAKIM/
├── backend/            # Spring Boot Project (REST API)
│   ├── src/main/java/  # Clean Architecture (Controller, Service, Repository, Entity, DTO)
│   ├── src/main/resources/ # Configuration & Templates
│   └── pom.xml         # Dependency Management (Optimized)
├── frontend/           # React Vite Project (SPA)
│   ├── src/pages/      # High-end UI Components
│   └── src/services/   # API Integration Layer
└── README.md           # This documentation
```

---

## 👥 Development Team
This system is optimized for academic training and IT project management.
© 2026 JiraGit Pro Team.
