package javagroup.prjApp.services;

import javagroup.prjApp.services.TaskService;
import javagroup.prjApp.utils.enums.GroupRole;
import javagroup.prjApp.dtos.TaskDTO;
import javagroup.prjApp.dtos.RequirementDTO;
import javagroup.prjApp.dtos.CommitDTO;
import javagroup.prjApp.entities.Task;
import javagroup.prjApp.entities.Student;
import javagroup.prjApp.repositories.TaskRepository;
import javagroup.prjApp.repositories.StudentRepository;
import javagroup.prjApp.repositories.RequirementRepository;
import javagroup.prjApp.repositories.GroupMemberRepository;
import javagroup.prjApp.repositories.VcsCommitRepository;
import javagroup.prjApp.entities.GroupMember;
import javagroup.prjApp.entities.GroupMemberId;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public interface TaskService {
    public List<RequirementDTO> getRequirementsByGroup(UUID groupId);
    public List<TaskDTO> getTasksByGroup(UUID groupId);
    public void assignTask(UUID taskId, UUID studentId, UUID requesterId);
    public List<TaskDTO> getPersonalTasks(UUID studentId);
    public void updateTaskStatus(UUID taskId, String status);
    public List<CommitDTO> getGroupCommits(UUID groupId);
}
