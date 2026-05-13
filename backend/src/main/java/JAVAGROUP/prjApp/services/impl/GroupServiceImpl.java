package javagroup.prjApp.services.impl;

import javagroup.prjApp.services.GroupService;

import javagroup.prjApp.enums.GroupRole;

import javagroup.prjApp.dtos.GroupDTO;
import javagroup.prjApp.dtos.GroupMemberDTO;
import javagroup.prjApp.entities.Group;
import javagroup.prjApp.entities.GroupMember;
import javagroup.prjApp.entities.GroupMemberId;
import javagroup.prjApp.entities.Student;
import javagroup.prjApp.entities.Teacher;
import javagroup.prjApp.repositories.GroupMemberRepository;
import javagroup.prjApp.repositories.GroupRepository;
import javagroup.prjApp.repositories.StudentRepository;
import javagroup.prjApp.repositories.TeacherRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;
    private final TeacherRepository teacherRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final StudentRepository studentRepository;
    private final javagroup.prjApp.repositories.IntegrationConfigRepository integrationConfigRepository;

    public GroupServiceImpl(GroupRepository groupRepository,
            TeacherRepository teacherRepository,
            GroupMemberRepository groupMemberRepository,
            StudentRepository studentRepository,
            javagroup.prjApp.repositories.IntegrationConfigRepository integrationConfigRepository) {
        this.groupRepository = groupRepository;
        this.teacherRepository = teacherRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.studentRepository = studentRepository;
        this.integrationConfigRepository = integrationConfigRepository;
    }

    public Group createGroup(GroupDTO dto) {
        Group group = new Group();
        group.setGroupName(dto.getGroupName());
        group.setProjectTopic(dto.getProjectTopic());

        if (dto.getTeacherId() != null) {
            Teacher teacher = teacherRepository.findById(dto.getTeacherId())
                    .orElseThrow(() -> new RuntimeException("Teacher not found: " + dto.getTeacherId()));
            group.setTeacher(teacher);
        }

        return groupRepository.save(group);
    }

    public void deleteGroup(UUID groupId) {
        if (!groupRepository.existsById(groupId)) {
            throw new RuntimeException("Group does not exist: " + groupId);
        }
        groupRepository.deleteById(groupId);
    }

    public void assignTeacher(UUID groupId, UUID teacherId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group does not exist: " + groupId));
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher does not exist: " + teacherId));
        group.setTeacher(teacher);
        groupRepository.save(group);
    }

    @Transactional(readOnly = true)
    public List<GroupDTO> getAllGroups(UUID teacherId) {
        if (teacherId == null) {
            return groupRepository.findAll()
                    .stream().map(this::toDTO).collect(Collectors.toList());
        }
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher does not exist: " + teacherId));
        return (teacher.getProjectGroups() == null ? List.<Group>of() : teacher.getProjectGroups())
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GroupDTO getGroupInfo(UUID groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group does not exist: " + groupId));
        return toDTO(group);
    }

    @Transactional(readOnly = true)
    public List<GroupMemberDTO> getGroupMembers(UUID groupId) {
        return groupMemberRepository.findById_GroupId(groupId)
                .stream()
                .map(gm -> {
                    Student student = gm.getStudent();
                    return new GroupMemberDTO(
                            student.getId(), student.getFullName(), student.getStudentCode(), gm.getRole(), student.getStatus());
                })
                .collect(Collectors.toList());
    }

    /**
     * Add student to group.
     */
    public void addMember(UUID groupId, UUID studentId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group does not exist: " + groupId));
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student does not exist: " + studentId));

        // Remove from old groups if any
        groupMemberRepository.deleteById_StudentId(studentId);

        GroupMember gm = new GroupMember();
        gm.setId(new GroupMemberId(groupId, studentId));
        gm.setProjectGroup(group);
        gm.setStudent(student);
        gm.setRole(GroupRole.MEMBER);
        groupMemberRepository.save(gm);
    }

    /**
     * Remove student from group.
     */
    public void removeMember(UUID groupId, UUID studentId) {
        groupMemberRepository.deleteById(new GroupMemberId(groupId, studentId));
    }

    public void setLeader(UUID groupId, UUID studentId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group does not exist: " + groupId));
        
        // Verify student is actually in the group
        boolean isInGroup = group.getMembers().stream()
                .anyMatch(m -> m.getStudent().getId().equals(studentId));
        if (!isInGroup) {
            throw new RuntimeException("Student is not a member of this group");
        }

        // 1. Update Group entity
        group.setLeaderId(studentId);
        groupRepository.save(group);

        // 2. Sync GroupMember roles
        for (GroupMember gm : group.getMembers()) {
            if (gm.getStudent().getId().equals(studentId)) {
                gm.setRole(GroupRole.LEADER);
            } else {
                gm.setRole(GroupRole.MEMBER);
            }
            groupMemberRepository.save(gm);
        }
    }

    private GroupDTO toDTO(Group group) {
        Teacher teacher = group.getTeacher();
        List<GroupMemberDTO> members = group.getMembers() == null ? List.of()
                : group.getMembers().stream()
                        .map(gm -> {
                            Student student = gm.getStudent();
                            return new GroupMemberDTO(
                                    student.getId(), student.getFullName(), student.getStudentCode(), gm.getRole(), student.getStatus());
                        })
                        .collect(Collectors.toList());

        List<javagroup.prjApp.entities.IntegrationConfig> configs = integrationConfigRepository.findByGroupId(group.getGroupId());
        String jiraUrl = configs.stream()
                .filter(c -> "JIRA".equalsIgnoreCase(c.getPlatformType()))
                .map(javagroup.prjApp.entities.IntegrationConfig::getUrl)
                .findFirst().orElse(null);
        String githubUrl = configs.stream()
                .filter(c -> "GITHUB".equalsIgnoreCase(c.getPlatformType()))
                .map(javagroup.prjApp.entities.IntegrationConfig::getRepoUrl)
                .findFirst().orElse(null);

        return new GroupDTO(
                group.getGroupId(), group.getGroupName(), group.getProjectTopic(),
                teacher != null ? teacher.getId() : null,
                teacher != null ? teacher.getFullName() : null,
                group.getLeaderId(),
                jiraUrl,
                githubUrl,
                members);
    }
}
