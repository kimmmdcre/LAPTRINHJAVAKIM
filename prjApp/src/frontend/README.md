# Frontend (NodeJS)

Frontend được xây dựng bằng NodeJS + Express + EJS, bố cục gần với các dự án thực tế: **layout**, **partials**, **sections**, **CSS tách file**, **JS theo trang**.

### Cấu trúc thư mục (`frontend/src`)

```
src/
├── server.js              # Express: route + render view
├── views/
│   ├── layouts/
│   │   └── dashboard.ejs  # Khung dashboard + bảo vệ phiên
│   ├── pages/
│   │   └── login.ejs      # Trang đăng nhập
│   ├── partials/          # head, sidebar, topbar
│   └── sections/          # Khối chức năng (admin, nhóm, task…)
└── public/
    ├── css/
    │   └── app.css
    └── js/
        ├── login.js
        └── dashboard.js
```

Luồng người dùng: `GET /` → `/dang-nhap` → đăng nhập (backend trả `role`) → redirect `/admin` | `/giang-vien` | `/truong-nhom` | `/thanh-vien`. Trang dashboard kiểm tra `localStorage` trùng `role` với URL, nếu không thì đá về đăng nhập.

## 1) Cài đặt

Yêu cầu máy đã cài Node.js (khuyến nghị >= 18):

```bash
cd frontend
npm install
```

## 2) Cấu hình

Tạo file `.env` từ `.env.example`:

```bash
PORT=3000
BACKEND_URL=http://localhost:8080
```

## 3) Chạy frontend

```bash
npm start
```

Mở trình duyệt:
- `http://localhost:3000`
- `http://localhost:3000/dang-nhap`

Sau đăng nhập, hệ thống chuyển theo vai trò:
- `/admin`
- `/giang-vien`
- `/truong-nhom`
- `/thanh-vien`

## 4) Chức năng đã có

- Đăng nhập / đăng xuất và lưu token tạm thời trên màn hình.
- Giao diện theo vai trò: mỗi URL một dashboard; role do backend trả về khi login.
- Lưu phiên local (backend URL, token, role) bằng localStorage.
- Quản lý user (tạo, cập nhật role, xóa).
- Quản lý group (tạo, phân công giảng viên, xem chi tiết, xem thành viên).
- Task (lấy yêu cầu, lấy task cá nhân, cập nhật trạng thái).
- Cấu hình Jira/GitHub.
- Đồng bộ Jira/GitHub + liên kết task-commit.
- Báo cáo tiến độ, commit, đóng góp và xuất CSV.

## 5) Lưu ý

- Backend hiện tại chưa authz đầy đủ, nên frontend đang ở mức giao diện thao tác API.
- Nếu backend đổi schema request/response, cập nhật `src/public/js/dashboard.js` và `src/public/js/login.js`.
