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
@Table(name = "teachers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Teacher extends User {

    @Column(name = "teacher_code", nullable = false, unique = true)
    private String teacherCode;

    @Column(name = "department")
    private String department;

    @OneToMany(mappedBy = "teacher")
    private List<Group> projectGroups;
}