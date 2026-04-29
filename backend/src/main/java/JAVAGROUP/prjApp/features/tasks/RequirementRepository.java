package javagroup.prjApp.features.tasks;

import javagroup.prjApp.features.tasks.Requirement;
import javagroup.prjApp.features.groups.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RequirementRepository extends JpaRepository<Requirement, UUID> {
    List<Requirement> findByProjectGroup_GroupId(UUID groupId);
    Optional<Requirement> findByJiraKey(String jiraKey);
    Optional<Requirement> findByJiraKeyAndProjectGroup(String jiraKey, Group group);
}
