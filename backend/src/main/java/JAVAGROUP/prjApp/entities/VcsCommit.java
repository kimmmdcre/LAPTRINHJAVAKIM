package javagroup.prjApp.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "vcs_commits") // version control system commits
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VcsCommit {

    @Id
    @Column(name = "sha", nullable = false) // sha: Secure Hash Algorithm
    private String sha;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requirement_id")
    private Requirement requirement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @Column(name = "message")
    private String message;

    @Column(name = "commit_time")
    private LocalDateTime commitTime;

    @Column(name = "author_email")
    private String authorEmail;

    @Column(name = "author_name")
    private String authorName;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}