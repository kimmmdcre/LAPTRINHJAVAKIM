package JAVAGROUP.prjApp.controller;

import JAVAGROUP.prjApp.dto.CreateUserRequest;
import JAVAGROUP.prjApp.dto.UserDTO;
import JAVAGROUP.prjApp.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * POST /api/users — chỉ ADMIN
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> listAllUsers() {
        return ResponseEntity.ok(userService.listAllUsers());
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN','GIANG_VIEN')")
    public ResponseEntity<List<UserDTO>> search(@RequestParam String q) {
        return ResponseEntity.ok(userService.timelineSearch(q));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> xoaTaiKhoan(@PathVariable UUID id) {
        userService.xoaTaiKhoan(id);
        return ResponseEntity.ok(Map.of("message", "Xoá tài khoản thành công"));
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> phanQuyen(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        userService.phanQuyen(id, body.get("role"));
        return ResponseEntity.ok(Map.of("message", "Cập nhật quyền thành công"));
    }
}
