package javagroup.prjApp.dtos;

import javagroup.prjApp.enums.GroupRole;
import javagroup.prjApp.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Data Transfer Object cho Thành viên nhóm.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupMemberDTO {
    private UUID groupId;
    private UUID studentId;
    private String studentName;
    private String studentCode;
    private GroupRole role;
    private UserStatus status;
}