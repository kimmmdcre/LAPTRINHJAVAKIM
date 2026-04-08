package JAVAGROUP.prjApp.service;

import JAVAGROUP.prjApp.entity.NguoiDung;
import JAVAGROUP.prjApp.repository.NguoiDungRepository;
import JAVAGROUP.prjApp.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    private final NguoiDungRepository nguoiDungRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            NguoiDungRepository nguoiDungRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder
    ) {
        this.nguoiDungRepository = nguoiDungRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Đăng nhập: mật khẩu BCrypt hoặc tương thích dữ liệu cũ (plain text trong DB).
     */
    public Map<String, String> dangNhap(String user, String pass) {
        Optional<NguoiDung> found = nguoiDungRepository.findByUsername(user);
        if (found.isEmpty()) {
            throw new RuntimeException("Tên đăng nhập không tồn tại!");
        }
        NguoiDung nguoiDung = found.get();
        if (!passwordMatches(pass, nguoiDung.getPasswordHash())) {
            throw new RuntimeException("Sai mật khẩu!");
        }
        String normalized = chuanHoaRole(nguoiDung.getMaVaiTro());
        String token = jwtService.generateToken(nguoiDung, normalized);
        return Map.of(
                "token", token,
                "role", normalized,
                "message", "Đăng nhập thành công"
        );
    }

    private boolean passwordMatches(String rawPassword, String storedHash) {
        if (storedHash == null) {
            return false;
        }
        String s = storedHash.trim();
        if (s.startsWith("$2a$") || s.startsWith("$2b$") || s.startsWith("$2y$")) {
            return passwordEncoder.matches(rawPassword, s);
        }
        return s.equals(rawPassword);
    }

    private String chuanHoaRole(String maVaiTro) {
        if (maVaiTro == null) {
            return "THANH_VIEN";
        }
        String role = maVaiTro.trim().toUpperCase();
        if ("ADMIN".equals(role) || "QUAN_TRI_VIEN".equals(role)) {
            return "ADMIN";
        }
        if ("GIANG_VIEN".equals(role)) {
            return "GIANG_VIEN";
        }
        if ("TRUONG_NHOM".equals(role)) {
            return "TRUONG_NHOM";
        }
        return "THANH_VIEN";
    }

    public void dangXuat(String token) {
        /* Có thể bổ sung denylist JWT sau */
    }
}
