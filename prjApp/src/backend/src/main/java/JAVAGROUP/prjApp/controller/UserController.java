package JAVAGROUP.prjApp.controller;

import JAVAGROUP.prjApp.dto.UserDTO;
import JAVAGROUP.prjApp.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
     * GET /api/users
     * Lấy danh sách tất cả người dùng
     */
    @GetMapping
    public ResponseEntity<java.util.List<JAVAGROUP.prjApp.dto.UserDTO>> layDanhSachNguoiDung() {
        return ResponseEntity.ok(userService.layDanhSachNguoiDung());
    }

    /**
     * GET /api/users/teachers
     * Lấy danh sách chỉ các giảng viên
     */
    @GetMapping("/teachers")
    public ResponseEntity<java.util.List<JAVAGROUP.prjApp.dto.UserDTO>> layDanhSachGiangVien() {
        return ResponseEntity.ok(userService.layDanhSachGiangVien());
    }

    /**
     * GET /api/users/unassigned
     * Lấy danh sách sinh viên tự do (chưa có nhóm)
     */
    @GetMapping("/unassigned")
    public ResponseEntity<java.util.List<JAVAGROUP.prjApp.dto.UserDTO>> layDanhSachSinhVienTuDo() {
        return ResponseEntity.ok(userService.layDanhSachSinhVienTuDo());
    }

    /**
     * POST /api/users
     * Body: UserDTO (tạo tài khoản mới)
     */
    @PostMapping
    public ResponseEntity<Map<String, String>> taoTaiKhoan(@RequestBody UserDTO dto) {
        userService.taoTaiKhoan(dto);
        return ResponseEntity.ok(Map.of("message", "Tạo tài khoản thành công"));
    }

    /**
     * DELETE /api/users/{id}
     * Xoá tài khoản theo ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> xoaTaiKhoan(@PathVariable UUID id) {
        userService.xoaTaiKhoan(id);
        return ResponseEntity.ok(Map.of("message", "Xoá tài khoản thành công"));
    }

    /**
     * PUT /api/users/{id}
     * Cập nhật thông tin
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, String>> capNhatTaiKhoan(@PathVariable UUID id, @RequestBody UserDTO dto) {
        userService.capNhatTaiKhoan(id, dto);
        return ResponseEntity.ok(Map.of("message", "Cập nhật thành công"));
    }

    /**
     * PATCH /api/users/{id}/role
     * Body: { "role": "GIANG_VIEN" }
     * Cập nhật quyền người dùng
     */
    @PatchMapping("/{id}/role")
    public ResponseEntity<Map<String, String>> phanQuyen(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        userService.phanQuyen(id, body.get("role"));
        return ResponseEntity.ok(Map.of("message", "Cập nhật quyền thành công"));
    }
}
