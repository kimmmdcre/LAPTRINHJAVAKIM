package JAVAGROUP.prjApp.controllers;

import JAVAGROUP.prjApp.services.AuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
            String tenDangNhap = body.get("tenDangNhap");
            if (tenDangNhap == null) tenDangNhap = body.get("username"); // Fallback
            
            String matKhau = body.get("matKhau");
            if (matKhau == null) matKhau = body.get("password"); // Fallback
            
            String token = authService.dangNhap(tenDangNhap, matKhau);
            
            // Lấy thông tin user từ SecurityContext sau khi authenticate thành công
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            JAVAGROUP.prjApp.security.UserPrincipal principal = (JAVAGROUP.prjApp.security.UserPrincipal) auth.getPrincipal();
            
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("type", "Bearer");
            response.put("message", "Đăng nhập thành công");
            
            // Trả về kèm thông tin User để Frontend phân quyền
            response.put("id", principal.getId());
            response.put("tenDangNhap", principal.getUsername());
            response.put("hoTen", principal.getHoTen());
            response.put("email", principal.getEmail());
            response.put("maVaiTro", principal.getMaVaiTro());
            response.put("role", principal.getMaVaiTro()); // Alias để Dashboard.jsx dùng
            response.put("groupRole", principal.getGroupRole());
            response.put("idNhom", principal.getIdNhom());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorRes = new HashMap<>();
            errorRes.put("message", "Đăng nhập thất bại: " + e.getMessage());
            return ResponseEntity.status(401).body(errorRes);
        }
    }

    /**
     * POST /api/auth/logout
     * Header: Authorization: Bearer <token>
     */
    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> dangXuat(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        authService.dangXuat(token);
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công"));
    }
}
