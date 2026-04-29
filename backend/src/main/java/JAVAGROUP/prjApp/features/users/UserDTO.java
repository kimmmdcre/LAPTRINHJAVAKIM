package javagroup.prjApp.features.users;

import javagroup.prjApp.features.users.UserStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

import javagroup.prjApp.features.users.UserRole;

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
    private String password;
}
