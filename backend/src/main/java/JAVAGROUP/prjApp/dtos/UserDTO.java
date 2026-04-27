package javagroup.prjapp.dtos;

import javagroup.prjapp.enums.UserStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private String roleCode;
    private String password;
}
