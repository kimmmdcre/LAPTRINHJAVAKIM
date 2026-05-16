package javagroup.prjApp.entities;

import javagroup.prjApp.enums.GroupRole;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "group_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GroupMember {

    @EmbeddedId
    private GroupMemberId id;

    @ManyToOne
    @MapsId("groupId")
    @JoinColumn(name = "group_id")
    private Group projectGroup;

    @ManyToOne
    @MapsId("studentId")
    @JoinColumn(name = "student_id")
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private GroupRole role;
}