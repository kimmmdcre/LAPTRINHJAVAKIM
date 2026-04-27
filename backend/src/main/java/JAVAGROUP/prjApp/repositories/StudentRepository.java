package javagroup.prjapp.repositories;

import javagroup.prjapp.entities.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {
    Optional<Student> findByStudentCode(String studentCode);
    Optional<Student> findByEmail(String email);

    @Query("SELECT s FROM Student s WHERE NOT EXISTS (SELECT tm FROM GroupMember tm WHERE tm.student.id = s.id)")
    List<Student> findUnassignedStudents();
}
