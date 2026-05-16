package javagroup.prjApp.controllers;

import javagroup.prjApp.security.user.UserPrincipal;
import javagroup.prjApp.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller xử lý các tác vụ liên quan đến Xác thực (Authentication).
 * Bao gồm: Đăng nhập, Đăng xuất và Đổi mật khẩu.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * API Đăng nhập.
     * Trả về JWT Token và thông tin cơ bản của người dùng nếu thành công.
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

            // Trả về thêm thông tin user để Frontend lưu vào LocalStorage
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

        } catch (DisabledException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Your account is pending activation or has been disabled.");
            return ResponseEntity.status(403).body(error);

        } catch (LockedException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Your account has been locked. Please contact the administrator.");
            return ResponseEntity.status(403).body(error);

        } catch (AuthenticationException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Incorrect username or password.");
            return ResponseEntity.status(401).body(error);
        }
    }

    /**
     * API Đăng xuất.
     * Vô hiệu hóa Token hiện tại (đưa vào Blacklist).
     */
    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> logout(@RequestHeader("Authorization") String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        authService.logout(token);
        return ResponseEntity.ok(Map.of("message", "Logout successful"));
    }

    /**
     * API Đổi mật khẩu.
     * Yêu cầu phải đăng nhập để thực hiện.
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