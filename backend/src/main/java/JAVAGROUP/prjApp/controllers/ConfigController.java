package javagroup.prjApp.controllers;

import lombok.RequiredArgsConstructor;

import javagroup.prjApp.dtos.ConfigDTO;
import javagroup.prjApp.entities.IntegrationConfig;
import javagroup.prjApp.services.ConfigService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;
import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/api/configs")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ConfigController {

    private final ConfigService configService;

    /**
     * GET /api/configs?groupId={groupId}
     * Get integration configs for a group
     */
    @GetMapping(params = "groupId")
    @PreAuthorize("isAuthenticated()")
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
        return ResponseEntity.ok(Map.of("message", "Configuration saved successfully"));
    }

    /**
     * DELETE /api/configs/{id}
     * Remove configuration
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    public ResponseEntity<Map<String, String>> removeConfig(@PathVariable UUID id) {
        configService.removeConfig(id);
        return ResponseEntity.ok(Map.of("message", "Configuration deleted successfully"));
    }

    /**
     * POST /api/configs/test
     * Test connection (Dry run)
     */
    @PostMapping("/test")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> testConnection(@RequestBody ConfigDTO dto) {
        boolean success = configService.testConnection(dto);
        return ResponseEntity.ok(Map.of(
                "success", success,
                "message", success ? "Connection successful" : "Connection failed"));
    }
}
