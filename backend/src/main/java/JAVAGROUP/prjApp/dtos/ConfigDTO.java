package javagroup.prjapp.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfigDTO {
    private UUID id;
    private UUID groupId;
    private String platformType; // JIRA or GITHUB
    private String url;
    private String email;
    private String apiToken;
    private String projectKey;
    private String repoUrl;
}
