package JAVAGROUP.prjApp.services;

import JAVAGROUP.prjApp.dtos.UserDTO;
import JAVAGROUP.prjApp.entites.GiangVien;
import JAVAGROUP.prjApp.entites.NguoiDung;
import JAVAGROUP.prjApp.entites.QuanTriVien;
import JAVAGROUP.prjApp.entites.SinhVien;
import JAVAGROUP.prjApp.repositories.GiangVienRepository;
import JAVAGROUP.prjApp.repositories.NguoiDungRepository;
import JAVAGROUP.prjApp.repositories.QuanTriVienRepository;
import JAVAGROUP.prjApp.repositories.SinhVienRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private final NguoiDungRepository nguoiDungRepository;
    private final QuanTriVienRepository quanTriVienRepository;
    private final GiangVienRepository giangVienRepository;
    private final SinhVienRepository sinhVienRepository;

    public UserService(NguoiDungRepository nguoiDungRepository,
                       QuanTriVienRepository quanTriVienRepository,
                       GiangVienRepository giangVienRepository,
                       SinhVienRepository sinhVienRepository) {
        this.nguoiDungRepository = nguoiDungRepository;
        this.quanTriVienRepository = quanTriVienRepository;
        this.giangVienRepository = giangVienRepository;
        this.sinhVienRepository = sinhVienRepository;
    }

    /**
     * Tạo tài khoản người dùng mới từ DTO.
     * Lưu ý: password phải được hash trước khi lưu (TODO: BCrypt).
     */
    public void taoTaiKhoan(UserDTO dto) {
        NguoiDung nd;
        String role = dto.getMaVaiTro();
        
        if ("ADMIN".equals(role)) {
            QuanTriVien qtv = new QuanTriVien();
            qtv.setMaGv("ADM_" + dto.getUsername());
            qtv.setCapDoQuyen(1);
            nd = qtv;
        } else if ("GIANG_VIEN".equals(role)) {
            GiangVien gv = new GiangVien();
            gv.setMaGiangVien("GV_" + dto.getUsername());
            gv.setKhoa("Công nghệ thông tin");
            nd = gv;
        } else {
            SinhVien sv = new SinhVien();
            sv.setMaSv("SV_" + dto.getUsername());
            sv.setLop("K70-IT");
            nd = sv;
        }

        nd.setUsername(dto.getUsername());
        String pass = (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) ? dto.getPassword() : "123456";
        nd.setPasswordHash(pass); // Default fallback string if empty
        nd.setHoTen(dto.getHoTen());
        nd.setEmail(dto.getEmail());
        nd.setMaVaiTro(role);
        nd.setTrangThai(JAVAGROUP.prjApp.entites.TrangThaiUser.ACTIVE);
        
        nguoiDungRepository.save(nd);
    }

    /**
     * Xoá tài khoản bằng ID.
     */
    public void xoaTaiKhoan(UUID id) {
        if (!nguoiDungRepository.existsById(id)) {
            throw new RuntimeException("Người dùng không tồn tại: " + id);
        }
        nguoiDungRepository.deleteById(id);
    }

    /**
     * Cập nhật quyền (maVaiTro) cho người dùng.
     */
    public void phanQuyen(UUID id, String role) {
        NguoiDung nd = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại: " + id));
        nd.setMaVaiTro(role);
        nguoiDungRepository.save(nd);
    }

    /**
     * Cập nhật thông tin người dùng
     */
    public void capNhatTaiKhoan(UUID id, UserDTO dto) {
        NguoiDung nd = nguoiDungRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Người dùng không tồn tại: " + id));
        nd.setHoTen(dto.getHoTen());
        nd.setEmail(dto.getEmail());
        nd.setUsername(dto.getUsername());
        if (dto.getMaVaiTro() != null) {
            nd.setMaVaiTro(dto.getMaVaiTro());
        }
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            nd.setPasswordHash(dto.getPassword());
        }
        nguoiDungRepository.save(nd);
    }

    /**
     * Lấy danh sách tất cả người dùng.
     */
    public java.util.List<UserDTO> layDanhSachNguoiDung() {
        return nguoiDungRepository.findAll().stream()
                .map(this::toDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Lấy danh sách chỉ các giảng viên.
     */
    public java.util.List<UserDTO> layDanhSachGiangVien() {
        return nguoiDungRepository.findAll().stream()
                .filter(nd -> "GIANG_VIEN".equals(nd.getMaVaiTro()))
                .map(this::toDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Lấy danh sách sinh viên chưa có nhóm.
     */
    public java.util.List<UserDTO> layDanhSachSinhVienTuDo() {
        // Lấy tất cả sinh viên
        List<SinhVien> tatCaSv = sinhVienRepository.findAll();
        
        // Lọc những sinh viên không nằm trong bất kỳ nhóm nào
        return tatCaSv.stream()
                .filter(sv -> sv.getThanhVienNhoms() == null || sv.getThanhVienNhoms().isEmpty())
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Chuyển đổi Entity NguoiDung sang UserDTO (không lộ passwordHash).
     */
    public UserDTO toDTO(NguoiDung nd) {
        return new UserDTO(
                nd.getId(),
                nd.getUsername(),
                nd.getHoTen(),
                nd.getEmail(),
                nd.getTrangThai(),
                nd.getMaVaiTro(),
                null // hide password
        );
    }
}
