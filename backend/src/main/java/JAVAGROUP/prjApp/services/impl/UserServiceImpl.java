package javagroup.prjApp.services.impl;

import javagroup.prjApp.services.UserService;
import javagroup.prjApp.utils.enums.UserStatus;
import javagroup.prjApp.utils.enums.UserRole;
import javagroup.prjApp.dtos.UserDTO;
import javagroup.prjApp.entities.Teacher;
import javagroup.prjApp.entities.User;
import javagroup.prjApp.entities.Admin;
import javagroup.prjApp.entities.Student;
import javagroup.prjApp.repositories.UserRepository;
import javagroup.prjApp.repositories.StudentRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository,
                       StudentRepository studentRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
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

    @Override
    public void deleteAccount(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User does not exist: " + id);
        }
        userRepository.deleteById(id);
    }

    @Override
    public void assignRole(UUID id, UserRole role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User does not exist: " + id));
        user.setRoleCode(role);
        userRepository.save(user);
    }

    @Override
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

    @Override
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDTO> getAllTeachers() {
        return userRepository.findAll().stream()
                .filter(user -> UserRole.TEACHER.equals(user.getRoleCode()))
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDTO> getUnassignedStudents() {
        List<Student> allStudents = studentRepository.findAll();
        return allStudents.stream()
                .filter(student -> student.getGroupMembers() == null || student.getGroupMembers().isEmpty())
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserDTO getUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return toDTO(user);
    }

    @Override
    public void updateUserProfile(String username, UserDTO userDTO) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        user.setFullName(userDTO.getFullName());
        user.setEmail(userDTO.getEmail());
        userRepository.save(user);
    }

    @Override
    public UUID getGroupIdByStudent(UUID studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        if (student.getGroupMembers() != null && !student.getGroupMembers().isEmpty()) {
            return student.getGroupMembers().get(0).getProjectGroup().getGroupId();
        }
        return null;
    }

    private UserDTO toDTO(User user) {
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
