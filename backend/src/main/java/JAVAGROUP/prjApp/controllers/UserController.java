package javagroup.prjApp.controllers;

import javagroup.prjApp.dtos.UserDTO;
import javagroup.prjApp.enums.UserRole;
import javagroup.prjApp.enums.UserStatus;
import javagroup.prjApp.services.UserService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.DeleteMapping;

import java.util.Map;
import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * Lấy danh sách tất cả người dùng trong hệ thống.
     * Quyền: ADMIN
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /**
     * Lấy danh sách tất cả Giảng viên.
     * Quyền: ADMIN
     */
    @GetMapping(params = "role=TEACHER")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllTeachers() {
        return ResponseEntity.ok(userService.getAllTeachers());
    }

    /**
     * Lấy danh sách Sinh viên chưa được phân vào nhóm nào.
     * Quyền: ADMIN
     */
    @GetMapping(params = "status=UNASSIGNED")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getUnassignedStudents() {
        return ResponseEntity.ok(userService.getUnassignedStudents());
    }

    /**
     * Xem thông tin chi tiết của một người dùng qua ID.
     * Quyền: Đã đăng nhập
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDTO> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    /**
     * Tạo mới một tài khoản người dùng thủ công.
     * Quyền: ADMIN
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> createAccount(@RequestBody UserDTO dto) {
        userService.createAccount(dto);
        return ResponseEntity.ok(Map.of("message", "Account created successfully"));
    }

    /**
     * Tạo hàng loạt tài khoản
     * Quyền: ADMIN
     */
    @PostMapping("/bulk")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> bulkCreateAccounts(@RequestBody List<UserDTO> dtos) {
        userService.bulkCreateAccounts(dtos);
        return ResponseEntity.ok(Map.of("message", "Bulk accounts created successfully"));
    }

    /**
     * Cập nhật thông tin tài khoản cho người dùng khác.
     * Quyền: ADMIN
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateAccount(@PathVariable UUID id, @RequestBody UserDTO dto) {
        userService.updateAccount(id, dto);
        return ResponseEntity.ok(Map.of("message", "Account updated successfully"));
    }

    /**
     * Người dùng tự cập nhật thông tin cá nhân của chính mình.
     * Quyền: Đã đăng nhập
     */
    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> updateProfile(@RequestBody UserDTO dto) {
        userService.updateUserProfile(dto.getUsername(), dto);
        return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
    }

    /**
     * Thay đổi vai trò (ADMIN, TEACHER, STUDENT) cho người dùng.
     * Quyền: ADMIN
     */
    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> assignRole(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        userService.assignRole(id, UserRole.valueOf(body.get("role")));
        return ResponseEntity.ok(Map.of("message", "Role updated successfully"));
    }

    /**
     * Cập nhật trạng thái tài khoản (ACTIVE, BANNED, PENDING...).
     * Quyền: ADMIN
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        userService.updateStatus(id, UserStatus.valueOf(body.get("status")));
        return ResponseEntity.ok(Map.of("message", "Status updated successfully"));
    }

    /**
     * Xóa hoàn toàn một tài khoản người dùng.
     * Quyền: ADMIN
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteAccount(@PathVariable UUID id) {
        userService.deleteAccount(id);
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }
}