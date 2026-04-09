package JAVAGROUP.prjApp.service;

import JAVAGROUP.prjApp.dto.UserDTO;
import JAVAGROUP.prjApp.entity.NguoiDung;
import JAVAGROUP.prjApp.entity.QuanTriVien;
import JAVAGROUP.prjApp.entity.GiangVien;
import JAVAGROUP.prjApp.entity.SinhVien;
import JAVAGROUP.prjApp.repository.NguoiDungRepository;
import JAVAGROUP.prjApp.repository.QuanTriVienRepository;
import JAVAGROUP.prjApp.repository.GiangVienRepository;
import JAVAGROUP.prjApp.repository.SinhVienRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
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
        nd.setPasswordHash("123456"); // Default password
        nd.setHoTen(dto.getHoTen());
        nd.setEmail(dto.getEmail());
        nd.setMaVaiTro(role);
        nd.setTrangThai(JAVAGROUP.prjApp.entity.TrangThaiUser.ACTIVE);
        
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
     * Chuyển đổi Entity NguoiDung sang UserDTO (không lộ passwordHash).
     */
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
}
