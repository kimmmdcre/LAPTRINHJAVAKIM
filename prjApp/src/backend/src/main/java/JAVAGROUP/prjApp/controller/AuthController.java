package JAVAGROUP.prjApp.controller;

import JAVAGROUP.prjApp.dto.CreateUserRequest;
import JAVAGROUP.prjApp.dto.UserDTO;
import JAVAGROUP.prjApp.entity.NguoiDung;
import JAVAGROUP.prjApp.repository.NguoiDungRepository;
import JAVAGROUP.prjApp.service.AuthService;
import JAVAGROUP.prjApp.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final NguoiDungRepository nguoiDungRepository;
    private final UserService userService;

    public AuthController(
            AuthService authService,
            NguoiDungRepository nguoiDungRepository,
            UserService userService
    ) {
        this.authService = authService;
        this.nguoiDungRepository = nguoiDungRepository;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> dangNhap(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.dangNhap(body.get("username"), body.get("password")));
    }

    /**
     * Đăng ký công khai cho sinh viên.
     */
    @PostMapping("/register")
    public ResponseEntity<UserDTO> dangKy(@Valid @RequestBody CreateUserRequest dto) {
        // Luôn gán là SINH_VIEN khi đăng ký công khai
        dto.setMaVaiTro("SINH_VIEN");
        return ResponseEntity.ok(userService.taoTaiKhoan(dto));
    }

    /**
     * Thông tin user hiện tại (từ JWT).
     */
    @GetMapping("/me")
    public ResponseEntity<UserDTO> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("Chưa đăng nhập");
        }
        NguoiDung nd = nguoiDungRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        return ResponseEntity.ok(userService.toDTO(nd));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> dangXuat(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        authService.dangXuat(token);
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công"));
    }
}
