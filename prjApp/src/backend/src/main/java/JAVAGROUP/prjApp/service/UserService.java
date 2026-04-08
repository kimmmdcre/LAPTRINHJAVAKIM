package JAVAGROUP.prjApp.service;

import JAVAGROUP.prjApp.dto.CreateUserRequest;
import JAVAGROUP.prjApp.dto.UserDTO;
import JAVAGROUP.prjApp.entity.*;
import JAVAGROUP.prjApp.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final NguoiDungRepository nguoiDungRepository;
    private final SinhVienRepository sinhVienRepository;
    private final GiangVienRepository giangVienRepository;
    private final QuanTriVienRepository quanTriVienRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(
            NguoiDungRepository nguoiDungRepository,
            SinhVienRepository sinhVienRepository,
            GiangVienRepository giangVienRepository,
            QuanTriVienRepository quanTriVienRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.nguoiDungRepository = nguoiDungRepository;
        this.sinhVienRepository = sinhVienRepository;
        this.giangVienRepository = giangVienRepository;
        this.quanTriVienRepository = quanTriVienRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserDTO taoTaiKhoan(CreateUserRequest dto) {
        if (nguoiDungRepository.findByUsername(dto.getUsername()).isPresent()) {
            throw new RuntimeException("Username đã tồn tại: " + dto.getUsername());
        }
        if (nguoiDungRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại: " + dto.getEmail());
        }

        String rawRole = dto.getMaVaiTro().trim().toUpperCase();
        String hash = passwordEncoder.encode(dto.getPassword());

        return switch (rawRole) {
            case "ADMIN", "QUAN_TRI_VIEN" -> saveQuanTri(dto, hash, normalizeStoredRole(rawRole));
            case "GIANG_VIEN" -> saveGiangVien(dto, hash);
            default -> saveSinhVien(dto, hash, normalizeStudentRole(rawRole));
        };
    }

    private String normalizeStoredRole(String r) {
        if ("ADMIN".equals(r)) {
            return "QUAN_TRI_VIEN";
        }
        return r;
    }

    /** Lưu ma_vai_tro trong DB: TRUONG_NHOM / SINH_VIEN / THANH_VIEN */
    private String normalizeStudentRole(String r) {
        if ("TRUONG_NHOM".equals(r)) {
            return "TRUONG_NHOM";
        }
        if ("THANH_VIEN".equals(r)) {
            return "SINH_VIEN";
        }
        return "SINH_VIEN";
    }

    private UserDTO saveQuanTri(CreateUserRequest dto, String hash, String maVaiTroLuu) {
        String maGv = dto.getMaSo() == null || dto.getMaSo().isBlank()
                ? "QTV-" + dto.getUsername()
                : dto.getMaSo().trim();
        if (quanTriVienRepository.findByMaGv(maGv).isPresent()) {
            throw new RuntimeException("Mã quản trị đã tồn tại: " + maGv);
        }
        QuanTriVien q = new QuanTriVien();
        q.setUsername(dto.getUsername());
        q.setPasswordHash(hash);
        q.setHoTen(dto.getHoTen());
        q.setEmail(dto.getEmail());
        q.setTrangThai(TrangThaiUser.ACTIVE);
        q.setMaVaiTro(maVaiTroLuu);
        q.setMaGv(maGv);
        q.setCapDoQuyen(1);
        QuanTriVien saved = quanTriVienRepository.save(q);
        return toDTO(saved);
    }

    private UserDTO saveGiangVien(CreateUserRequest dto, String hash) {
        if (dto.getMaSo() == null || dto.getMaSo().isBlank()) {
            throw new RuntimeException("Tạo giảng viên cần trường maSo (mã giảng viên).");
        }
        String ma = dto.getMaSo().trim();
        if (giangVienRepository.findByMaGiangVien(ma).isPresent()) {
            throw new RuntimeException("Mã giảng viên đã tồn tại: " + ma);
        }
        GiangVien gv = new GiangVien();
        gv.setUsername(dto.getUsername());
        gv.setPasswordHash(hash);
        gv.setHoTen(dto.getHoTen());
        gv.setEmail(dto.getEmail());
        gv.setTrangThai(TrangThaiUser.ACTIVE);
        gv.setMaVaiTro("GIANG_VIEN");
        gv.setMaGiangVien(ma);
        gv.setKhoa(dto.getKhoa() != null ? dto.getKhoa() : "");
        GiangVien saved = giangVienRepository.save(gv);
        return toDTO(saved);
    }

    private UserDTO saveSinhVien(CreateUserRequest dto, String hash, String maVaiTroLuu) {
        if (dto.getMaSo() == null || dto.getMaSo().isBlank()) {
            throw new RuntimeException("Tạo sinh viên cần trường maSo (mã sinh viên).");
        }
        String maSv = dto.getMaSo().trim();
        if (sinhVienRepository.findByMaSv(maSv).isPresent()) {
            throw new RuntimeException("Mã sinh viên đã tồn tại: " + maSv);
        }
        SinhVien sv = new SinhVien();
        sv.setUsername(dto.getUsername());
        sv.setPasswordHash(hash);
        sv.setHoTen(dto.getHoTen());
        sv.setEmail(dto.getEmail());
        sv.setTrangThai(TrangThaiUser.ACTIVE);
        sv.setMaVaiTro(maVaiTroLuu);
        sv.setMaSv(maSv);
        sv.setLop(dto.getLop() != null ? dto.getLop() : "");
        SinhVien saved = sinhVienRepository.save(sv);
        return toDTO(saved);
    }

    @Transactional
    public void xoaTaiKhoan(UUID id) {
        if (sinhVienRepository.existsById(id)) {
            sinhVienRepository.deleteById(id);
            return;
        }
        if (giangVienRepository.existsById(id)) {
            giangVienRepository.deleteById(id);
            return;
        }
        if (quanTriVienRepository.existsById(id)) {
            quanTriVienRepository.deleteById(id);
            return;
        }
        if (!nguoiDungRepository.existsById(id)) {
            throw new RuntimeException("Người dùng không tồn tại: " + id);
        }
        nguoiDungRepository.deleteById(id);
    }

    public void phanQuyen(UUID id, String role) {
        NguoiDung nd = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại: " + id));
        nd.setMaVaiTro(role);
        nguoiDungRepository.save(nd);
    }

    public UserDTO toDTO(NguoiDung nd) {
        return new UserDTO(
                nd.getId(),
                nd.getUsername(),
                nd.getHoTen(),
                nd.getEmail(),
                nd.getTrangThai(),
                nd.getMaVaiTro()
        );
    }

    public List<UserDTO> timelineSearch(String query) {
        return nguoiDungRepository.findAll().stream()
                .filter(u -> u.getUsername().contains(query) || u.getHoTen().contains(query) || u.getEmail().contains(query))
                .limit(20)
                .map(this::toDTO)
                .toList();
    }

    public List<UserDTO> listAllUsers() {
        return nguoiDungRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }
}
