package javagroup.prjApp.features.users;

import javagroup.prjApp.features.users.UserStatus;
import javagroup.prjApp.features.users.UserRole;

import javagroup.prjApp.features.users.UserDTO;
import javagroup.prjApp.features.users.Teacher;
import javagroup.prjApp.features.users.User;
import javagroup.prjApp.features.users.Admin;
import javagroup.prjApp.features.users.Student;
import javagroup.prjApp.features.users.UserRepository;
import javagroup.prjApp.features.users.StudentRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       StudentRepository studentRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Create new user account from DTO.
     */
    public void createAccount(UserDTO dto) {
        User user;
        UserRole role = dto.getRoleCode();
        
        if (UserRole.ADMIN.equals(role)) {
            Admin admin = new Admin();
            admin.setAdminCode("AD_" + dto.getUsername());
            admin.setAdminLevel("1");
            user = admin;
        } else if (UserRole.TEACHER.equals(role)) {
            Teacher teacher = new Teacher();
            teacher.setTeacherCode("GV_" + dto.getUsername());
            teacher.setDepartment("Information Technology");
            user = teacher;
        } else {
            Student student = new Student();
            student.setStudentCode("SV_" + dto.getUsername());
            student.setClassName("K70-IT");
            user = student;
        }

        user.setUsername(dto.getUsername());
        String password = (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) ? dto.getPassword() : "123456";
        user.setPasswordHash(passwordEncoder.encode(password)); 
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setRoleCode(role);
        user.setStatus(UserStatus.ACTIVE);
        
        userRepository.save(user);
    }

    /**
     * Delete account by ID.
     */
    public void deleteAccount(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User does not exist: " + id);
        }
        userRepository.deleteById(id);
    }

    /**
     * Update role (roleCode) for user.
     */
    public void assignRole(UUID id, UserRole role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User does not exist: " + id));
        user.setRoleCode(role);
        userRepository.save(user);
    }

    /**
     * Update user information.
     */
    public void updateAccount(UUID id, UserDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User does not exist: " + id));
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setUsername(dto.getUsername());
        if (dto.getRoleCode() != null) {
            user.setRoleCode(dto.getRoleCode());
        }
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        }
        userRepository.save(user);
    }

    /**
     * Get list of all users.
     */
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get list of only teachers.
     */
    public List<UserDTO> getAllTeachers() {
        return userRepository.findAll().stream()
                .filter(user -> UserRole.TEACHER.equals(user.getRoleCode()))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get list of unassigned students.
     */
    public List<UserDTO> getUnassignedStudents() {
        List<Student> allStudents = studentRepository.findAll();
        
        return allStudents.stream()
                .filter(student -> student.getGroupMembers() == null || student.getGroupMembers().isEmpty())
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Convert User Entity to UserDTO.
     */
    public UserDTO toDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getStatus(),
                user.getRoleCode(),
                null // hide password
        );
    }
}
