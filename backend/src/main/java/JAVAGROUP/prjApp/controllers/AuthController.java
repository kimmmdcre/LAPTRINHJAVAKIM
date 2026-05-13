package javagroup.prjApp.controllers;

import javagroup.prjApp.security.user.UserPrincipal;
import javagroup.prjApp.services.AuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        try {
            String token = authService.login(username, password);

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UserPrincipal principal = (UserPrincipal) auth.getPrincipal();

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("type", "Bearer");
            response.put("message", "Login successful");

            response.put("id", principal.getId());
            response.put("username", principal.getUsername());
            response.put("fullName", principal.getFullName());
            response.put("email", principal.getEmail());
            response.put("roleCode", principal.getRoleCode().name());
            response.put("role", principal.getRoleCode().name());
            response.put("groupRole", principal.getGroupRole());
            response.put("groupId", principal.getGroupId());
            response.put("createdAt", principal.getCreatedAt());

            return ResponseEntity.ok(response);
        } catch (org.springframework.security.authentication.DisabledException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Tài khoản của bạn đang ở trạng thái chờ kích hoạt hoặc đã bị vô hiệu hóa.");
            return ResponseEntity.status(403).body(error);
        } catch (org.springframework.security.authentication.LockedException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Tài khoản của bạn đã bị khóa (Banned). Vui lòng liên hệ quản trị viên.");
            return ResponseEntity.status(403).body(error);
        } catch (org.springframework.security.core.AuthenticationException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Tên đăng nhập hoặc mật khẩu không chính xác.");
            return ResponseEntity.status(401).body(error);
        }
    }

    /**
     * POST /api/auth/logout
     */
    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> logout(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        authService.logout(token);
        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }

    /**
     * POST /api/auth/change-password
     * Body: { "currentPassword": "...", "newPassword": "..." }
     */
    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> changePassword(@RequestBody Map<String, String> body) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();

        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        authService.changePassword(principal.getUsername(), currentPassword, newPassword);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }
}
