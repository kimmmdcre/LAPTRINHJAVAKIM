package javagroup.prjapp.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javagroup.prjapp.services.SyncService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/sync")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
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
    @PostMapping("/mapping")
    public ResponseEntity<Map<String, String>> mapTasksToCommits() {
        syncService.mapTasksToCommits();
        return ResponseEntity.ok(Map.of("message", "Commit-task mapping successful"));
    }
}
