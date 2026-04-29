package javagroup.prjApp.features.groups;

import javagroup.prjApp.features.groups.GroupRole;

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
