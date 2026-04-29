package javagroup.prjApp.entities;

import jakarta.persistence.*;
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

    @Column(name = "group_name", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String groupName;

    @Column(name = "project_topic", columnDefinition = "NVARCHAR(500)")
    private String projectTopic;

    @ManyToOne
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    @Column(name = "leader_id")
    private UUID leaderId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "projectGroup", cascade = CascadeType.ALL)
    private List<GroupMember> members;

    @OneToMany(mappedBy = "projectGroup")
    private List<Requirement> requirements;
}
