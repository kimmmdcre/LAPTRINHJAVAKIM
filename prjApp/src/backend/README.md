# Hệ Thống Quản Lý Dự Án Sinh Viên

Dự án gồm 2 phần: **Backend** (Java Spring Boot) và **Frontend** (NodeJS).

---

## 📁 Cấu Trúc Dự Án

```
LAPTRINHJAVAKIM/
├── backend/        ← Spring Boot REST API (Java 21, SQL Server)
└── frontend/       ← NodeJS (Express + EJS + layouts/partials/sections)
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
| AuthController  | `/api/auth`       | Đăng nhập, `/me`, đăng xuất     |
| UserController  | `/api/users`      | Quản lý tài khoản (ADMIN)        |
| GroupController | `/api/groups`     | Nhóm, thành viên, `.../members`  |
| TaskController  | `/api/tasks`      | Yêu cầu, nhiệm vụ, gán task      |
| ConfigController| `/api/config`     | Cấu hình Jira & GitHub          |
| SyncController  | `/api/sync`       | Đồng bộ dữ liệu từ Jira/GitHub  |
| ReportController| `/api/reports`    | Báo cáo tiến độ, thống kê       |

### Bảo mật (JWT + phân quyền)

- Mọi API (trừ `POST /api/auth/login`) cần header: `Authorization: Bearer <token>`.
- JWT ký HS256, claim `role`: `ADMIN` | `GIANG_VIEN` | `TRUONG_NHOM` | `THANH_VIEN` (map từ `ma_vai_tro`).
- Mật khẩu lưu **BCrypt**; tài khoản seed cũ (plain text) vẫn đăng nhập được nhờ tương thích ngược.
- Script tài khoản + nhóm demo: `backend/sql/seed_test_users.sql`, `backend/sql/seed_demo_project.sql`.

---

## 🖥️ Frontend (`/frontend`)

### Công nghệ
- NodeJS + Express
- EJS template engine
- Vanilla JS (fetch API)

### Cách chạy
```bash
cd frontend
npm install
npm start
```

Frontend khởi động tại: `http://localhost:3000`

### Chức năng hiện có
- Đăng nhập (username/password) — tự chuyển trang theo role từ backend
- Dashboard tách theo vai trò (`/admin`, `/giang-vien`, …)
- Thao tác API user / nhóm / task / tích hợp / báo cáo
- Giao diện dashboard (sidebar, topbar, section cards, bảng/JSON kết quả)

---

## 👥 Nhóm phát triển

- **Backend:** Java Spring Boot
- **Frontend:** NodeJS
- **Database:** SQL Server
