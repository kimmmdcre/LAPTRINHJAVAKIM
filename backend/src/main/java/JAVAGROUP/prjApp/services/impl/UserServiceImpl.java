package javagroup.prjApp.services.impl;

import lombok.RequiredArgsConstructor;

import javagroup.prjApp.services.UserService;
import javagroup.prjApp.enums.UserStatus;
import javagroup.prjApp.enums.UserRole;
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
import java.util.ArrayList;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@SuppressWarnings("null")
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    private void validatePhoneNumber(String phoneNumber, UUID excludeUserId) {
        if (phoneNumber == null || phoneNumber.trim().isEmpty())
            return;

        String cleaned = phoneNumber.trim();
        if (!cleaned.matches("\\d{10}")) {
            throw new RuntimeException("Invalid phone number. It must contain exactly 10 digits.");
        }

        userRepository.findByPhoneNumber(cleaned).ifPresent(existingUser -> {
            if (excludeUserId == null || !existingUser.getId().equals(excludeUserId)) {
                throw new RuntimeException("This phone number is already in use by another user.");
            }
        });
    }

    @Override
    public void createAccount(UserDTO dto) {
        validatePhoneNumber(dto.getPhoneNumber(), null);
        User user;
        UserRole role = dto.getRoleCode();

        if (UserRole.ADMIN.equals(role)) {
            Admin admin = new Admin();
            admin.setAdminCode("AD_" + dto.getUsername());
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
        String password = (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) ? dto.getPassword()
                : "123456";
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setGender(dto.getGender());
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
    public void updateStatus(UUID id, UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User does not exist: " + id));
        user.setStatus(status);
        userRepository.save(user);
    }

    @Override
    public void updateAccount(UUID id, UserDTO dto) {
        validatePhoneNumber(dto.getPhoneNumber(), id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User does not exist: " + id));
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setGender(dto.getGender());
        if (dto.getUsername() != null && !dto.getUsername().trim().isEmpty()) {
            user.setUsername(dto.getUsername());
        }
        if (dto.getRoleCode() != null) {
            user.setRoleCode(dto.getRoleCode());
        }
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        }
        if (dto.getStatus() != null) {
            user.setStatus(dto.getStatus());
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
    public UserDTO getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        return toDTO(user);
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
        validatePhoneNumber(userDTO.getPhoneNumber(), user.getId());
        user.setFullName(userDTO.getFullName());
        user.setEmail(userDTO.getEmail());
        user.setPhoneNumber(userDTO.getPhoneNumber());
        user.setGender(userDTO.getGender());
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

    @Override
    public void bulkCreateAccounts(List<UserDTO> dtos) {
        List<String> errors = new ArrayList<>();
        for (UserDTO dto : dtos) {
            try {
                this.createAccount(dto);
            } catch (Exception e) {
                errors.add("User " + dto.getUsername() + ": " + e.getMessage());
            }
        }
        if (!errors.isEmpty()) {
            throw new RuntimeException("Bulk creation partial success. Errors: " + String.join("; ", errors));
        }
    }

    private UserDTO toDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                null, // hide password
                user.getFullName(),
                user.getEmail(),
                user.getStatus(),
                user.getRoleCode(),
                user.getPhoneNumber(),
                user.getGender(),
                user.getCreatedAt());
    }
}
