package javagroup.prjApp.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
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

    @Column(name = "task_name", nullable = false, length = 500)
    private String taskName;

    @Lob
    @Column(name = "description")
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

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}