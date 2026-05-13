package javagroup.prjApp.dtos;

import javagroup.prjApp.enums.UserStatus;
import javagroup.prjApp.enums.UserRole;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private UUID id;
    private String username;
    private String fullName;
    private String email;
    private UserStatus status;
    private UserRole roleCode;
    private String phoneNumber;
    private String gender;
    private LocalDateTime createdAt;
    private String password;
}
