package javagroup.prjApp.features.users;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import javagroup.prjApp.features.groups.Group;

@Entity
@Table(name = "teachers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Teacher extends User {

    @Column(name = "teacher_code", nullable = false, unique = true)
    private String teacherCode;

    @Column(name = "department", columnDefinition = "NVARCHAR(255)")
    private String department;

    @OneToMany(mappedBy = "teacher")
    private List<Group> projectGroups;
}
