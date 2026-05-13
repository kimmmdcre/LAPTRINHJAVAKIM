package javagroup.prjApp.controllers;

import javagroup.prjApp.dtos.ConfigDTO;
import javagroup.prjApp.entities.IntegrationConfig;
import javagroup.prjApp.services.ConfigService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/api/configs")
@CrossOrigin(origins = "*")
public class ConfigController {

    private final ConfigService configService;

    public ConfigController(ConfigService configService) {
        this.configService = configService;
    }

    /**
     * GET /api/configs?groupId={groupId}
     * Get integration configs for a group
     */
    @GetMapping(params = "groupId")
    public ResponseEntity<List<IntegrationConfig>> getConfigs(@RequestParam("groupId") UUID groupId) {
        return ResponseEntity.ok(configService.getConfigsByGroupId(groupId));
    }

    /**
     * POST /api/configs
     * Save/Update configuration
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<Map<String, String>> saveConfig(@RequestBody ConfigDTO dto) {
        configService.saveConfig(dto);
        return ResponseEntity.ok(Map.of("message", "Lưu cấu hình thành công"));
    }

    /**
     * DELETE /api/configs/{id}
     * Remove configuration
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<Map<String, String>> removeConfig(@PathVariable UUID id) {
        configService.removeConfig(id);
        return ResponseEntity.ok(Map.of("message", "Xóa cấu hình thành công"));
    }

    /**
     * POST /api/configs/test
     * Test connection (Dry run)
     */
    @PostMapping("/test")
    public ResponseEntity<Map<String, Object>> testConnection(@RequestBody ConfigDTO dto) {
        boolean success = configService.testConnection(dto);
        return ResponseEntity.ok(Map.of(
                "success", success,
                "message", success ? "Kết nối thành công" : "Kết nối thất bại"));
    }
}
