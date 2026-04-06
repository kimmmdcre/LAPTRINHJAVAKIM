package JAVAGROUP.prjApp.service;

import JAVAGROUP.prjApp.dto.UserDTO;
import JAVAGROUP.prjApp.entity.NguoiDung;
import JAVAGROUP.prjApp.repository.NguoiDungRepository;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class UserService {

    private final NguoiDungRepository nguoiDungRepository;

    public UserService(NguoiDungRepository nguoiDungRepository) {
        this.nguoiDungRepository = nguoiDungRepository;
    }

    /**
     * Tạo tài khoản người dùng mới từ DTO.
     * Lưu ý: password phải được hash trước khi lưu (TODO: BCrypt).
     */
    public void taoTaiKhoan(UserDTO dto) {
        // TODO: Map từ DTO sang Entity tương ứng (SinhVien / GiangVien / QuanTriVien)
        // và save vào repository
        throw new UnsupportedOperationException("Cần xác định loại người dùng khi tạo tài khoản.");
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
