package JAVAGROUP.prjApp.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequirementDTO {
    private UUID requirementId;
    private String jiraKey;
    private String title;
    private String description;
    private String status;
    private UUID groupId;
}
