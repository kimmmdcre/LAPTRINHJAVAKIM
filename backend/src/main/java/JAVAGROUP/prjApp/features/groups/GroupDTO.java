package javagroup.prjApp.features.groups;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupDTO {
    private UUID groupId;
    private String groupName;
    private String projectTopic;
    private UUID teacherId;
    private String teacherName;
    private UUID leaderId;
    private List<GroupMemberDTO> members;
}
