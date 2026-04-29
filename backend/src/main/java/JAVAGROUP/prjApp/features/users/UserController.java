package javagroup.prjApp.features.users;

import javagroup.prjApp.features.users.UserDTO;
import javagroup.prjApp.features.users.UserRole;
import javagroup.prjApp.features.users.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * GET /api/users
     * Get list of all users
     */
    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /**
     * GET /api/users/teachers
     * Get list of only teachers
     */
    @GetMapping("/teachers")
    public ResponseEntity<List<UserDTO>> getAllTeachers() {
        return ResponseEntity.ok(userService.getAllTeachers());
    }

    /**
     * GET /api/users/unassigned
     * Get list of unassigned students
     */
    @GetMapping("/unassigned")
    public ResponseEntity<List<UserDTO>> getUnassignedStudents() {
        return ResponseEntity.ok(userService.getUnassignedStudents());
    }

    /**
     * POST /api/users
     * Create new account
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> createAccount(@RequestBody UserDTO dto) {
        userService.createAccount(dto);
        return ResponseEntity.ok(Map.of("message", "Account created successfully"));
    }

    /**
     * DELETE /api/users/{id}
     * Delete account by ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteAccount(@PathVariable UUID id) {
        userService.deleteAccount(id);
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }

    /**
     * PUT /api/users/{id}
     * Update account info
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> updateAccount(@PathVariable UUID id, @RequestBody UserDTO dto) {
        userService.updateAccount(id, dto);
        return ResponseEntity.ok(Map.of("message", "Account updated successfully"));
    }

    /**
     * PATCH /api/users/{id}/role
     * Update user role
     */
    @PatchMapping("/{id}/role")
    public ResponseEntity<Map<String, String>> assignRole(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        userService.assignRole(id, UserRole.valueOf(body.get("role")));
        return ResponseEntity.ok(Map.of("message", "Role updated successfully"));
    }
}
