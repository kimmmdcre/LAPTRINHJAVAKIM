package javagroup.prjApp.controllers;

import javagroup.prjApp.dtos.TaskDTO;
import javagroup.prjApp.security.user.UserPrincipal;
import javagroup.prjApp.dtos.RequirementDTO;
import javagroup.prjApp.dtos.CommitDTO;

import javagroup.prjApp.services.TaskService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
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
     * GET /api/tasks?groupId={groupId}
     * Get list of tasks for the group
     */
    @GetMapping(params = "groupId")
    public ResponseEntity<List<TaskDTO>> getTasksByGroup(
            @RequestParam("groupId") UUID groupId) {
        return ResponseEntity.ok(taskService.getTasksByGroup(groupId));
    }

    /**
     * GET /api/tasks/requirements?groupId={uuid}
     * Get list of requirements (Jira Issues) for a group
     */
    @GetMapping("/requirements")
    public ResponseEntity<List<RequirementDTO>> getRequirementsByGroup(@RequestParam UUID groupId) {
        return ResponseEntity.ok(taskService.getRequirementsByGroup(groupId));
    }

    /**
     * GET /api/tasks/personal?studentId={uuid}
     * Get personal tasks for a student
     */
    @GetMapping("/personal")
    public ResponseEntity<List<TaskDTO>> getPersonalTasks(@RequestParam UUID studentId) {
        return ResponseEntity.ok(taskService.getPersonalTasks(studentId));
    }

    /**
     * PATCH /api/tasks/{id}/status
     * Update task status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, String>> updateTaskStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        taskService.updateTaskStatus(id, body.get("status"));
        return ResponseEntity.ok(Map.of("message", "Status updated successfully"));
    }

    /**
     * PATCH /api/tasks/{id}/assign
     * Assign task to student
     */
    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER')")
    public ResponseEntity<Map<String, String>> assignTask(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        taskService.assignTask(id, UUID.fromString(body.get("studentId")), principal.getId());
        return ResponseEntity.ok(Map.of("message", "Task assigned successfully"));
    }

    /**
     * GET /api/tasks/commits?groupId={uuid}
     * Get group commits
     */
    @GetMapping("/commits")
    public ResponseEntity<List<CommitDTO>> getGroupCommits(@RequestParam UUID groupId) {
        return ResponseEntity.ok(taskService.getGroupCommits(groupId));
    }
}
