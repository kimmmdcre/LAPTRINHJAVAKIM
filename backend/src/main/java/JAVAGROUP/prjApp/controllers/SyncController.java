package javagroup.prjApp.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javagroup.prjApp.services.SyncService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/sync")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
public class SyncController {

    private final SyncService syncService;

    public SyncController(SyncService syncService) {
        this.syncService = syncService;
    }

    /**
     * POST /api/sync/{groupId}/jira
     * Trigger Jira synchronization
     */
    @PostMapping("/{groupId}/jira")
    public ResponseEntity<Map<String, String>> syncJira(@PathVariable UUID groupId) {
        syncService.syncJira(groupId);
        return ResponseEntity.ok(Map.of("message", "Jira sync successful"));
    }

    /**
     * POST /api/sync/{groupId}/github
     * Trigger GitHub synchronization
     */
    @PostMapping("/{groupId}/github")
    public ResponseEntity<Map<String, String>> syncGithub(@PathVariable UUID groupId) {
        syncService.syncGithub(groupId);
        return ResponseEntity.ok(Map.of("message", "GitHub sync successful"));
    }

    /**
     * POST /api/sync/mapping
     * Map commits to tasks based on messages
     */
    /**
     * POST /api/sync/{groupId}/mapping
     * Trigger commit-to-task mapping for a specific group
     */
    @PostMapping("/{groupId}/mapping")
    public ResponseEntity<Map<String, Object>> mapTasksToCommits(@PathVariable UUID groupId) {
        int count = syncService.mapTasksToCommits(groupId);
        return ResponseEntity.ok(Map.of(
            "message", "Khớp dữ liệu hoàn tất!",
            "mappedCount", count
        ));
    }

    /**
     * POST /api/sync/{groupId}/full
     * Trigger Full synchronization (Jira + GitHub + Mapping)
     */
    @PostMapping("/{groupId}/full")
    public ResponseEntity<Map<String, String>> syncFull(@PathVariable UUID groupId) {
        syncService.syncFull(groupId);
        return ResponseEntity.ok(Map.of("message", "Full sync successful"));
    }
}
