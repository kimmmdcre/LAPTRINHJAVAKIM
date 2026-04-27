package javagroup.prjapp.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Student extends User {

    @Column(name = "student_code", nullable = false, unique = true)
    private String studentCode;

    @Column(name = "class_name")
    private String className;

    @OneToMany(mappedBy = "student")
    private List<GroupMember> groupMembers;
}
