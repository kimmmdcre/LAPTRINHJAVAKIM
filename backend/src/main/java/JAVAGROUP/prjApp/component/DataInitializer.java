package javagroup.prjApp.component;

import javagroup.prjApp.entities.*;
import javagroup.prjApp.repositories.*;
import javagroup.prjApp.enums.*;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
public class DataInitializer implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
            AdminRepository adminRepository,
            TeacherRepository teacherRepository,
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        logger.info("Initializing system data (Data Seed)...");

        seedAdmin("admin", "admin", "System Administrator", "admin@system.com", "AD001");
        seedTeacher("teacher", "teacher", "Default Teacher", "teacher@system.com", "TC001");

        // Students for testing group roles
        seedStudent("leader", "leader", "Group Leader", "leader@system.com", "ST_LEAD");
        seedStudent("member", "member", "Group Member", "member@system.com", "ST_MEM");

        seedStudent("student1", "student1", "Student One", "student1@system.com", "ST001");
        seedStudent("student2", "student2", "Student Two", "student2@system.com", "ST002");

        logger.info("Data initialization completed.");
    }

    private void seedAdmin(String username, String password, String fullName, String email, String adminCode) {
        if (userRepository.findByUsername(username).isEmpty()) {
            Admin admin = new Admin();
            admin.setUsername(username);
            admin.setPasswordHash(passwordEncoder.encode(password));
            admin.setFullName(fullName);
            admin.setEmail(email);
            admin.setStatus(UserStatus.ACTIVE);
            admin.setRoleCode(UserRole.ADMIN);
            admin.setAdminCode(adminCode);
            admin.setAdminLevel("SUPER_ADMIN");
            adminRepository.save(admin);
            logger.info("Created default Admin: {}", username);
        } else {
            logger.debug("Admin '{}' already exists, skipping creation.", username);
        }
    }

    private void seedTeacher(String username, String password, String fullName, String email, String teacherCode) {
        if (userRepository.findByUsername(username).isEmpty()) {
            Teacher teacher = new Teacher();
            teacher.setUsername(username);
            teacher.setPasswordHash(passwordEncoder.encode(password));
            teacher.setFullName(fullName);
            teacher.setEmail(email);
            teacher.setStatus(UserStatus.ACTIVE);
            teacher.setRoleCode(UserRole.TEACHER);
            teacher.setTeacherCode(teacherCode);
            teacher.setDepartment("Computer Science");
            teacherRepository.save(teacher);
            logger.info("Created default Teacher: {}", username);
        } else {
            logger.debug("Teacher '{}' already exists, skipping creation.", username);
        }
    }

    private void seedStudent(String username, String password, String fullName, String email, String studentCode) {
        if (userRepository.findByUsername(username).isEmpty()) {
            Student student = new Student();
            student.setUsername(username);
            student.setPasswordHash(passwordEncoder.encode(password));
            student.setFullName(fullName);
            student.setEmail(email);
            student.setStatus(UserStatus.ACTIVE);
            student.setRoleCode(UserRole.STUDENT);
            student.setStudentCode(studentCode);
            student.setClassName("IT-01");
            studentRepository.save(student);
            logger.info("Created default Student: {}", username);
        } else {
            logger.debug("Student '{}' already exists, skipping creation.", username);
        }
    }
}
