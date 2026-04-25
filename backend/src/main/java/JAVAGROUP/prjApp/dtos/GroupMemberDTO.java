package JAVAGROUP.prjApp.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import JAVAGROUP.prjApp.entities.GroupRole;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupMemberDTO {
    private UUID studentId;
    private String fullName;
    private String studentCode;
    private GroupRole role;
}
