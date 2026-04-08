/*
  Tài khoản test — chạy trên database prjAppDB (SQL Server)

  Yêu cầu: Bảng đã được Hibernate tạo (spring.jpa.hibernate.ddl-auto=update)
  và cấu trúc JOINED: NGUOI_DUNG + bảng con (QUAN_TRI_VIEN / GIANG_VIEN / SINH_VIEN).

  Nếu bảng NGUOI_DUNG có thêm cột DTYPE (tùy phiên bản Hibernate), hãy xem mục ghi chú ở cuối file.

  Cách chạy: SSMS → mở file này → Execute (hoặc sqlcmd).

  --- Đăng nhập test (username / mật khẩu giống nhau do backend đang so sánh plain text) ---
  | Vai trò         | Username    | Mật khẩu   | ma_vai_tro      |
  |-----------------|-------------|------------|-----------------|
  | Quản trị viên   | admin       | Admin@123  | QUAN_TRI_VIEN   |
  | Giảng viên      | giangvien   | Gv@123456  | GIANG_VIEN      |
  | Trưởng nhóm     | truongnhom  | Leader@123 | TRUONG_NHOM     |
  | Thành viên      | thanhvien   | Member@123 | SINH_VIEN       |
*/

USE prjAppDB;
GO

SET NOCOUNT ON;

/* Xóa bản ghi cũ trùng username (nếu đã chạy script trước đó) */
DELETE sv FROM SINH_VIEN sv
INNER JOIN NGUOI_DUNG nd ON nd.id = sv.id
WHERE nd.username IN (N'admin', N'giangvien', N'truongnhom', N'thanhvien');

DELETE gv FROM GIANG_VIEN gv
INNER JOIN NGUOI_DUNG nd ON nd.id = gv.id
WHERE nd.username IN (N'admin', N'giangvien', N'truongnhom', N'thanhvien');

DELETE q FROM QUAN_TRI_VIEN q
INNER JOIN NGUOI_DUNG nd ON nd.id = q.id
WHERE nd.username IN (N'admin', N'giangvien', N'truongnhom', N'thanhvien');

DELETE FROM NGUOI_DUNG
WHERE username IN (N'admin', N'giangvien', N'truongnhom', N'thanhvien');
GO

/* UUID cố định để dễ tra cứu trong báo cáo / foreign key sau này */
DECLARE @idAdmin   UNIQUEIDENTIFIER = '10000000-0000-4000-8000-000000000001';
DECLARE @idGv      UNIQUEIDENTIFIER = '10000000-0000-4000-8000-000000000002';
DECLARE @idLeader  UNIQUEIDENTIFIER = '10000000-0000-4000-8000-000000000003';
DECLARE @idMember  UNIQUEIDENTIFIER = '10000000-0000-4000-8000-000000000004';

/* Quản trị viên */
INSERT INTO NGUOI_DUNG (id, username, password_hash, ho_ten, email, trang_thai, ma_vai_tro)
VALUES (
  @idAdmin,
  N'admin',
  N'Admin@123',
  N'Quản trị viên Demo',
  N'admin.demo@school.edu',
  N'ACTIVE',
  N'QUAN_TRI_VIEN'
);

INSERT INTO QUAN_TRI_VIEN (id, ma_gv, cap_do_quyen)
VALUES (@idAdmin, N'QTV001', 9);

/* Giảng viên */
INSERT INTO NGUOI_DUNG (id, username, password_hash, ho_ten, email, trang_thai, ma_vai_tro)
VALUES (
  @idGv,
  N'giangvien',
  N'Gv@123456',
  N'Giảng viên Demo',
  N'giangvien.demo@school.edu',
  N'ACTIVE',
  N'GIANG_VIEN'
);

INSERT INTO GIANG_VIEN (id, ma_giang_vien, khoa)
VALUES (@idGv, N'GV001', N'Công nghệ thông tin');

/* Trưởng nhóm (vẫn là bản ghi SINH_VIEN; role TRUONG_NHOM theo ma_vai_tro — khớp AuthService) */
INSERT INTO NGUOI_DUNG (id, username, password_hash, ho_ten, email, trang_thai, ma_vai_tro)
VALUES (
  @idLeader,
  N'truongnhom',
  N'Leader@123',
  N'Trưởng nhóm Demo',
  N'truongnhom.demo@school.edu',
  N'ACTIVE',
  N'TRUONG_NHOM'
);

INSERT INTO SINH_VIEN (id, ma_sv, lop)
VALUES (@idLeader, N'SV-LEADER', N'D21CQCN01');

/* Thành viên nhóm */
INSERT INTO NGUOI_DUNG (id, username, password_hash, ho_ten, email, trang_thai, ma_vai_tro)
VALUES (
  @idMember,
  N'thanhvien',
  N'Member@123',
  N'Thành viên Demo',
  N'thanhvien.demo@school.edu',
  N'ACTIVE',
  N'SINH_VIEN'
);

INSERT INTO SINH_VIEN (id, ma_sv, lop)
VALUES (@idMember, N'SV-MEMBER', N'D21CQCN01');

PRINT N'Đã tạo 4 tài khoản test: admin, giangvien, truongnhom, thanhvien.';
GO

/*
  Ghi chú DTYPE:
  Nếu INSERT báo thiếu cột DTYPE trên NGUOI_DUNG, chạy:
    SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'NGUOI_DUNG';

  Thường giá trị là tên class entity ngắn, ví dụ: QuanTriVien, GiangVien, SinhVien.
  Khi đó thêm cột vào INSERT, ví dụ:
    INSERT INTO NGUOI_DUNG (..., DTYPE) VALUES (..., N'QuanTriVien');
*/
