package JAVAGROUP.prjApp.service;

import JAVAGROUP.prjApp.entity.NguoiDung;
import JAVAGROUP.prjApp.repository.NguoiDungRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final NguoiDungRepository nguoiDungRepository;

    public AuthService(NguoiDungRepository nguoiDungRepository) {
        this.nguoiDungRepository = nguoiDungRepository;
    }

    /**
     * Xác thực đăng nhập bằng username + password.
     * Trả về token (tạm thời trả về username, sau sẽ tích hợp JWT).
     */
    public String dangNhap(String user, String pass) {
        Optional<NguoiDung> found = nguoiDungRepository.findByUsername(user);
        if (found.isEmpty()) {
            throw new RuntimeException("Tên đăng nhập không tồn tại!");
        }
        NguoiDung nguoiDung = found.get();
        // TODO: So sánh password hash (BCrypt) thay vì plain text
        if (!nguoiDung.getPasswordHash().equals(pass)) {
            throw new RuntimeException("Sai mật khẩu!");
        }
        // TODO: Tạo JWT token thực sự ở đây
        return "token-placeholder-for:" + nguoiDung.getUsername();
    }

    /**
     * Vô hiệu hoá token (logout).
     * Hiện tại là placeholder - sẽ triển khai blacklist JWT sau.
     */
    public void dangXuat(String token) {
        // TODO: Thêm token vào blacklist Redis hoặc DB
    }
}
