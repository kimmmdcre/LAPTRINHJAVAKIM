package javagroup.prjApp.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.OneToMany;
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