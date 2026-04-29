package javagroup.prjApp.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommitDTO {
    private String sha;
    private String message;
    private LocalDateTime commitTime;
    private String requirementId;
    private String requirementTitle;
    private String authorName;
    private String authorEmail;

    // Manual constructor for 6 arguments used in GitHubAdapter
    public CommitDTO(String sha, String message, LocalDateTime commitTime, String requirementId, String requirementTitle, String authorName) {
        this.sha = sha;
        this.message = message;
        this.commitTime = commitTime;
        this.requirementId = requirementId;
        this.requirementTitle = requirementTitle;
        this.authorName = authorName;
    }
}
