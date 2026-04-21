package JAVAGROUP.prjApp.config;

import JAVAGROUP.prjApp.entities.*;
import JAVAGROUP.prjApp.repositories.*;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private final NguoiDungRepository nguoiDungRepository;
    private final QuanTriVienRepository quanTriVienRepository;
    private final GiangVienRepository giangVienRepository;
    private final SinhVienRepository sinhVienRepository;
    private final NhomRepository nhomRepository;
    private final ThanhVienNhomRepository thanhVienNhomRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(NguoiDungRepository nguoiDungRepository,
                           QuanTriVienRepository quanTriVienRepository,
                           GiangVienRepository giangVienRepository,
                           SinhVienRepository sinhVienRepository,
                           NhomRepository nhomRepository,
                           ThanhVienNhomRepository thanhVienNhomRepository,
                           PasswordEncoder passwordEncoder) {
        this.nguoiDungRepository = nguoiDungRepository;
        this.quanTriVienRepository = quanTriVienRepository;
        this.giangVienRepository = giangVienRepository;
        this.sinhVienRepository = sinhVienRepository;
        this.nhomRepository = nhomRepository;
        this.thanhVienNhomRepository = thanhVienNhomRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {

        // 1. Seed Admin
        if (nguoiDungRepository.findByTenDangNhap("admin").isEmpty()) {
            QuanTriVien admin = new QuanTriVien();
            admin.setTenDangNhap("admin");
            admin.setMatKhauHash(passwordEncoder.encode("admin"));
            admin.setHoTen("Admin Hệ Thống");
            admin.setEmail("admin@prj.com");
            admin.setTrangThai(TrangThaiUser.ACTIVE);
            admin.setMaVaiTro("ADMIN");
            admin.setMaGv("AD001");
            admin.setCapDoQuyen(1);
            quanTriVienRepository.save(admin);
        }

        // 2. Seed Giang Vien
        GiangVien gv = null;
        if (nguoiDungRepository.findByTenDangNhap("teacher").isEmpty()) {
            gv = new GiangVien();
            gv.setTenDangNhap("teacher");
            gv.setMatKhauHash(passwordEncoder.encode("teacher"));
            gv.setHoTen("Giảng Viên Hướng Dẫn");
            gv.setEmail("teacher@prj.com");
            gv.setTrangThai(TrangThaiUser.ACTIVE);
            gv.setMaVaiTro("GIANG_VIEN");
            gv.setMaGiangVien("GV001");
            gv.setKhoa("Công nghệ thông tin");
            gv = giangVienRepository.save(gv);
        } else {
            gv = (GiangVien) nguoiDungRepository.findByTenDangNhap("teacher").get();
        }

        // 3. Seed Students (Leader & Member)
        SinhVien leader = null;
        if (nguoiDungRepository.findByTenDangNhap("leader").isEmpty()) {
            leader = new SinhVien();
            leader.setTenDangNhap("leader");
            leader.setMatKhauHash(passwordEncoder.encode("leader"));
            leader.setHoTen("Sinh Viên Trưởng Nhóm");
            leader.setEmail("leader@prj.com");
            leader.setTrangThai(TrangThaiUser.ACTIVE);
            leader.setMaVaiTro("SINH_VIEN");
            leader.setMaSv("SV001");
            leader.setLop("K65-CNTT");
            leader = sinhVienRepository.save(leader);
        } else {
            leader = (SinhVien) nguoiDungRepository.findByTenDangNhap("leader").get();
        }

        SinhVien member = null;
        if (nguoiDungRepository.findByTenDangNhap("member").isEmpty()) {
            member = new SinhVien();
            member.setTenDangNhap("member");
            member.setMatKhauHash(passwordEncoder.encode("member"));
            member.setHoTen("Sinh Viên Thành Viên");
            member.setEmail("member@prj.com");
            member.setTrangThai(TrangThaiUser.ACTIVE);
            member.setMaVaiTro("SINH_VIEN");
            member.setMaSv("SV002");
            member.setLop("K65-CNTT");
            member = sinhVienRepository.save(member);
        } else {
            member = (SinhVien) nguoiDungRepository.findByTenDangNhap("member").get();
        }

        // 4. Seed Nhom (Group)
        if (nhomRepository.findAll().stream().noneMatch(n -> n.getTenNhom().equals("Nhóm 1 - Dự án JiraGit"))) {
            Nhom nhom = new Nhom();
            nhom.setTenNhom("Nhóm 1 - Dự án JiraGit");
            nhom.setDeTai("Xây dựng hệ thống quản lý đồ án sinh viên tích hợp Jira/GitHub");
            nhom.setGiangVien(gv);
            nhom = nhomRepository.save(nhom);

            // Add members to group
            ThanhVienNhom leaderReg = new ThanhVienNhom();
            leaderReg.setId(new ThanhVienNhomId(nhom.getIdNhom(), leader.getId()));
            leaderReg.setNhom(nhom);
            leaderReg.setSinhVien(leader);
            leaderReg.setVaiTro(VaiTroNhom.LEADER);
            thanhVienNhomRepository.save(leaderReg);

            ThanhVienNhom memberReg = new ThanhVienNhom();
            memberReg.setId(new ThanhVienNhomId(nhom.getIdNhom(), member.getId()));
            memberReg.setNhom(nhom);
            memberReg.setSinhVien(member);
            memberReg.setVaiTro(VaiTroNhom.MEMBER);
            thanhVienNhomRepository.save(memberReg);
        }
        
        System.out.println(">>> Dữ liệu test (admin/teacher/leader/member) đã được khởi tạo thành công với tên hiển thị mới!");
    }
}
