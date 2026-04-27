package javagroup.prjapp.repositories;

import javagroup.prjapp.entities.GroupMember;
import javagroup.prjapp.entities.GroupMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId> {
    List<GroupMember> findById_GroupId(UUID groupId);
    void deleteById_StudentId(UUID studentId);
}
