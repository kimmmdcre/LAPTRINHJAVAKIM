# Hệ Thống Quản Lý Dự Án Sinh Viên

Dự án gồm 2 phần: **Backend** (Java Spring Boot) và **Frontend** (NodeJS).

---

## 📁 Cấu Trúc Dự Án

```
LAPTRINHJAVAKIM/
├── backend/        ← Spring Boot REST API (Java 21, SQL Server)
└── frontend/       ← NodeJS Frontend (đang phát triển)
```

---

## ⚙️ Backend (`/backend`)

### Công nghệ
- Java 21 + Spring Boot 3.5
- Spring Data JPA + Hibernate
- SQL Server (localhost:1433)
- Lombok, WebFlux (WebClient)

### Cách chạy
```bash
cd backend
mvn spring-boot:run
```
Server khởi động tại: `http://localhost:8080`

> **Lưu ý:** Tạo database `prjAppDB` trên SQL Server trước khi chạy.  
> Kiểm tra mật khẩu SA trong `backend/src/main/resources/application.properties`.

### Cấu trúc package

```
JAVAGROUP.prjApp
├── adapter/        # GitHubAdapter, JiraAdapter (WebClient)
├── controller/     # 7 REST Controllers + GlobalExceptionHandler
├── dto/            # 9 Data Transfer Objects
├── entity/         # 10 JPA Entities
├── repository/     # 10 JpaRepository interfaces
└── service/        # 7 Service classes (business logic)
```

### REST API Endpoints

| Controller      | Base URL          | Chức năng                        |
|-----------------|-------------------|----------------------------------|
| AuthController  | `/api/auth`       | Đăng nhập, đăng xuất            |
| UserController  | `/api/users`      | Quản lý tài khoản, phân quyền   |
| GroupController | `/api/groups`     | Quản lý nhóm, thành viên        |
| TaskController  | `/api/tasks`      | Yêu cầu (Jira), nhiệm vụ        |
| ConfigController| `/api/config`     | Cấu hình Jira & GitHub          |
| SyncController  | `/api/sync`       | Đồng bộ dữ liệu từ Jira/GitHub  |
| ReportController| `/api/reports`    | Báo cáo tiến độ, thống kê       |

---

## 🖥️ Frontend (`/frontend`)

> Đang phát triển — NodeJS

---

## 👥 Nhóm phát triển

- **Backend:** Java Spring Boot
- **Frontend:** NodeJS
- **Database:** SQL Server
