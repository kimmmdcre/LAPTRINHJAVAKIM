package javagroup.prjApp.services;

import javagroup.prjApp.dtos.UserDTO;
import javagroup.prjApp.enums.UserRole;
import java.util.List;
import java.util.UUID;

public interface UserService {
    List<UserDTO> getAllUsers();
    List<UserDTO> getAllTeachers();
    List<UserDTO> getUnassignedStudents();
    void createAccount(UserDTO dto);
    void deleteAccount(UUID id);
    void updateAccount(UUID id, UserDTO dto);
    void assignRole(UUID id, UserRole role);
    void updateStatus(UUID id, javagroup.prjApp.enums.UserStatus status);
    void bulkCreateAccounts(List<UserDTO> dtos);
    
    // For profile & internal use
    UserDTO getUserById(UUID id);
    UserDTO getUserProfile(String username);
    void updateUserProfile(String username, UserDTO userDTO);
    UUID getGroupIdByStudent(UUID studentId);
}
