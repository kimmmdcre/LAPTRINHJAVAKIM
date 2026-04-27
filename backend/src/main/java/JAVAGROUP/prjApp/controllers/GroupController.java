package javagroup.prjapp.controllers;

import javagroup.prjapp.dtos.GroupDTO;
import javagroup.prjapp.dtos.GroupMemberDTO;
import javagroup.prjapp.entities.Group;
import javagroup.prjapp.services.GroupService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    /**
     * POST /api/groups
     * Create new group
     */
    @PostMapping
    public ResponseEntity<GroupDTO> createGroup(@RequestBody GroupDTO dto) {
        Group group = groupService.createGroup(dto);
        return ResponseEntity.ok(groupService.getGroupInfo(group.getGroupId()));
    }

    /**
     * DELETE /api/groups/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteGroup(@PathVariable UUID id) {
        groupService.deleteGroup(id);
        return ResponseEntity.ok(Map.of("message", "Group deleted successfully"));
    }

    /**
     * PATCH /api/groups/{id}/assign
     * Assign teacher to group
     */
    @PatchMapping("/{id}/assign")
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
    public ResponseEntity<List<GroupDTO>> getAllGroups(
            @RequestParam(required = false) UUID teacherId) {
        return ResponseEntity.ok(groupService.getAllGroups(teacherId));
    }

    /**
     * GET /api/groups/{id}
     * View group details
     */
    @GetMapping("/{id}")
    public ResponseEntity<GroupDTO> getGroupInfo(@PathVariable UUID id) {
        return ResponseEntity.ok(groupService.getGroupInfo(id));
    }

    /**
     * GET /api/groups/{id}/members
     * Get group members
     */
    @GetMapping("/{id}/members")
    public ResponseEntity<List<GroupMemberDTO>> getGroupMembers(@PathVariable UUID id) {
        return ResponseEntity.ok(groupService.getGroupMembers(id));
    }

    /**
     * POST /api/groups/{groupId}/members/{studentId}
     * Add student to group
     */
    @PostMapping("/{groupId}/members/{studentId}")
    public ResponseEntity<Map<String, String>> addMember(
            @PathVariable UUID groupId,
            @PathVariable UUID studentId) {
        groupService.addMember(groupId, studentId);
        return ResponseEntity.ok(Map.of("message", "Member added successfully"));
    }

    /**
     * DELETE /api/groups/members/{studentId}
     * Remove student from group
     */
    @DeleteMapping("/members/{studentId}")
    public ResponseEntity<Map<String, String>> removeMember(@PathVariable UUID studentId) {
        groupService.removeMember(studentId);
        return ResponseEntity.ok(Map.of("message", "Member removed from group"));
    }
}
