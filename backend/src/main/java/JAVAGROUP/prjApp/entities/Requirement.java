package javagroup.prjApp.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    @org.hibernate.annotations.CreationTimestamp
    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @org.hibernate.annotations.UpdateTimestamp
    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;
}
