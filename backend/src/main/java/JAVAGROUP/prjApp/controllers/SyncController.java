package JAVAGROUP.prjApp.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import JAVAGROUP.prjApp.services.SyncService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/sync")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('GIANG_VIEN') or hasRole('ADMIN')")
public class SyncController {

    private final SyncService syncService;

    public SyncController(SyncService syncService) {
        this.syncService = syncService;
    }

    /**
     * POST /api/sync/{idNhom}/jira
     * Kích hoạt đồng bộ dữ liệu từ Jira về DB
     */
    @PostMapping("/{idNhom}/jira")
    public ResponseEntity<Map<String, String>> dongBoJira(@PathVariable UUID idNhom) {
        syncService.dongBoJira(idNhom);
        return ResponseEntity.ok(Map.of("message", "Đồng bộ Jira thành công"));
    }

    /**
     * POST /api/sync/{idNhom}/github
     * Kích hoạt đồng bộ commits từ GitHub về DB
     */
    @PostMapping("/{idNhom}/github")
    public ResponseEntity<Map<String, String>> dongBoGithub(@PathVariable UUID idNhom) {
        syncService.dongBoGithub(idNhom);
        return ResponseEntity.ok(Map.of("message", "Đồng bộ GitHub thành công"));
    }

    /**
     * POST /api/sync/mapping
     * Mapping các commit với nhiệm vụ dựa trên commit message
     */
    @PostMapping("/mapping")
    public ResponseEntity<Map<String, String>> mappingTaskCommit() {
        syncService.mappingTaskCommit();
        return ResponseEntity.ok(Map.of("message", "Mapping commit–task thành công"));
    }
}
