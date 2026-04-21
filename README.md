# 🎓 Student Project Management System (JiraGit Integration) 🚀

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Security](https://img.shields.io/badge/Security-JWT%20%2B%20RBAC-red.svg)](https://spring.io/projects/spring-security)
[![Swagger](https://img.shields.io/badge/API-Swagger--UI-blue.svg)](https://swagger.io/)

**JiraGit System** là một giải pháp quản trị dự án phần mềm chuyên nghiệp, được thiết kế đặc biệt cho môi trường đào tạo CNTT. Hệ thống giúp thu hẹp khoảng cách giữa yêu cầu (Jira) và thực thi (GitHub), cho phép Giảng viên và Sinh viên theo dõi tiến độ một cách minh bạch và tự động hóa các báo cáo học thuật.

---

## 🌟 Chức Năng Cốt Lõi

### 📂 Quản Lý Đặc Tả & Yêu Cầu (Jira Sync)
- **Tự động đồng bộ**: Lấy danh sách Issues trực tiếp từ Jira Cloud về hệ thống.
- **Tạo tài liệu SRS**: Tự động xuất file **Software Requirements Specification (SRS)** dưới dạng Word (.docx) chuyên nghiệp từ các yêu cầu đã quản lý trên Jira.

### 💻 Theo Dõi Phát Triển (GitHub Sync)
- **Contribution Tracking**: Đồng bộ Commits, thống kê tần suất và chất lượng code của từng thành viên.
- **Smart Mapping**: Tự động liên kết Commit với Nhiệm vụ dựa trên ID Jira (ví dụ: `[PROJ-123]`) và tự động chuyển trạng thái hoàn thành (`DONE`) nếu message có từ khóa như `fix`, `done`.

### 📊 Hệ Thống Báo Cáo Đa Dạng
- **Dashboard trực quan**: Biểu đồ nhiệt (Heatmap) commit, biểu đồ tiến độ dự án (Area Chart).
- **Xuất báo cáo 1-Click**: Hỗ trợ xuất báo cáo tổng hợp đóng góp cá nhân và tiến độ nhóm dưới các định dạng **PDF, Word, CSV**.

### 🔐 Bảo Mật & Phân Quyền (RBAC)
- **Cơ chế**: Spring Security 6 + JSON Web Token (JWT).
- **Vai trò**: Phân quyền chi tiết cho `ADMIN`, `GIANG_VIEN`, và `SINH_VIEN`.

---

## 🛠️ Tech Stack

### 🚀 Backend
- **Core Framework**: Spring Boot 3.2.5 (Java 21)
- **Architecture**: Adapter Pattern (Dễ dàng mở rộng cho các nền tảng khác)
- **Security**: Spring Security 6.x + JWT Authentication
- **Reporting**: Apache POI (Word), OpenPDF (PDF)
- **API Docs**: SpringDoc OpenAPI (Swagger UI)
- **Database**: SQL Server (MSSQL)

### 🎨 Frontend
- **Framework**: React 19 (Vite)
- **Styling**: Vanilla CSS (Modern Design System)
- **Visualization**: Recharts

---

## 🚦 Hướng Dẫn Cài Đặt

### 1. Chuẩn Bị
- **JDK 21**
- **Maven 3.x**
- **SQL Server** (Đã tạo DB tên `prjAppDB`)

### 2. Cấu hình Backend
Sửa file `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=prjAppDB;encrypt=true;trustServerCertificate=true;
spring.datasource.username=YOUR_USER
spring.datasource.password=YOUR_PASSWORD

# JWT Config (Optional)
app.jwtSecret=your_secret_key_very_long_string_1234567890
app.jwtExpirationMs=86400000
```

### 3. Khởi Chạy
**Backend:**
```bash
cd backend
mvn spring-boot:run
```
 Truy cập Swagger UI tại: `http://localhost:8080/swagger-ui/index.html`

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 👥 Nhóm Phát Triển - Kimmmdcre

Dự án được xây dựng nhằm cung cấp một hệ thống quản lý chuẩn chỉnh cho sinh viên Java. Mọi thắc mắc vui lòng liên hệ đội ngũ phát triển.

© 2026 - Phát triển bởi **Kimmmdcre Team**
