package javagroup.prjapp.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "task_id", updatable = false, nullable = false)
    private UUID taskId;

    @Column(name = "task_name", nullable = false, columnDefinition = "NVARCHAR(500)")
    private String taskName;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "status")
    private String status;

    @Column(name = "deadline")
    private LocalDateTime deadline;

    @Column(name = "progress_percentage")
    private Double progressPercentage;

    @ManyToOne
    @JoinColumn(name = "requirement_id")
    private Requirement requirement;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
