package javagroup.prjApp.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.Lob;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
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

    @Lob
    @Column(name = "api_token")
    private String apiToken;

    @Column(name = "email")
    private String email;

    @Column(name = "project_key")
    private String projectKey;

    @Column(name = "repo_url")
    private String repoUrl;

    @Column(name = "group_id")
    private UUID groupId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}