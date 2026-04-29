package javagroup.prjApp.features.auth;

import javagroup.prjApp.features.auth.AuthService;
import javagroup.prjApp.core.security.UserPrincipal;

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

        return ResponseEntity.ok(response);
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
}
