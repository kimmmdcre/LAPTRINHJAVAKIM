package javagroup.prjApp.features.tasks;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "integration_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class IntegrationConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "config_id", updatable = false, nullable = false)
    private UUID configId;

    @Column(name = "platform_type", nullable = false)
    private String platformType; // JIRA, GITHUB

    @Column(name = "url")
    private String url;

    @Column(name = "api_token", columnDefinition = "NVARCHAR(MAX)")
    private String apiToken;

    @Column(name = "email")
    private String email;

    @Column(name = "project_key")
    private String projectKey;

    @Column(name = "repo_url")
    private String repoUrl;

    @Column(name = "group_id")
    private UUID groupId;
}
