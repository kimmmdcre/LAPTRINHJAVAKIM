# 🎓 JiraGit Pro - Hệ Thống Quản Trị Đồ Án Tích Hợp 🚀

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Java](https://img.shields.io/badge/Java-21%2F25-orange.svg)](https://www.oracle.com/java/)
[![Security](https://img.shields.io/badge/Security-JWT%20%2B%20RBAC-red.svg)](https://spring.io/projects/spring-security)
[![DB Support](https://img.shields.io/badge/DB-MySQL%20%7C%20SQL%20Server-blue.svg)](#)

**JiraGit Pro** là nền tảng quản trị dự án phần mềm chuyên nghiệp, được thiết kế để thu hẹp khoảng cách giữa yêu cầu nghiệp vụ (**Jira Cloud**) và quá trình thực thi mã nguồn (**GitHub**). Hệ thống hỗ trợ đắc lực cho Giảng viên trong việc theo dõi tiến độ và Sinh viên trong việc tự động hóa tài liệu kỹ thuật.

---

## 🌟 Tính Năng Đặc Sắc

### 🔄 Đồng Bộ Hóa Đa Nền Tảng

- **Jira Cloud Sync**: Tự động kéo Issues, Tasks và Sub-tasks. Theo dõi trạng thái hoàn thành theo thời gian thực.
- **GitHub Commit Tracker**: Quét lịch sử commit, tự động liên kết mã nguồn với nhiệm vụ thông qua Issue Key (ví dụ: `PROJ-1`).
- **Data Mapping**: Thuật toán thông minh giúp đối soát khối lượng công việc thực tế so với kế hoạch trên Jira.

### 📄 Tự Động Hóa Tài Liệu (Report Studio)

- **SRS Generator**: Kết xuất tài liệu Đặc tả yêu cầu phần mềm (Word) chuyên nghiệp chỉ trong vài giây.
- **Multi-format Export**: Hỗ trợ xuất báo cáo tổng kết, bảng đóng góp thành viên dưới dạng **PDF**, **DOCX**, và **CSV**.

### 📊 Dashboard Phân Tích Chuyên Sâu

- Biểu đồ trực quan về tiến độ nhóm và hiệu suất cá nhân.
- Hệ thống đánh giá năng lực dựa trên XP (điểm tích lũy từ Commit và Task hoàn thành).

---

## 🛠️ Stack Công Nghệ & Tối Ưu Hóa

| Thành phần | Công nghệ | Lưu ý kỹ thuật |
| :--- | :--- | :--- |
| **Backend** | Spring Boot 3.2.5, Java 21+ | Tương thích hoàn toàn với **macOS (M1/M2/M3)** và **Windows**. |
| **Bảo mật** | Spring Security & JWT | Phân quyền RBAC (ADMIN, TEACHER, STUDENT). |
| **Thư viện lõi**| **Lombok 1.18.40** | Bản vá đặc biệt hỗ trợ JDK 21/25. |
| **Xử lý File** | **OpenPDF 2.0.3** | Nâng cấp bảo mật và ổn định cho việc xuất bản PDF. |
| **Database** | MySQL / SQL Server | Hỗ trợ chuyển đổi linh hoạt qua `application.properties`. |
| **Frontend** | React 19, Vite, Vanilla CSS | Thiết kế chuẩn **iOS 18 / Apple Style** (Glassmorphism). |

---

## 🚦 Hướng Dẫn Cài Đặt Nhanh

### 1. Yêu cầu hệ thống

- **JDK 21** trở lên (Khuyến nghị Temurin hoặc Oracle JDK).
- **Node.js v18+**.
- **Cơ sở dữ liệu**: MySQL 8.0+ hoặc SQL Server 2019+.

### 2. Cấu hình Database

Tạo cơ sở dữ liệu `prjAppDB`. Cấu hình trong `backend/src/main/resources/application.properties`:

```properties
# MySQL (Mặc định)
spring.datasource.url=jdbc:mysql://localhost:3306/prjAppDB
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

# Nếu dùng SQL Server, hãy bỏ comment các dòng MSSQL trong file cấu hình.
```

### 3. Khởi chạy hệ thống

**Khởi động Backend:**

```bash
cd backend
./mvnw spring-boot:run
```

**Khởi động Frontend:**

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Tài Khoản Truy Cập Mặc Định

Hệ thống đã cấu hình sẵn bộ dữ liệu mẫu (Data Seed). Mật khẩu mặc định **trùng với tên đăng nhập**:

| Vai trò | Tên đăng nhập | Mật khẩu |
| :--- | :--- | :--- |
| **Quản trị viên** | `admin` | `admin` |
| **Giảng viên** | `teacher` | `teacher` |
| **Nhóm trưởng** | `leader` | `leader` |
| **Thành viên** | `member` | `member` |
| **Sinh viên** | `student1` | `student1` |

---

## 📂 Cấu Trúc Thư Mục

```text
LAPTRINHJAVAKIM/
├── backend/            # Spring Boot Project
│   ├── src/main/java/  # Logic xử lý, Security, Adapters
│   └── pom.xml         # Quản lý dependency (Lombok, OpenPDF, v.v.)
├── frontend/           # React Vite Project
│   ├── src/pages/      # Giao diện người dùng (Clean Architecture)
│   └── src/services/   # Giao tiếp API đồng bộ
└── README.md           # Hướng dẫn này
```

---

## 👥 Đội Ngũ Phát Triển
Hệ thống được tối ưu hóa cho mục đích đào tạo và quản lý đồ án công nghệ thông tin.
