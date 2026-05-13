package javagroup.prjApp.controllers;

import javagroup.prjApp.dtos.UserDTO;
import javagroup.prjApp.enums.UserRole;
import javagroup.prjApp.services.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /**
     * GET /api/users?role=TEACHER
     * Get list of only teachers
     */
    @GetMapping(params = "role=TEACHER")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllTeachers() {
        return ResponseEntity.ok(userService.getAllTeachers());
    }

    /**
     * GET /api/users?status=UNASSIGNED
     * Get list of unassigned students
     */
    @GetMapping(params = "status=UNASSIGNED")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getUnassignedStudents() {
        return ResponseEntity.ok(userService.getUnassignedStudents());
    }

    /**
     * POST /api/users
     * Create new account
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> createAccount(@RequestBody UserDTO dto) {
        userService.createAccount(dto);
        return ResponseEntity.ok(Map.of("message", "Account created successfully"));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> bulkCreateAccounts(@RequestBody List<UserDTO> dtos) {
        userService.bulkCreateAccounts(dtos);
        return ResponseEntity.ok(Map.of("message", "Bulk accounts created successfully"));
    }

    /**
     * DELETE /api/users/{id}
     * Delete account by ID
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteAccount(@PathVariable UUID id) {
        userService.deleteAccount(id);
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateAccount(@PathVariable UUID id, @RequestBody UserDTO dto) {
        userService.updateAccount(id, dto);
        return ResponseEntity.ok(Map.of("message", "Account updated successfully"));
    }

    /**
     * PUT /api/users/profile
     * Update current user profile
     */
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> updateProfile(@RequestBody UserDTO dto) {
        userService.updateUserProfile(dto.getUsername(), dto);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
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

    /**
     * PATCH /api/users/{id}/status
     * Update user status (ACTIVE, INACTIVE, BANNED, PENDING)
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        userService.updateStatus(id, javagroup.prjApp.enums.UserStatus.valueOf(body.get("status")));
        return ResponseEntity.ok(Map.of("message", "Status updated successfully"));
    }
}
