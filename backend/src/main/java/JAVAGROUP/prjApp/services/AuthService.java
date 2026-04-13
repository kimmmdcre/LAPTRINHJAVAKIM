package JAVAGROUP.prjApp.services;

import JAVAGROUP.prjApp.entites.NguoiDung;
import JAVAGROUP.prjApp.repositories.NguoiDungRepository;

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
    public NguoiDung dangNhap(String user, String pass) {
        Optional<NguoiDung> found = nguoiDungRepository.findByUsername(user);
        if (found.isEmpty()) {
            throw new RuntimeException("Tên đăng nhập không tồn tại!");
        }
        NguoiDung nguoiDung = found.get();
        // TODO: So sánh password hash (BCrypt) thay vì plain text
        if (!nguoiDung.getPasswordHash().equals(pass)) {
            throw new RuntimeException("Sai mật khẩu!");
        }
        return nguoiDung;
    }

    /**
     * Vô hiệu hoá token (logout).
     * Hiện tại là placeholder - sẽ triển khai blacklist JWT sau.
     */
    public void dangXuat(String token) {
        // TODO: Thêm token vào blacklist Redis hoặc DB
    }
}
