package JAVAGROUP.prjApp.controller;

import JAVAGROUP.prjApp.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/auth/login
     * Body: { "username": "...", "password": "..." }
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> dangNhap(@RequestBody Map<String, String> body) {
        String token = authService.dangNhap(body.get("username"), body.get("password"));
        return ResponseEntity.ok(Map.of("token", token, "message", "Đăng nhập thành công"));
    }

    /**
     * POST /api/auth/logout
     * Header: Authorization: Bearer <token>
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> dangXuat(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        authService.dangXuat(token);
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công"));
    }
}
