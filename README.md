# 🎓 JiraGit Support - Hệ Thống Quản Lý Dự Án Sinh Viên 🚀

**JiraGit Support** là một nền tảng quản lý dự án học thuật toàn diện, được thiết kế để kết nối quy trình giảng dạy với các công cụ phát triển chuyên nghiệp như **Jira** (quản lý nhiệm vụ) và **GitHub** (quản lý mã nguồn). Hệ thống giúp sinh viên rèn luyện tác phong làm việc thực tế và giúp giảng viên theo dõi tiến độ một cách trực quan qua dữ liệu thực.

---

## 🌟 Tính Năng Nổi Bật

### 🟢 Quản Trị Viên (Admin)
- **Quản lý Nhân sự**: Tạo và quản lý tài khoản cho Giảng viên, Sinh viên. Phân quyền truy cập hệ thống.
- **Điều phối Nhóm**: Thành lập các nhóm sinh viên, bàn giao đề tài và chỉ định Giảng viên hướng dẫn.
- **Trung tâm Tích hợp**: Cấu hình URL Jira và GitHub Token cho từng dự án một cách bảo mật.

### 🟡 Giảng Viên (Teacher)
- **Quản lý Lớp học**: Xem danh sách các nhóm được phân công hướng dẫn.
- **Báo cáo Tiến độ**: Theo dõi tiến độ dự án qua biểu đồ **Burn-down** và tần suất commit code thực tế.
- **Đánh giá & Tổng hợp**: Xuất báo cáo tổng hợp kết quả của nhóm dưới dạng file CSV/PDF.

### 🔴 Trưởng Nhóm (Leader)
- **Đồng bộ hóa Jira**: Kết nối và kéo các yêu cầu (Issues) từ Jira về hệ thống nội bộ.
- **Phân chia Nhiệm vụ**: Gán các nhiệm vụ lấy từ Jira cho từng thành viên trong nhóm.
- **Bảng Kanban**: Theo dõi luồng công việc của nhóm (TODO, IN PROGRESS, DONE).

### 🔵 Sinh Viên (Member)
- **Quản lý Cá nhân**: Xem danh sách nhiệm vụ được gán.
- **Cập nhật Trạng thái**: Thay đổi trạng thái nhiệm vụ và xem lịch sử đóng góp code (Commits) cá nhân.

---

## 🛠️ Công Nghệ Sử Dụng

### Backend
- **Framework**: Spring Boot 3.5.11
- **Database**: SQL Server
- **ORM**: Spring Data JPA / Hibernate
- **Security**: Role-based Access Control (RBAC)
- **Integration**: Spring WebClient (Jira & GitHub API)

### Frontend
- **Framework**: React 19 (Vite)
- **Chế độ hiển thị**: Dark Mode (Glassmorphism design)
- **Thư viện chính**: Lucide React (Icons), Recharts (Biểu đồ), Axios (API)
- **Hệ thống Toast**: Thông báo thời gian thực cho trải nghiệm người dùng cao cấp.

---

## 📁 Cấu Trúc Dự Án

```bash
LAPTRINHJAVAKIM/
├── backend/            # Mã nguồn Spring Boot REST API
│   ├── src/main/java   # Controller, Service, Repository, Entity, DTO
│   └── resources/      # application.properties (Cấu hình DB)
├── frontend/           # Mã nguồn ReactJS (Vite)
│   ├── src/pages       # Dashboard theo vai trò (Admin, Teacher, Leader, Student)
│   ├── src/components  # Sidebar, Header, UI Elements
│   └── src/context     # AuthContext, UIContext (Global State)
└── README.md           # Tài liệu hướng dẫn
```

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy

### 1. Backend
- Yêu cầu: Java 21+, Maven.
- Tạo Database `prjAppDB` trong SQL Server.
- Cấu hình SA/Password trong `backend/src/main/resources/application.properties`.
- Chạy lệnh:
```bash
cd backend
mvn spring-boot:run
```
- API sẽ chạy tại: `http://localhost:8080`

### 2. Frontend
- Yêu cầu: NodeJS 18+.
- Cài đặt Dependencies:
```bash
cd frontend
npm install
```
- Chạy lệnh phát triển:
```bash
npm run dev -- --port 5174
```
- Ứng dụng sẽ chạy tại: `http://localhost:5174`

---

## 🔐 Tài Khoản Truy Cập Mẫu (Demo)

| Vai trò | Username | Password |
|---------|----------|----------|
| **Admin** | `admin` | `123456` |
| **Giảng Viên** | `giangvien` | `123456` |
| **Trưởng Nhóm** | `truongnhom` | `123456` |

---

## 👥 Nhóm Phát Triển - Kimmmdcre

Dự án được thực hiện với tiêu chuẩn thẩm mỹ cao và quy trình tích hợp hệ thống chuyên nghiệp.
