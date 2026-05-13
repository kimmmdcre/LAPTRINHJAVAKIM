package javagroup.prjApp.services;

import javagroup.prjApp.dtos.GroupDTO;
import javagroup.prjApp.dtos.GroupMemberDTO;
import javagroup.prjApp.entities.Group;

import java.util.List;
import java.util.UUID;

public interface GroupService {
    public Group createGroup(GroupDTO dto);
    public void deleteGroup(UUID groupId);
    public void assignTeacher(UUID groupId, UUID teacherId);
    public List<GroupDTO> getAllGroups(UUID teacherId);
    public GroupDTO getGroupInfo(UUID groupId);
    public List<GroupMemberDTO> getGroupMembers(UUID groupId);
    public void addMember(UUID groupId, UUID studentId);
    public void removeMember(UUID groupId, UUID studentId);
    public void setLeader(UUID groupId, UUID studentId);
}
