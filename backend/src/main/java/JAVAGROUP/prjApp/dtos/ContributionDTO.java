package javagroup.prjApp.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContributionDTO {
    private UUID studentId;
    private String studentName;
    private String studentCode;
    private int completedTaskCount;
    private int commitCount;
    private String status;
}