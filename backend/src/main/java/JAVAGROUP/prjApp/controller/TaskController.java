package JAVAGROUP.prjApp.controller;

import JAVAGROUP.prjApp.dto.NhiemVuDTO;
import JAVAGROUP.prjApp.dto.YeuCauDTO;
import JAVAGROUP.prjApp.service.TaskService;
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

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
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
}
