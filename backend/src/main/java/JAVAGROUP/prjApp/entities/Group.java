package javagroup.prjApp.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;
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
@Table(name = "project_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "group_id", updatable = false, nullable = false)
    private UUID groupId;

    @Column(name = "group_name", nullable = false)
    private String groupName;

    @Column(name = "project_topic", length = 500)
    private String projectTopic;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    @Column(name = "leader_id")
    private UUID leaderId;

    @OneToMany(mappedBy = "projectGroup", cascade = CascadeType.ALL)
    private List<GroupMember> members;

    @OneToMany(mappedBy = "projectGroup")
    private List<Requirement> requirements;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}