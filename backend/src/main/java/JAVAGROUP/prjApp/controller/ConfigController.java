package JAVAGROUP.prjApp.controller;

import JAVAGROUP.prjApp.service.ConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/config")
@CrossOrigin(origins = "*")
public class ConfigController {

    private final ConfigService configService;

    public ConfigController(ConfigService configService) {
        this.configService = configService;
    }

    /**
     * POST /api/config/{idNhom}/jira
     * Body: { "url": "...", "token": "..." }
     * Cài đặt tích hợp Jira cho nhóm
     */
    @PostMapping("/{idNhom}/jira")
    public ResponseEntity<Map<String, String>> cauHinhJira(
            @PathVariable UUID idNhom,
            @RequestBody Map<String, String> body) {
        configService.cauHinhJira(idNhom, body.get("url"), body.get("token"));
        return ResponseEntity.ok(Map.of("message", "Cấu hình Jira thành công"));
    }

    /**
     * POST /api/config/{idNhom}/github
     * Body: { "repo": "owner/repo", "token": "...", "since": "2024-01-01T00:00:00Z" }
     * Cài đặt tích hợp GitHub cho nhóm
     */
    @PostMapping("/{idNhom}/github")
    public ResponseEntity<Map<String, String>> cauHinhGithub(
            @PathVariable UUID idNhom,
            @RequestBody Map<String, String> body) {
        configService.cauHinhGithub(idNhom, body.get("repo"), body.get("token"), body.get("since"));
        return ResponseEntity.ok(Map.of("message", "Cấu hình GitHub thành công"));
    }
}
