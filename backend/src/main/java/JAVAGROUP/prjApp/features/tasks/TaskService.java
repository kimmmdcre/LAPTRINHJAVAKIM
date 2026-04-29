package javagroup.prjApp.features.tasks;

import javagroup.prjApp.features.groups.GroupRole;

import javagroup.prjApp.features.tasks.TaskDTO;
import javagroup.prjApp.features.tasks.RequirementDTO;
import javagroup.prjApp.features.tasks.CommitDTO;
import javagroup.prjApp.features.tasks.Task;
import javagroup.prjApp.features.users.Student;
import javagroup.prjApp.features.tasks.TaskRepository;
import javagroup.prjApp.features.users.StudentRepository;
import javagroup.prjApp.features.tasks.RequirementRepository;
import javagroup.prjApp.features.groups.GroupMemberRepository;
import javagroup.prjApp.features.tasks.VcsCommitRepository;
import javagroup.prjApp.features.groups.GroupMember;
import javagroup.prjApp.features.groups.GroupMemberId;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final RequirementRepository requirementRepository;
    private final TaskRepository taskRepository;
    private final StudentRepository studentRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final VcsCommitRepository vcsCommitRepository;

    public TaskService(RequirementRepository requirementRepository, 
                       TaskRepository taskRepository,
                       StudentRepository studentRepository,
                       GroupMemberRepository groupMemberRepository,
                       VcsCommitRepository vcsCommitRepository) {
        this.requirementRepository = requirementRepository;
        this.taskRepository = taskRepository;
        this.studentRepository = studentRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.vcsCommitRepository = vcsCommitRepository;
    }

    public List<RequirementDTO> getRequirementsByGroup(UUID groupId) {
        return requirementRepository.findByProjectGroup_GroupId(groupId)
                .stream()
                .map(req -> new RequirementDTO(
                        req.getRequirementId(),
                        req.getJiraKey(),
                        req.getTitle(),
                        req.getDescription(),
                        req.getStatus(),
                        req.getProjectGroup().getGroupId()
                ))
                .collect(Collectors.toList());
    }

    public List<TaskDTO> getTasksByGroup(UUID groupId) {
        return taskRepository.findAll().stream()
                .filter(task -> task.getRequirement() != null && task.getRequirement().getProjectGroup().getGroupId().equals(groupId))
                .map(this::toTaskDTO)
                .collect(Collectors.toList());
    }

    public void assignTask(UUID taskId, UUID studentId, UUID requesterId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task does not exist: " + taskId));
        
        UUID groupId = task.getRequirement().getProjectGroup().getGroupId();
        
        // Check if requester is LEADER of this group
        GroupMemberId memberId = new GroupMemberId(groupId, requesterId);
        GroupMember member = groupMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("You are not a member of this group"));
        
        if (member.getRole() != GroupRole.LEADER) {
            throw new RuntimeException("Only the group leader can assign tasks");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Assigned student does not exist: " + studentId));
        
        task.setStudent(student);
        taskRepository.save(task);
    }

    public List<TaskDTO> getPersonalTasks(UUID studentId) {
        return taskRepository.findByStudent_Id(studentId)
                .stream()
                .map(this::toTaskDTO)
                .collect(Collectors.toList());
    }

    public void updateTaskStatus(UUID taskId, String status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task does not exist: " + taskId));
        task.setStatus(status);
        task.setUpdatedAt(java.time.LocalDateTime.now());
        taskRepository.save(task);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<CommitDTO> getGroupCommits(UUID groupId) {
        return vcsCommitRepository.findByRequirement_ProjectGroup_GroupId(groupId)
                .stream()
                .map(c -> {
                    CommitDTO dto = new CommitDTO();
                    dto.setSha(c.getSha());
                    dto.setMessage(c.getMessage());
                    dto.setCommitTime(c.getCommitTime());
                    if (c.getRequirement() != null) {
                        dto.setRequirementId(c.getRequirement().getRequirementId().toString());
                        dto.setRequirementTitle(c.getRequirement().getTitle());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private TaskDTO toTaskDTO(Task task) {
        Student student = task.getStudent();
        String jiraKey = task.getRequirement() != null ? task.getRequirement().getJiraKey() : null;
        String studentFullName = student != null ? student.getFullName() : null;
        
        long commitCount = vcsCommitRepository.findAll().stream()
                .filter(c -> c.getRequirement() != null && task.getRequirement() != null 
                        && c.getRequirement().getRequirementId().equals(task.getRequirement().getRequirementId())
                        && student != null && c.getStudent() != null && student.getId().equals(c.getStudent().getId()))
                .count();

        return new TaskDTO(
                task.getTaskId(),
                task.getTaskName(),
                jiraKey,
                task.getDescription(),
                task.getStatus(),
                task.getDeadline(),
                task.getProgressPercentage(),
                task.getRequirement() != null ? task.getRequirement().getRequirementId() : null,
                student != null ? student.getId() : null,
                studentFullName,
                (int) commitCount
        );
    }
}
