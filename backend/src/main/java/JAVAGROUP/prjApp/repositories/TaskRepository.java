package javagroup.prjApp.repositories;

import javagroup.prjApp.entities.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {
    List<Task> findByStudent_Id(UUID studentId);

    List<Task> findByRequirement_ProjectGroup_GroupId(UUID groupId);
}