package javagroup.prjApp.features.reports;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProgressDTO {
    private UUID groupId;
    private int totalTasks;
    private int completedTasks;
    private double progressPercentage;
}
