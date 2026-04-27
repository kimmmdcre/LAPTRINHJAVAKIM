package javagroup.prjapp.repositories;

import javagroup.prjapp.entities.VcsCommit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VcsCommitRepository extends JpaRepository<VcsCommit, String> {
    @Query("SELECT c FROM VcsCommit c JOIN FETCH c.requirement r WHERE r.projectGroup.groupId = :groupId")
    List<VcsCommit> findByRequirement_ProjectGroup_GroupId(@Param("groupId") UUID groupId);
}
