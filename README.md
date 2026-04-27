# 🎓 JiraGit System - Quản Trị Đồ Án Thông Minh 🚀

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Security](https://img.shields.io/badge/Security-JWT%20%2B%20RBAC-red.svg)](https://spring.io/projects/spring-security)

**JiraGit System** là một nền tảng quản trị dự án phần mềm chuyên nghiệp, được tối ưu hóa cho môi trường đào tạo CNTT. Hệ thống cung cấp giải pháp đồng bộ hóa dữ liệu thời gian thực giữa yêu cầu nghiệp vụ (**Jira Cloud**) và quá trình thực thi mã nguồn (**GitHub**).

---

## 🏗️ Kiến Trúc Hệ Thống

Hệ thống được thiết kế theo mô hình **Multi-Tier Architecture** (Kiến trúc đa tầng) giúp tách biệt các mối quan tâm (Separation of Concerns) và đảm bảo tính mở rộng cao.

### 1. Tầng Giao Diện (Presentation Tier)

Được xây dựng bằng **React 19**, đóng vai trò là lớp giao tiếp trực tiếp với người dùng:

- **Components Layer**: Hệ thống thành phần UI tái sử dụng cao, thiết kế theo phong cách hiện đại, tối giản.
- **State Management**: Sử dụng React Context để quản lý trạng thái phiên đăng nhập (Auth) và các cài đặt giao diện (UI) toàn cục.
- **Integration Layer**: Giao tiếp với Backend thông qua các API Client (Axios) được đóng gói chặt chẽ, hỗ trợ xử lý lỗi tập trung.

### 2. Tầng Bảo Mật & Xác Thực (Security Layer)

Lớp bảo vệ nằm giữa Frontend và Backend, sử dụng **Spring Security 6**:

- **JWT Authentication**: Cơ chế xác thực không trạng thái (Stateless), sử dụng JSON Web Token để đảm bảo tính an toàn cho mọi yêu cầu API.
- **RBAC (Role-Based Access Control)**: Phân quyền truy cập dựa trên vai trò người dùng (`ADMIN`, `TEACHER`, `STUDENT`), đảm bảo mỗi đối tượng chỉ có thể thực hiện các hành động trong phạm vi quyền hạn của mình.

### 3. Tầng Xử Lý Nghiệp Vụ (Business Logic Tier)

Trái tim của hệ thống, được xây dựng bằng **Spring Boot 3.2.5**:

- **REST Controllers**: Tiếp nhận yêu cầu từ Frontend, điều phối dữ liệu và trả về kết quả theo định dạng JSON chuẩn.
- **Service Layer**: Nơi chứa toàn bộ logic nghiệp vụ (tính toán tiến độ, tạo báo cáo, mapping nhiệm vụ giữa Jira và Git).
- **Domain Entities**: Mô hình hóa các thực thể thực tế (User, Group, Commit, Requirement) vào cấu trúc lập trình hướng đối tượng.

### 4. Tầng Tích Hợp Ngoại Vi (Integration Layer - Adapter Pattern)

Đây là kiến trúc đặc biệt giúp hệ thống kết nối với các nền tảng bên thứ ba:

- **Jira Adapter**: Chịu trách nhiệm gọi API Jira Cloud, trích xuất dữ liệu Issue và chuyển đổi về định dạng chuẩn của hệ thống.
- **GitHub Adapter**: Giao tiếp với GitHub API để lấy lịch sử Commit và thông tin đóng góp của thành viên.
- **Extensibility**: Thiết kế theo `Interface` cho phép dễ dàng tích hợp thêm các nền tảng khác như GitLab, Bitbucket hoặc Trello mà không cần thay đổi code lõi của dịch vụ.

### 5. Tầng Dữ Liệu (Data Persistence Tier)

- **SQL Server**: Hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ, lưu trữ toàn bộ dữ liệu người dùng, cấu hình dự án và kết quả đồng bộ.
- **Spring Data JPA**: Sử dụng cơ chế ORM (Object-Relational Mapping) để tự động hóa việc truy vấn và thao tác dữ liệu, giúp mã nguồn sạch hơn và giảm thiểu lỗi SQL.

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
