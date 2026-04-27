package javagroup.prjapp.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GitStatsDTO {
    private UUID groupId;
    private int totalCommits;
    private Map<String, Integer> commitsByStudent;
    private Map<String, Double> frequencyIndex;
    private Map<String, Double> qualityIndex;
}
