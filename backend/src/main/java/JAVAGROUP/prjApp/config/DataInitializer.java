package JAVAGROUP.prjApp.config;

import JAVAGROUP.prjApp.entites.*;
import JAVAGROUP.prjApp.repositories.*;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

@Configuration
public class DataInitializer implements CommandLineRunner {

    private final NguoiDungRepository nguoiDungRepository;
    private final QuanTriVienRepository quanTriVienRepository;
    private final GiangVienRepository giangVienRepository;
    private final SinhVienRepository sinhVienRepository;
    private final NhomRepository nhomRepository;
    private final ThanhVienNhomRepository thanhVienNhomRepository;

    public DataInitializer(NguoiDungRepository nguoiDungRepository,
                           QuanTriVienRepository quanTriVienRepository,
                           GiangVienRepository giangVienRepository,
                           SinhVienRepository sinhVienRepository,
                           NhomRepository nhomRepository,
                           ThanhVienNhomRepository thanhVienNhomRepository) {
        this.nguoiDungRepository = nguoiDungRepository;
        this.quanTriVienRepository = quanTriVienRepository;
        this.giangVienRepository = giangVienRepository;
        this.sinhVienRepository = sinhVienRepository;
        this.nhomRepository = nhomRepository;
        this.thanhVienNhomRepository = thanhVienNhomRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {

        // 1. Seed Admin
        if (nguoiDungRepository.findByUsername("admin").isEmpty()) {
            QuanTriVien admin = new QuanTriVien();
            admin.setUsername("admin");
            admin.setPasswordHash("admin@2026");
            admin.setHoTen("Quản Trị Viên Hệ Thống");
            admin.setEmail("admin@example.com");
            admin.setTrangThai(TrangThaiUser.ACTIVE);
            admin.setMaVaiTro("ADMIN");
            admin.setMaGv("AD001");
            admin.setCapDoQuyen(1);
            quanTriVienRepository.save(admin);
        }

        // 2. Seed Giang Vien
        GiangVien gv = null;
        if (nguoiDungRepository.findByUsername("gv_kimm").isEmpty()) {
            gv = new GiangVien();
            gv.setUsername("gv_kimm");
            gv.setPasswordHash("teacher@2026");
            gv.setHoTen("TS. Nguyễn Văn Giảng");
            gv.setEmail("giangvien@example.com");
            gv.setTrangThai(TrangThaiUser.ACTIVE);
            gv.setMaVaiTro("TEACHER");
            gv.setMaGiangVien("GV001");
            gv.setKhoa("Công nghệ thông tin");
            gv = giangVienRepository.save(gv);
        } else {
            gv = (GiangVien) nguoiDungRepository.findByUsername("gv_kimm").get();
        }

        // 3. Seed Students
        SinhVien leader = null;
        if (nguoiDungRepository.findByUsername("sv_leader").isEmpty()) {
            leader = new SinhVien();
            leader.setUsername("sv_leader");
            leader.setPasswordHash("leader@2026");
            leader.setHoTen("Trần Thủ Thủ (Leader)");
            leader.setEmail("leader@example.com");
            leader.setTrangThai(TrangThaiUser.ACTIVE);
            leader.setMaVaiTro("STUDENT");
            leader.setMaSv("SV001");
            leader.setLop("K65-CNTT");
            leader = sinhVienRepository.save(leader);
        } else {
            leader = (SinhVien) nguoiDungRepository.findByUsername("sv_leader").get();
        }

        SinhVien member = null;
        if (nguoiDungRepository.findByUsername("sv_member").isEmpty()) {
            member = new SinhVien();
            member.setUsername("sv_member");
            member.setPasswordHash("member@2026");
            member.setHoTen("Lê Văn Thành (Member)");
            member.setEmail("member@example.com");
            member.setTrangThai(TrangThaiUser.ACTIVE);
            member.setMaVaiTro("STUDENT");
            member.setMaSv("SV002");
            member.setLop("K65-CNTT");
            member = sinhVienRepository.save(member);
        } else {
            member = (SinhVien) nguoiDungRepository.findByUsername("sv_member").get();
        }

        // 4. Seed Nhom (Group)
        Nhom nhom = null;
        if (nhomRepository.findAll().stream().noneMatch(n -> n.getTenNhom().equals("Nhóm 1 - Dự án JiraGit"))) {
            nhom = new Nhom();
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
        
        System.out.println(">>> Dữ liệu test đã được khởi tạo thành công!");
    }
}
