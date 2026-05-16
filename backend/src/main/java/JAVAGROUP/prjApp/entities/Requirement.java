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
import jakarta.persistence.OneToMany;
import jakarta.persistence.CascadeType;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "requirements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Requirement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "requirement_id", updatable = false, nullable = false)
    private UUID requirementId;

    @Column(name = "jira_key")
    private String jiraKey;

    @Column(name = "title", nullable = false, length = 500)
    private String title;

    @Lob
    @Column(name = "description")
    private String description;

    @Column(name = "status")
    private String status;

    @ManyToOne
    @JoinColumn(name = "group_id")
    private Group projectGroup;

    @OneToMany(mappedBy = "requirement", cascade = CascadeType.ALL)
    private List<Task> tasks;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}