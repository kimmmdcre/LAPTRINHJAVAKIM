package javagroup.prjApp.dtos;

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
    private String jiraUrl;
    private String githubUrl;
    private List<GroupMemberDTO> members;
}
