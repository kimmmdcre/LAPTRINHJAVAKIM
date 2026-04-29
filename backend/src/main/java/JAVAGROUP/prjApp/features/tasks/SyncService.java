package javagroup.prjApp.features.tasks;

import javagroup.prjApp.features.tasks.adapters.IGitHubClient;
import javagroup.prjApp.features.tasks.adapters.IJiraClient;
import javagroup.prjApp.features.tasks.CommitDTO;
import javagroup.prjApp.features.tasks.RequirementDTO;
import javagroup.prjApp.features.users.Admin;
import javagroup.prjApp.features.auth.BlacklistedToken;
import javagroup.prjApp.features.groups.Group;
import javagroup.prjApp.features.groups.GroupMember;
import javagroup.prjApp.features.groups.GroupMemberId;
import javagroup.prjApp.features.tasks.IntegrationConfig;
import javagroup.prjApp.features.tasks.Requirement;
import javagroup.prjApp.features.users.Student;
import javagroup.prjApp.features.tasks.Task;
import javagroup.prjApp.features.users.Teacher;
import javagroup.prjApp.features.users.User;
import javagroup.prjApp.features.tasks.VcsCommit;
import javagroup.prjApp.features.users.AdminRepository;
import javagroup.prjApp.features.auth.BlacklistedTokenRepository;
import javagroup.prjApp.features.groups.GroupMemberRepository;
import javagroup.prjApp.features.groups.GroupRepository;
import javagroup.prjApp.features.tasks.IntegrationConfigRepository;
import javagroup.prjApp.features.tasks.RequirementRepository;
import javagroup.prjApp.features.users.StudentRepository;
import javagroup.prjApp.features.tasks.TaskRepository;
import javagroup.prjApp.features.users.TeacherRepository;
import javagroup.prjApp.features.users.UserRepository;
import javagroup.prjApp.features.tasks.VcsCommitRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SyncService {

    private static final Logger log = LoggerFactory.getLogger(SyncService.class);

    private final IJiraClient jiraClient;
    private final IGitHubClient gitHubClient;
    private final IntegrationConfigRepository integrationConfigRepository;
    private final GroupRepository groupRepository;
    private final RequirementRepository requirementRepository;
    private final VcsCommitRepository vcsCommitRepository;
    private final StudentRepository studentRepository;

    public SyncService(IJiraClient jiraClient, IGitHubClient gitHubClient,
                       IntegrationConfigRepository integrationConfigRepository,
                       GroupRepository groupRepository, RequirementRepository requirementRepository,
                       VcsCommitRepository vcsCommitRepository,
                       StudentRepository studentRepository) {
        this.jiraClient = jiraClient;
        this.gitHubClient = gitHubClient;
        this.integrationConfigRepository = integrationConfigRepository;
        this.groupRepository = groupRepository;
        this.requirementRepository = requirementRepository;
        this.vcsCommitRepository = vcsCommitRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional
    public void syncJira(UUID groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group does not exist: " + groupId));
        List<IntegrationConfig> configs = integrationConfigRepository.findByGroupId(groupId);
        IntegrationConfig jiraConf = configs.stream()
                .filter(c -> "JIRA".equals(c.getPlatformType())).findFirst()
                .orElseThrow(() -> new RuntimeException("Jira integration not configured for group: " + groupId));

        List<RequirementDTO> issues = jiraClient.getRequirements(
                jiraConf.getUrl(), 
                jiraConf.getEmail(), 
                jiraConf.getApiToken(), 
                jiraConf.getProjectKey()
        );

        for (RequirementDTO dto : issues) {
            requirementRepository.findByJiraKeyAndProjectGroup(dto.getJiraKey(), group)
                .ifPresentOrElse(
                    existing -> {
                        existing.setTitle(dto.getTitle());
                        existing.setDescription(dto.getDescription());
                        existing.setStatus(dto.getStatus());
                        requirementRepository.save(existing);
                    },
                    () -> {
                        Requirement req = new Requirement();
                        req.setJiraKey(dto.getJiraKey());
                        req.setProjectGroup(group);
                        req.setTitle(dto.getTitle());
                        req.setDescription(dto.getDescription());
                        req.setStatus(dto.getStatus());
                        requirementRepository.save(req);
                    }
                );
        }
    }

    @Transactional
    public void syncGithub(UUID groupId) {
        List<IntegrationConfig> configs = integrationConfigRepository.findByGroupId(groupId);
        IntegrationConfig ghConf = configs.stream()
                .filter(c -> "GITHUB".equals(c.getPlatformType())).findFirst()
                .orElseThrow(() -> new RuntimeException("GitHub integration not configured for group: " + groupId));

        try {
            List<CommitDTO> commits = gitHubClient.getCommits(ghConf.getRepoUrl(), ghConf.getApiToken(), null);
            for (CommitDTO dto : commits) {
                if (!vcsCommitRepository.existsById(dto.getSha())) {
                    VcsCommit commit = new VcsCommit();
                    commit.setSha(dto.getSha());
                    commit.setMessage(dto.getMessage());
                    commit.setCommitTime(dto.getCommitTime());
                    
                    if (dto.getAuthorEmail() != null) {
                        studentRepository.findByEmail(dto.getAuthorEmail())
                                .ifPresent(commit::setStudent);
                    }
                    
                    vcsCommitRepository.save(commit);
                }
            }
        } catch (Exception e) {
            log.error("Error syncing GitHub for group {}: {}", groupId, e.getMessage());
            throw e;
        }
    }

    @Transactional
    public void mapTasksToCommits() {
        List<VcsCommit> commits = vcsCommitRepository.findByRequirementIsNull();
        Pattern taskPattern = Pattern.compile("([A-Z]+-\\d+)");
        Pattern donePattern = Pattern.compile("(?i)(done|base|fix|fixed|close|closed)\\s+([A-Z]+-\\d+)");

        for (VcsCommit commit : commits) {
            if (commit.getMessage() == null) continue;

            Matcher matcher = taskPattern.matcher(commit.getMessage());
            if (matcher.find()) {
                String jiraKey = matcher.group(1);
                requirementRepository.findByJiraKey(jiraKey).ifPresent(req -> {
                    commit.setRequirement(req);
                    vcsCommitRepository.save(commit);
                    
                    Matcher doneMatcher = donePattern.matcher(commit.getMessage());
                    if (doneMatcher.find()) {
                        req.setStatus("DONE");
                        requirementRepository.save(req);
                        log.info("Automatically updated status of Requirement {} to DONE", jiraKey);
                    }
                    
                    log.info("Linked commit {} with requirement {}", commit.getSha(), jiraKey);
                });
            }
        }
    }
}
