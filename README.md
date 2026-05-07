# 🎓 JiraGit System - Quản Trị Đồ Án Thông Minh 🚀

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Security](https://img.shields.io/badge/Security-JWT%20%2B%20RBAC-red.svg)](https://spring.io/projects/spring-security)

**JiraGit System** là một nền tảng quản trị dự án phần mềm chuyên nghiệp, được tối ưu hóa cho môi trường đào tạo CNTT. Hệ thống cung cấp giải pháp đồng bộ hóa dữ liệu thời gian thực giữa yêu cầu nghiệp vụ (**Jira Cloud**) và quá trình thực thi mã nguồn (**GitHub**).

---

## 🏗️ Kiến Trúc Hệ Thống

Dự án áp dụng mô hình kiến trúc **Clean Architecture** tiên tiến với sự phân chia theo tính năng nghiệp vụ (Feature-based) để tối đa hóa khả năng mở rộng và bảo trì.

### 1. Kiến trúc Backend (Package-by-Layer)
Thay vì chia theo Feature Modules, backend Spring Boot được cấu trúc theo chuẩn phân lớp truyền thống (Layered Architecture):
- **Controllers (`controllers/*`)**: Tiếp nhận request từ frontend và điều hướng.
- **Services (`services/*`)**: Xử lý logic nghiệp vụ, sử dụng Interface và Implementation (`impl/`) rõ ràng.
- **Repositories (`repositories/*`)**: Giao tiếp trực tiếp với cơ sở dữ liệu qua Spring Data JPA.
- **Entities & DTOs (`entities/*`, `dtos/*`)**: Quản lý object mapper và data transfer.
- **Core/Utils (`config/*`, `exceptions/*`, `utils/*`)**: Cấu hình bảo mật JWT, xử lý lỗi toàn cục và các Helper/Adapter tích hợp Jira/GitHub.

### 2. Kiến trúc Frontend (Layered Architecture)
Frontend React 19 cũng đã được tối ưu hóa theo mô hình phân lớp (Layered Architecture) để đồng nhất với Backend:
- **`pages/`**: Chứa toàn bộ các giao diện màn hình (Login, Dashboard, AdminGroups,...).
- **`components/`**: Các UI component tái sử dụng nhiều lần (Layout, Sidebar,...).
- **`services/`**: Quản lý các cấu hình và hàm gọi API giao tiếp với Backend (`api.js`).
- **`contexts/`**: Quản lý state toàn cục qua React Context (AuthContext, UIContext).
- **`assets/` & `styles/`**: Chứa tài nguyên tĩnh (hình ảnh, logo) và các file CSS.
- **Root (`main.jsx`, `App.jsx`)**: Điểm khởi chạy chính của toàn bộ ứng dụng React.


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
| **Database** | Hỗ trợ MySQL và SQL Server (MSSQL) |
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

Dự án hỗ trợ linh hoạt cả **MySQL** và **SQL Server**. Tạo cơ sở dữ liệu có tên `prjAppDB` và cập nhật thông tin trong `backend/src/main/resources/application.properties` tùy theo Database bạn dùng:

**👉 Tùy chọn 1: Sử dụng MySQL (Hiện tại)**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/prjAppDB?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=Toan20032006@
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
```

**👉 Tùy chọn 2: Sử dụng SQL Server**
```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=prjAppDB;encrypt=true;trustServerCertificate=true;
spring.datasource.username=sa
spring.datasource.password=YOUR_PASSWORD
spring.datasource.driverClassName=com.microsoft.sqlserver.jdbc.SQLServerDriver

spring.jpa.database-platform=org.hibernate.dialect.SQLServerDialect
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
