/*
  Dữ liệu demo: 1 nhóm + thành viên (chạy SAU seed_test_users.sql).

  UUID nhóm demo: 20000000-0000-4000-8000-000000000001
  Dùng làm "UUID nhóm mặc định" trên frontend cho nhanh.
*/
USE prjAppDB;
GO

DECLARE @idNhom UNIQUEIDENTIFIER = '20000000-0000-4000-8000-000000000001';
DECLARE @idGv UNIQUEIDENTIFIER = '10000000-0000-4000-8000-000000000002';
DECLARE @idLeader UNIQUEIDENTIFIER = '10000000-0000-4000-8000-000000000003';
DECLARE @idMember UNIQUEIDENTIFIER = '10000000-0000-4000-8000-000000000004';

/* Xóa demo cũ (tránh lỗi khi chạy lại) */
DELETE FROM THANH_VIEN_NHOM WHERE id_nhom = @idNhom;
DELETE FROM NHOM WHERE id_nhom = @idNhom;
GO

INSERT INTO NHOM (id_nhom, ten_nhom, de_tai, id_giang_vien)
VALUES (@idNhom, N'Nhóm Demo — LT Java', N'Đồ án quản lý yêu cầu & GitHub', @idGv);

INSERT INTO THANH_VIEN_NHOM (id_nhom, id_sinh_vien, vai_tro)
VALUES
  (@idNhom, @idLeader, 'LEADER'),
  (@idNhom, @idMember, 'MEMBER');

PRINT N'Đã tạo nhóm demo: 20000000-0000-4000-8000-000000000001';
GO
