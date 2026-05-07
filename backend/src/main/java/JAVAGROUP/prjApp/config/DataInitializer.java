package javagroup.prjApp.config;

import javagroup.prjApp.utils.enums.UserStatus;
import javagroup.prjApp.utils.enums.GroupRole;
import javagroup.prjApp.utils.enums.UserRole;

import javagroup.prjApp.entities.Admin;
import javagroup.prjApp.entities.BlacklistedToken;
import javagroup.prjApp.entities.Group;
import javagroup.prjApp.entities.GroupMember;
import javagroup.prjApp.entities.GroupMemberId;
import javagroup.prjApp.entities.IntegrationConfig;
import javagroup.prjApp.entities.Requirement;
import javagroup.prjApp.entities.Student;
import javagroup.prjApp.entities.Task;
import javagroup.prjApp.entities.Teacher;
import javagroup.prjApp.entities.User;
import javagroup.prjApp.entities.VcsCommit;
import javagroup.prjApp.repositories.AdminRepository;
import javagroup.prjApp.repositories.BlacklistedTokenRepository;
import javagroup.prjApp.repositories.GroupMemberRepository;
import javagroup.prjApp.repositories.GroupRepository;
import javagroup.prjApp.repositories.IntegrationConfigRepository;
import javagroup.prjApp.repositories.RequirementRepository;
import javagroup.prjApp.repositories.StudentRepository;
import javagroup.prjApp.repositories.TaskRepository;
import javagroup.prjApp.repositories.TeacherRepository;
import javagroup.prjApp.repositories.UserRepository;
import javagroup.prjApp.repositories.VcsCommitRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class DataInitializer implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);


    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           AdminRepository adminRepository,
                           TeacherRepository teacherRepository,
                           StudentRepository studentRepository,
                           GroupRepository groupRepository,
                           GroupMemberRepository groupMemberRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {

        // 1. Seed Admin
        Admin admin = adminRepository.findByAdminCode("AD001")
                .orElseGet(() -> {
                    Admin newAdmin = new Admin();
                    newAdmin.setAdminCode("AD001");
                    return newAdmin;
                });
        admin.setUsername("admin");
        admin.setPasswordHash(passwordEncoder.encode("admin"));
        admin.setFullName("Admin Hệ Thống");
        admin.setEmail("admin@prj.com");
        admin.setStatus(UserStatus.ACTIVE);
        admin.setRoleCode(UserRole.ADMIN);
        admin.setAdminLevel("SUPER_ADMIN");
        adminRepository.save(admin);

        // 2. Seed Teacher
        Teacher teacher = teacherRepository.findByTeacherCode("GV001")
                .orElseGet(() -> {
                    Teacher newTeacher = new Teacher();
                    newTeacher.setTeacherCode("GV001");
                    return newTeacher;
                });
        teacher.setUsername("teacher");
        teacher.setPasswordHash(passwordEncoder.encode("teacher"));
        teacher.setFullName("Giảng Viên Hướng Dẫn");
        teacher.setEmail("teacher@prj.com");
        teacher.setStatus(UserStatus.ACTIVE);
        teacher.setRoleCode(UserRole.TEACHER);
        teacher.setDepartment("Kỹ thuật Giao thông");
        teacher = teacherRepository.save(teacher);

        // 3. Seed Students
        Student leader = studentRepository.findByStudentCode("SV001")
                .orElseGet(() -> {
                    Student newL = new Student();
                    newL.setStudentCode("SV001");
                    return newL;
                });
        leader.setUsername("leader");
        leader.setPasswordHash(passwordEncoder.encode("leader"));
        leader.setFullName("Sinh Viên Trưởng Nhóm");
        leader.setEmail("leader@prj.com");
        leader.setStatus(UserStatus.ACTIVE);
        leader.setRoleCode(UserRole.STUDENT);
        leader.setClassName("K65-CNTT");
        leader = studentRepository.save(leader);

        Student member = studentRepository.findByStudentCode("SV002")
                .orElseGet(() -> {
                    Student newM = new Student();
                    newM.setStudentCode("SV002");
                    return newM;
                });
        member.setUsername("member");
        member.setPasswordHash(passwordEncoder.encode("member"));
        member.setFullName("Sinh Viên Thành Viên");
        member.setEmail("member@prj.com");
        member.setStatus(UserStatus.ACTIVE);
        member.setRoleCode(UserRole.STUDENT);
        member.setClassName("K65-CNTT");
        member = studentRepository.save(member);

        // 4. Seed Group
        final Teacher finalTeacher = teacher;
        final Student finalLeader = leader;
        final Student finalMember = member;

        if (groupRepository.findAll().stream().noneMatch(n -> n.getGroupName().contains("JiraGit"))) {
            Group group = new Group();
            group.setGroupName("Nhóm 1 - Dự án JiraGit");
            group.setProjectTopic("Xây dựng hệ thống quản lý đồ án sinh viên tích hợp Jira/GitHub");
            group.setTeacher(finalTeacher);
            group = groupRepository.save(group);

            // Add members to group
            GroupMember leaderMember = new GroupMember();
            leaderMember.setId(new GroupMemberId(group.getGroupId(), finalLeader.getId()));
            leaderMember.setProjectGroup(group);
            leaderMember.setStudent(finalLeader);
            leaderMember.setRole(GroupRole.LEADER);
            groupMemberRepository.save(leaderMember);

            GroupMember regularMember = new GroupMember();
            regularMember.setId(new GroupMemberId(group.getGroupId(), finalMember.getId()));
            regularMember.setProjectGroup(group);
            regularMember.setStudent(finalMember);
            regularMember.setRole(GroupRole.MEMBER);
            groupMemberRepository.save(regularMember);
        }
        
        logger.info(">>> Hệ thống đã cập nhật/khởi tạo tài khoản test (admin/teacher/leader/member) thành công!");
    }
}
