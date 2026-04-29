package javagroup.prjApp.features.groups;

import javagroup.prjApp.features.groups.GroupRole;

import javagroup.prjApp.features.groups.GroupDTO;
import javagroup.prjApp.features.groups.GroupMemberDTO;
import javagroup.prjApp.features.users.Admin;
import javagroup.prjApp.features.auth.BlacklistedToken;
import javagroup.prjApp.features.groups.Group;
import javagroup.prjApp.features.groups.GroupMember;
import javagroup.prjApp.features.groups.GroupMemberId;
import javagroup.prjApp.features.tasks.IntegrationConfig;
import javagroup.prjApp.features.tasks.Requirement;
import javagroup.prjApp.features.users.Student;
import javagroup.prjApp.features.tasks.Task;
import javagroup.prjApp.features.users.Teacher;
import javagroup.prjApp.features.users.User;
import javagroup.prjApp.features.tasks.VcsCommit;
import javagroup.prjApp.features.users.AdminRepository;
import javagroup.prjApp.features.auth.BlacklistedTokenRepository;
import javagroup.prjApp.features.groups.GroupMemberRepository;
import javagroup.prjApp.features.groups.GroupRepository;
import javagroup.prjApp.features.tasks.IntegrationConfigRepository;
import javagroup.prjApp.features.tasks.RequirementRepository;
import javagroup.prjApp.features.users.StudentRepository;
import javagroup.prjApp.features.tasks.TaskRepository;
import javagroup.prjApp.features.users.TeacherRepository;
import javagroup.prjApp.features.users.UserRepository;
import javagroup.prjApp.features.tasks.VcsCommitRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class GroupService {

    private final GroupRepository groupRepository;
    private final TeacherRepository teacherRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final StudentRepository studentRepository;

    public GroupService(GroupRepository groupRepository,
                        TeacherRepository teacherRepository,
                        GroupMemberRepository groupMemberRepository,
                        StudentRepository studentRepository) {
        this.groupRepository = groupRepository;
        this.teacherRepository = teacherRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.studentRepository = studentRepository;
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
                            student.getId(), student.getFullName(), student.getStudentCode(), gm.getRole()
                    );
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
    public void removeMember(UUID studentId) {
        groupMemberRepository.deleteById_StudentId(studentId);
    }

    private GroupDTO toDTO(Group group) {
        Teacher teacher = group.getTeacher();
        List<GroupMemberDTO> members = group.getMembers() == null ? List.of() :
            group.getMembers().stream()
                .map(gm -> {
                    Student student = gm.getStudent();
                    return new GroupMemberDTO(
                        student.getId(), student.getFullName(), student.getStudentCode(), gm.getRole()
                    );
                })
                .collect(Collectors.toList());
                
        return new GroupDTO(
                group.getGroupId(), group.getGroupName(), group.getProjectTopic(),
                teacher != null ? teacher.getId() : null,
                teacher != null ? teacher.getFullName() : null,
                group.getLeaderId(),
                members
        );
    }
}
