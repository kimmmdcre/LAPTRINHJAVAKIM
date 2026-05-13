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
    private boolean isExternalAuthor;
    private boolean isUnlinkedTask;

}
