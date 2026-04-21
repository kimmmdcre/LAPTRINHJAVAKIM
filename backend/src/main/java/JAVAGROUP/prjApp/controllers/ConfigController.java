package JAVAGROUP.prjApp.controllers;

import JAVAGROUP.prjApp.adapter.IGitHubClient;
import JAVAGROUP.prjApp.adapter.IJiraClient;
import JAVAGROUP.prjApp.entities.CauHinhTichHop;
import JAVAGROUP.prjApp.services.ConfigService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/config")
@CrossOrigin(origins = "*")
public class ConfigController {

    private final ConfigService configService;
    private final IGitHubClient gitHubClient;
    private final IJiraClient jiraClient;

    public ConfigController(ConfigService configService, IGitHubClient gitHubClient, IJiraClient jiraClient) {
        this.configService = configService;
        this.gitHubClient = gitHubClient;
        this.jiraClient = jiraClient;
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
        configService.cauHinhJira(
            idNhom, 
            body.get("url"), 
            body.get("email"), 
            body.get("token"), 
            body.get("projectKey"), 
            body.get("doneStatusName")
        );
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

    @GetMapping("/{idNhom}")
    public ResponseEntity<List<CauHinhTichHop>> getConfig(@PathVariable UUID idNhom) {
        return ResponseEntity.ok(configService.getConfigsByNhom(idNhom));
    }

    @PostMapping("/test/github")
    public ResponseEntity<Map<String, String>> testGithub(@RequestBody Map<String, String> body) {
        String repo = body.get("repo");
        if (repo == null) repo = body.get("repoUrl"); // fallback
        
        String token = body.get("token");
        if (token == null) token = body.get("maTruyCap"); // fallback
        
        gitHubClient.kiemTraKetNoi(repo, token);
        return ResponseEntity.ok(Map.of("message", "Kết nối GitHub thành công!"));
    }

    @PostMapping("/test/jira")
    public ResponseEntity<Map<String, String>> testJira(@RequestBody Map<String, String> body) {
        String url = body.get("url");
        if (url == null) url = body.get("duongDan");
        
        String email = body.get("email");
        
        String token = body.get("token");
        if (token == null) token = body.get("maTruyCap");
        
        String projectKey = body.get("projectKey");
        if (projectKey == null) projectKey = body.get("maDuAn");

        jiraClient.kiemTraKetNoi(url, email, token, projectKey);
        return ResponseEntity.ok(Map.of("message", "Kết nối Jira thành công!"));
    }
}
