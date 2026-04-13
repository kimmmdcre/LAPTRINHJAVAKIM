package JAVAGROUP.prjApp.controllers;

import JAVAGROUP.prjApp.dtos.NhiemVuDTO;
import JAVAGROUP.prjApp.dtos.YeuCauDTO;
import JAVAGROUP.prjApp.services.SyncService;
import JAVAGROUP.prjApp.services.TaskService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    private final TaskService taskService;
    private final SyncService syncService;

    public TaskController(TaskService taskService, SyncService syncService) {
        this.taskService = taskService;
        this.syncService = syncService;
    }

    /**
     * GET /api/tasks/{idNhom}
     * Lấy danh sách nhiệm vụ của cả nhóm (dành cho Trưởng nhóm/Giảng viên)
     */
    @GetMapping("/{idNhom}")
    public ResponseEntity<java.util.List<JAVAGROUP.prjApp.dtos.NhiemVuDTO>> layNhiemVuNhom(
            @PathVariable UUID idNhom) {
        return ResponseEntity.ok(taskService.layNhiemVuNhom(idNhom));
    }

    /**
     * GET /api/tasks/jira/sync/{idNhom}
     * Kích hoạt đồng bộ hóa từ Jira cho nhóm
     */
    @GetMapping("/jira/sync/{idNhom}")
    public ResponseEntity<Map<String, String>> syncJira(@PathVariable UUID idNhom) {
        syncService.dongBoJira(idNhom);
        return ResponseEntity.ok(Map.of("message", "Đồng bộ Jira thành công"));
    }

    /**
     * GET /api/tasks/yeu-cau?idNhom={uuid}
     * Lấy danh sách yêu cầu (Jira Issues) của một nhóm
     */
    @GetMapping("/yeu-cau")
    public ResponseEntity<List<YeuCauDTO>> layYeuCauNhom(@RequestParam UUID idNhom) {
        return ResponseEntity.ok(taskService.layYeuCauNhom(idNhom));
    }

    /**
     * GET /api/tasks/nhiem-vu?idSinhVien={uuid}
     * Lấy danh sách nhiệm vụ cá nhân của một sinh viên
     */
    @GetMapping("/nhiem-vu")
    public ResponseEntity<List<NhiemVuDTO>> layNhiemVuCaNhan(@RequestParam UUID idSinhVien) {
        return ResponseEntity.ok(taskService.layNhiemVuCaNhan(idSinhVien));
    }

    /**
     * PATCH /api/tasks/nhiem-vu/{id}/status
     * Body: { "status": "IN_PROGRESS" }
     * Cập nhật trạng thái nhiệm vụ
     */
    @PatchMapping("/nhiem-vu/{id}/status")
    public ResponseEntity<Map<String, String>> capNhatTrangThai(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        taskService.capNhatTrangThaiTask(id, body.get("status"));
        return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái thành công"));
    }

    /**
     * PATCH /api/tasks/nhiem-vu/{id}/assign
     * Body: { "idSinhVien": "uuid" }
     * Giao nhiệm vụ cho thành viên
     */
    @PatchMapping("/nhiem-vu/{id}/assign")
    public ResponseEntity<Map<String, String>> phanCongNhiemVu(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        taskService.phanCongNhiemVu(id, UUID.fromString(body.get("idSinhVien")));
        return ResponseEntity.ok(Map.of("message", "Phân công nhiệm vụ thành công"));
    }
}
