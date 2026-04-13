package JAVAGROUP.prjApp.controllers;

import JAVAGROUP.prjApp.entites.NguoiDung;
import JAVAGROUP.prjApp.services.AuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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
    public ResponseEntity<Map<String, Object>> dangNhap(@RequestBody Map<String, String> body) {
        try {
            NguoiDung nguoiDung = authService.dangNhap(body.get("username"), body.get("password"));
            String token = "token-placeholder-for:" + nguoiDung.getUsername();
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("message", "Đăng nhập thành công");
            response.put("id", nguoiDung.getId() != null ? nguoiDung.getId().toString() : "");
            response.put("username", nguoiDung.getUsername());
            response.put("hoTen", nguoiDung.getHoTen());
            response.put("email", nguoiDung.getEmail());
            response.put("role", nguoiDung.getMaVaiTro() != null ? nguoiDung.getMaVaiTro() : "SINH_VIEN");
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> errorRes = new HashMap<>();
            errorRes.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorRes);
        }
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
