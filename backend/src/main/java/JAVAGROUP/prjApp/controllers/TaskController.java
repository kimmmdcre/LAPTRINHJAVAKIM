package javagroup.prjApp.controllers;

import lombok.RequiredArgsConstructor;

import javagroup.prjApp.dtos.TaskDTO;
import javagroup.prjApp.security.user.UserPrincipal;
import javagroup.prjApp.dtos.RequirementDTO;
import javagroup.prjApp.dtos.CommitDTO;

import javagroup.prjApp.services.TaskService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;

    @GetMapping(params = "groupId")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TaskDTO>> getTasksByGroup(
            @RequestParam("groupId") UUID groupId) {
        return ResponseEntity.ok(taskService.getTasksByGroup(groupId));
    }

    @GetMapping("/requirements")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<RequirementDTO>> getRequirementsByGroup(@RequestParam UUID groupId) {
        return ResponseEntity.ok(taskService.getRequirementsByGroup(groupId));
    }

    /**
     * GET /api/tasks/personal?studentId={uuid}
     * Get personal tasks for a student
     */
    @GetMapping("/personal")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TaskDTO>> getPersonalTasks(@RequestParam UUID studentId) {
        return ResponseEntity.ok(taskService.getPersonalTasks(studentId));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> updateTaskStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        taskService.updateTaskStatus(id, body.get("status"));
        return ResponseEntity.ok(Map.of("message", "Status updated successfully"));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<Map<String, String>> assignTask(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        taskService.assignTask(id, UUID.fromString(body.get("studentId")), principal.getId());
        return ResponseEntity.ok(Map.of("message", "Task assigned successfully"));
    }

    @GetMapping("/commits")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CommitDTO>> getGroupCommits(@RequestParam UUID groupId) {
        return ResponseEntity.ok(taskService.getGroupCommits(groupId));
    }
}
