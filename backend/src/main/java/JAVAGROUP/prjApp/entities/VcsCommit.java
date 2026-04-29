package javagroup.prjApp.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "vcs_commits")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VcsCommit {

    @Id
    @Column(name = "sha", nullable = false)
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
}
