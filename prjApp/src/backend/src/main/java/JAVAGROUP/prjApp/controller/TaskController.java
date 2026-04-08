package JAVAGROUP.prjApp.controller;

import JAVAGROUP.prjApp.dto.NhiemVuDTO;
import JAVAGROUP.prjApp.dto.YeuCauDTO;
import JAVAGROUP.prjApp.service.TaskService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping("/yeu-cau")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<YeuCauDTO>> layYeuCauNhom(@RequestParam UUID idNhom) {
        return ResponseEntity.ok(taskService.layYeuCauNhom(idNhom));
    }

    @GetMapping("/nhiem-vu")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NhiemVuDTO>> layNhiemVuCaNhan(@RequestParam UUID idSinhVien) {
        return ResponseEntity.ok(taskService.layNhiemVuCaNhan(idSinhVien));
    }

    @GetMapping("/nhiem-vu/nhom")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NhiemVuDTO>> layNhiemVuNhom(@RequestParam UUID idNhom) {
        return ResponseEntity.ok(taskService.layNhiemVuNhom(idNhom));
    }

    @PatchMapping("/nhiem-vu/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> capNhatTrangThai(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        taskService.capNhatTrangThaiTask(id, body.get("status"));
        return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái thành công"));
    }

    /**
     * Phân công nhiệm vụ cho sinh viên. Body: { "idSinhVien": "uuid" }
     */
    @PatchMapping("/nhiem-vu/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN','TRUONG_NHOM')")
    public ResponseEntity<Map<String, String>> ganNhiemVu(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        taskService.ganNhiemVuChoSinhVien(id, UUID.fromString(body.get("idSinhVien")));
        return ResponseEntity.ok(Map.of("message", "Đã phân công nhiệm vụ"));
    }
}
