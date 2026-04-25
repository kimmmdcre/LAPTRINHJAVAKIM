package JAVAGROUP.prjApp.controllers;

import JAVAGROUP.prjApp.dtos.ConfigDTO;
import JAVAGROUP.prjApp.entities.IntegrationConfig;
import JAVAGROUP.prjApp.services.ConfigService;

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
     * GET /api/configs/{groupId}
     * Get integration configs for a group
     */
    @GetMapping("/{groupId}")
    public ResponseEntity<List<IntegrationConfig>> getConfigs(@PathVariable UUID groupId) {
        return ResponseEntity.ok(configService.getConfigsByGroupId(groupId));
    }

    /**
     * POST /api/configs
     * Save/Update configuration
     */
    @PostMapping
    @PreAuthorize("hasRole('SINH_VIEN')")
    public ResponseEntity<Map<String, String>> saveConfig(@RequestBody ConfigDTO dto) {
        configService.saveConfig(dto);
        return ResponseEntity.ok(Map.of("message", "Configuration saved successfully"));
    }

    /**
     * DELETE /api/configs/{id}
     * Remove configuration
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SINH_VIEN')")
    public ResponseEntity<Map<String, String>> removeConfig(@PathVariable UUID id) {
        configService.removeConfig(id);
        return ResponseEntity.ok(Map.of("message", "Configuration removed successfully"));
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
            "message", success ? "Connection successful" : "Connection failed"
        ));
    }
}
