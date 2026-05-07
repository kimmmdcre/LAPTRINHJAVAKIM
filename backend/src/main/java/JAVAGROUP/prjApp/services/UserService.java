package javagroup.prjApp.services;

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

public interface UserService {
    public void createAccount(UserDTO dto);
    public void deleteAccount(UUID id);
    public void assignRole(UUID id, UserRole role);
    public void updateAccount(UUID id, UserDTO dto);
    public List<UserDTO> getAllUsers();
    public List<UserDTO> getAllTeachers();
    public List<UserDTO> getUnassignedStudents();
    public UserDTO toDTO(User user);
}
