# 🎓 JiraGit System - Quản Trị Đồ Án Thông Minh 🚀

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Security](https://img.shields.io/badge/Security-JWT%20%2B%20RBAC-red.svg)](https://spring.io/projects/spring-security)

**JiraGit System** là một nền tảng quản trị dự án phần mềm chuyên nghiệp, được tối ưu hóa cho môi trường đào tạo CNTT. Hệ thống cung cấp giải pháp đồng bộ hóa dữ liệu thời gian thực giữa yêu cầu nghiệp vụ (**Jira Cloud**) và quá trình thực thi mã nguồn (**GitHub**).

---

## 🏗️ Kiến Trúc Hệ Thống

Dự án áp dụng mô hình kiến trúc **Clean Architecture** tiên tiến với sự phân chia theo tính năng nghiệp vụ (Feature-based) để tối đa hóa khả năng mở rộng và bảo trì.

### 1. Kiến trúc Backend (Package-by-Feature)
Thay vì chia theo tầng kỹ thuật (Controller, Service, Repository), backend Spring Boot được cấu trúc theo các **Feature Modules**:
- **Core (`core/*`)**: Chứa các cấu hình lõi (Security, Global Exceptions, Filters) dùng chung cho toàn dự án.
- **Features (`features/*`)**: Mỗi domain nghiệp vụ (VD: `auth`, `users`, `tasks`, `groups`, `reports`) là một module độc lập. Mọi Controller, Service, Entity, DTO, Repository của nghiệp vụ đó đều nằm gọn trong thư mục tương ứng.
- **Tầng Bảo mật & Xác thực**: Sử dụng Spring Security 6 với JWT (Stateless) và RBAC (Role-Based Access Control).
- **Tích hợp ngoại vi (Adapter Pattern)**: Các class giao tiếp API với Jira/GitHub được gói gọn trong thư mục `adapters/` của feature `tasks`.

### 2. Kiến trúc Frontend (Feature-Sliced Design)
Frontend React 19 sử dụng mô hình FSD (Feature-Sliced Design) chia rạch ròi các ranh giới:
- **`app/`**: Chứa entry points (`main.jsx`, `App.jsx`) và css toàn cục.
- **`shared/`**: Các UI components cơ bản, contexts, và helper functions dùng chung (ví dụ: `api.js`, `Sidebar.jsx`, `AuthContext`).
- **`features/`**: Nơi chứa logic cốt lõi. Mỗi tính năng (`auth`, `dashboard`, `tasks`,...) đều đóng gói riêng các `pages` và `components` của nó.


---

## 🌟 Chức Năng Nổi Bật

### 📂 Quản Lý Đặc Tả (Jira Integration)

- **Real-time Sync**: Tự động kéo Issues/Tasks từ Jira Cloud về hệ thống nội bộ.
- **SRS Automation**: Tự động kết xuất tài liệu **Software Requirements Specification (SRS)** chuyên nghiệp (Word format) chỉ với 1 click.
- **Task Mapping**: Quản lý trạng thái Task đồng bộ với Workflow của Jira.

### 💻 Theo Dõi Phát Triển (GitHub Sync)

- **Commit Tracking**: Quét lịch sử commit qua GitHub API để đánh giá mức độ chuyên cần của thành viên.
- **Smart Association**: Tự động liên kết Commit vào Task dựa trên Issue Key (ví dụ: `PROJ-123`).
- **Activity Heatmap**: Biểu đồ nhiệt hiển thị cường độ đóng góp code theo thời gian.

### 📊 Dashboard & Báo Cáo

- **Tiến độ dự án**: Biểu đồ Area Chart và hình ảnh trực quan về trạng thái hoàn thành.
- **Báo cáo đóng góp**: Xuất báo cáo tổng hợp (PDF/Excel) chi tiết cho từng thành viên, phục vụ việc đánh giá cuối kỳ.

### 🔐 Bảo Mật (RBAC)

Hệ thống sử dụng **Spring Security 6** kết hợp **JWT** để phân quyền:

- **ADMIN**: Quản trị hệ thống, người dùng và thiết lập kết nối API toàn cục.
- **TEACHER**: Quản lý lớp học, theo dõi tiến độ các nhóm và xuất báo cáo tổng kết.
- **STUDENT**: Xem nhiệm vụ, theo dõi đóng góp cá nhân và xuất tài liệu SRS của nhóm.

---

## 🛠️ Stack Công Nghệ

| Thành phần | Công nghệ sử dụng |
| :--- | :--- |
| **Backend** | Spring Boot 3.2.5, Java 21, Spring Security, JWT |
| **Database** | SQL Server (MSSQL) |
| **Adapters** | WebClient (Reactive HTTP) cho Jira/GitHub API |
| **Reporting** | Apache POI (Word), OpenPDF (PDF), OpenCSV |
| **Frontend** | React 19, Vite, Vanilla CSS |
| **Icons & Charts** | Lucide-React, Recharts |

---

## 🚦 Hướng Dẫn Cài Đặt

### 1. Yêu cầu hệ thống

- **JDK 21** trở lên.
- **Node.js** (v18+) & **npm**.
- **SQL Server** đang hoạt động.

### 2. Thiết lập Database

Tạo cơ sở dữ liệu có tên `prjAppDB` và cập nhật thông tin trong `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=prjAppDB;encrypt=true;trustServerCertificate=true;
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

### 3. Chạy ứng dụng

**Backend:**

```bash
cd backend
mvn spring-boot:run
```

*Swagger UI: `http://localhost:8080/swagger-ui/index.html`*

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

*Cổng mặc định: `http://localhost:5173`*

---

## 👥 Nhóm Phát Triển - Kimmmdcre

Dự án được xây dựng với tâm huyết mang lại một công cụ quản lý dự án chuẩn chỉnh cho sinh viên.
