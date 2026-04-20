# 🎓 Student Project Management System 🚀

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.11-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Status](https://img.shields.io/badge/Status-Stable-success.svg)](https://github.com/kimmmdcre/LAPTRINHJAVAKIM)

**JiraGit System** là nền tảng quản lý dự án học thuật thế hệ mới, được thiết kế để kết nối quy trình giảng dạy với các công cụ phát triển chuyên nghiệp như **Jira** và **GitHub**. Hệ thống không chỉ quản lý nhiệm vụ mà còn phân tích dữ liệu thực (Real-world Data) để đưa ra các báo cáo khách quan về năng lực sinh viên.

---

## 🌟 Tính Năng Nổi Bật

### 🏛️ Quản Trị Viên (Admin)

- **Quản lý thực thể tập trung**: Phân quyền Giảng viên, Sinh viên và quản lý danh sách phòng ban/nhóm.
- **Trung tâm Tích hợp (Real-time Config)**: Cấu hình API Jira và GitHub Token với bộ kiểm tra kết nối trực tiếp (**Live Connection Test**) đảm bảo tính sẵn sàng của hệ thống.
- **Validation Chặt chẽ**: Hệ thống tự động kiểm tra định dạng Repo và Token trước khi lưu trữ.

### 👨‍🏫 Giảng Viên (Teacher)

- **Dashboard Lớp học**: Quản lý và theo dõi danh sách các nhóm dự án được phân công.
- **Analytics Chuyên sâu**: Theo dõi tiến độ qua biểu đồ nhiệt (**Heatmap**) và biểu đồ biến động code cá nhân.
- **Báo cáo Đa định dạng**: Xuất báo cáo kết quả (PDF/Word) chuyên nghiệp phục vụ công tác chấm điểm.

### 👑 Trưởng Nhóm (Leader)

- **Auto-Sync 1-Click**: Đồng bộ hóa toàn bộ Issues từ Jira và Commits từ GitHub chỉ trong vài giây.
- **Smart Mapping**: Tự động liên kết Commit với Nhiệm vụ dựa trên mã Jira (e.g. `PROJ-123`) trong message commit.
- **Ghost Task Detection**: Hệ thống tự động cảnh báo các nhiệm vụ "DONE" nhưng không có commit tương ứng (vấn đề sinh viên làm giả tiến độ).

### 💻 Sinh Viên (Member)

- **Task Management**: Giao diện Kanban hiện đại để cập nhật trạng thái công việc.
- **Contribution Tracking**: Theo dõi lịch sử đóng góp và điểm đóng góp cá nhân để tự điều chỉnh hiệu suất.

---

## 🛠️ Tech Stack

### Backend

- **Core**: Spring Boot 3.5.11 (Java 21)
- **Database**: SQL Server (MSSQL)
- **Client**: Spring WebClient (Tích hợp API GitHub/Jira không đồng bộ)
- **Security**: Type-safe integration với `ParameterizedTypeReference`.

### Frontend

- **Framework**: React 19 (Vite)
- **Styling**: Vanilla CSS with Glassmorphism Design System.
- **Data Viz**: Recharts (Hiển thị biểu đồ phức tạp).
- **Icons**: Lucide React.

---

## 🚀 Hướng Dẫn Cài Đặt

### 1. Backend Setup

1. Đảm bảo đã cài đặt **JDK 21** và **Maven**.
2. Tạo cơ sở dữ liệu `prjAppDB` trong SQL Server.
3. Cấu hình thông tin kết nối trong `backend/src/main/resources/application.properties`:

   ```properties
   spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=prjAppDB;encrypt=true;trustServerCertificate=true;
   spring.datasource.username=YOUR_USER
   spring.datasource.password=YOUR_PASSWORD
   ```

4. Khởi chạy ứng dụng:

   ```bash
   cd backend
   mvn spring-boot:run
   ```

### 2. Frontend Setup

1. Đảm bảo đã cài đặt **Node.js 18+**.
2. Cài đặt dependencies:

   ```bash
   cd frontend
   npm install
   ```

3. Khởi chạy:

   ```bash
   cd frontend
   npm run dev
   ```

---

## 🔑 Quy Tắc Cấu Hình Tích Hợp

> [!IMPORTANT]
> **GitHub**: Yêu cầu Personal Access Token (PAT) với quyền `repo`.
> **Jira**: Sử dụng API Token kết hợp với Email đăng ký Jira.

**Mẫu Commit Message chuẩn:**
`[PROJ-123] Mô tả chi tiết các thay đổi của bạn`
*(Hệ thống sẽ dựa vào mã `PROJ-123` để tự động tích hợp dữ liệu)*

---

## 👥 Nhóm Phát Triển - Kimmmdcre

Dự án được xây dựng với tâm huyết mang lại một công cụ làm việc thực tế nhất cho môi trường đại học. Mọi đóng góp ý kiến vui lòng liên hệ đội ngũ phát triển.

---

### 📝 Bản quyền

© 2026 - Phát triển bởi Kimmmdcre Team
