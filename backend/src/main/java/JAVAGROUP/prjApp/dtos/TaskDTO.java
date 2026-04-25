package JAVAGROUP.prjApp.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskDTO {
    private UUID taskId;
    private String taskName;
    private String jiraKey;
    private String description;
    private String status;
    private LocalDateTime deadline;
    private Double progressPercentage;
    private UUID requirementId;
    private UUID studentId;
    private String studentFullName;
    private Integer commitCount;
}
