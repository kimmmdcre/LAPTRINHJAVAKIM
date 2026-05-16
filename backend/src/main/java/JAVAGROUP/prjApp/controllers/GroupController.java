package javagroup.prjApp.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;

import javagroup.prjApp.dtos.GroupDTO;
import javagroup.prjApp.dtos.GroupMemberDTO;
import javagroup.prjApp.entities.Group;
import javagroup.prjApp.services.GroupService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    /**
     * POST /api/groups
     * Create new group
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<GroupDTO> createGroup(@RequestBody GroupDTO dto) {
        Group group = groupService.createGroup(dto);
        return ResponseEntity.ok(groupService.getGroupInfo(group.getGroupId()));
    }

    /**
     * DELETE /api/groups/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteGroup(@PathVariable UUID id) {
        groupService.deleteGroup(id);
        return ResponseEntity.ok(Map.of("message", "Group deleted successfully"));
    }

    /**
     * PATCH /api/groups/{id}/assign
     * Assign teacher to group
     */
    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> assignTeacher(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        groupService.assignTeacher(id, UUID.fromString(body.get("teacherId")));
        return ResponseEntity.ok(Map.of("message", "Teacher assigned successfully"));
    }

    /**
     * GET /api/groups
     * Get list of groups (all or by teacher)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<GroupDTO>> getAllGroups(
            @RequestParam(required = false) UUID teacherId) {
        return ResponseEntity.ok(groupService.getAllGroups(teacherId));
    }

    /**
     * GET /api/groups/{id}
     * View group details
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GroupDTO> getGroupInfo(@PathVariable UUID id) {
        return ResponseEntity.ok(groupService.getGroupInfo(id));
    }

    /**
     * GET /api/groups/{id}/members
     * Get group members
     */
    @GetMapping("/{id}/members")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<GroupMemberDTO>> getGroupMembers(@PathVariable UUID id) {
        return ResponseEntity.ok(groupService.getGroupMembers(id));
    }

    /**
     * POST /api/groups/{groupId}/members/{studentId}
     * Add student to group
     */
    @PostMapping("/{groupId}/members/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> addMember(
            @PathVariable UUID groupId,
            @PathVariable UUID studentId) {
        groupService.addMember(groupId, studentId);
        return ResponseEntity.ok(Map.of("message", "Member added successfully"));
    }

    /**
     * DELETE /api/groups/{groupId}/members/{studentId}
     * Remove student from group
     */
    @DeleteMapping("/{groupId}/members/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> removeMember(
            @PathVariable UUID groupId,
            @PathVariable UUID studentId) {
        groupService.removeMember(groupId, studentId);
        return ResponseEntity.ok(Map.of("message", "Member removed from group"));
    }

    /**
     * PATCH /api/groups/{id}/leader
     */
    @PatchMapping("/{id}/leader")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<Map<String, String>> setLeader(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        groupService.setLeader(id, UUID.fromString(body.get("leaderId")));
        return ResponseEntity.ok(Map.of("message", "Group leader set successfully"));
    }
}
