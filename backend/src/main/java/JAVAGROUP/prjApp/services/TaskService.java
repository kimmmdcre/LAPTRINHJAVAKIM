package javagroup.prjApp.services;

import javagroup.prjApp.dtos.TaskDTO;
import javagroup.prjApp.dtos.RequirementDTO;
import javagroup.prjApp.dtos.CommitDTO;
import java.util.List;
import java.util.UUID;

public interface TaskService {
    List<TaskDTO> getTasksByGroup(UUID groupId);
    List<RequirementDTO> getRequirementsByGroup(UUID groupId);
    List<TaskDTO> getPersonalTasks(UUID studentId);
    void updateTaskStatus(UUID id, String status);
    void assignTask(UUID taskId, UUID studentId, UUID principalId);
    List<CommitDTO> getGroupCommits(UUID groupId);
}
