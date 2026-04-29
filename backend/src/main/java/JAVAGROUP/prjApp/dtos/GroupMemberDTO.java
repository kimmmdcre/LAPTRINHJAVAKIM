package javagroup.prjApp.dtos;

import javagroup.prjApp.enums.GroupRole;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupMemberDTO {
    private UUID studentId;
    private String fullName;
    private String studentCode;
    private GroupRole role;
}
