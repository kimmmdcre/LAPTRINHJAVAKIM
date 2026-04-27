package javagroup.prjapp.dtos;

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
    private int completedTaskCount;
    private int commitCount;
}
