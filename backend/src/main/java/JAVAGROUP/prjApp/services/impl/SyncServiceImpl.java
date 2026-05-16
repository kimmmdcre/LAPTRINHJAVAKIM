package javagroup.prjApp.services.impl;
 
import lombok.RequiredArgsConstructor;

import javagroup.prjApp.services.SyncService;
import javagroup.prjApp.adapters.IGitHubClient;
import javagroup.prjApp.adapters.IJiraClient;
import javagroup.prjApp.dtos.CommitDTO;
import javagroup.prjApp.dtos.RequirementDTO;
import javagroup.prjApp.entities.Group;
import javagroup.prjApp.entities.IntegrationConfig;
import javagroup.prjApp.entities.Requirement;
import javagroup.prjApp.entities.VcsCommit;
import javagroup.prjApp.repositories.GroupRepository;
import javagroup.prjApp.repositories.IntegrationConfigRepository;
import javagroup.prjApp.repositories.RequirementRepository;
import javagroup.prjApp.repositories.StudentRepository;
import javagroup.prjApp.repositories.VcsCommitRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class SyncServiceImpl implements SyncService {

    private static final Logger log = LoggerFactory.getLogger(SyncServiceImpl.class);

    private final IJiraClient jiraClient;
    private final IGitHubClient gitHubClient;
    private final IntegrationConfigRepository integrationConfigRepository;
    private final GroupRepository groupRepository;
    private final RequirementRepository requirementRepository;
    private final VcsCommitRepository vcsCommitRepository;
    private final StudentRepository studentRepository;



    @Override
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
                jiraConf.getProjectKey());

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
                            });
        }
    }

    @Override
    @Transactional
    public void syncGithub(UUID groupId) {
        List<IntegrationConfig> configs = integrationConfigRepository.findByGroupId(groupId);
        IntegrationConfig ghConf = configs.stream()
                .filter(c -> "GITHUB".equals(c.getPlatformType())).findFirst()
                .orElseThrow(() -> new RuntimeException("GitHub integration not configured for group: " + groupId));

        try {
            List<CommitDTO> commits = gitHubClient.getCommits(ghConf.getRepoUrl(), ghConf.getApiToken(), null);
            for (CommitDTO dto : commits) {
                vcsCommitRepository.findById(dto.getSha()).ifPresentOrElse(
                        existing -> {
                            existing.setAuthorEmail(dto.getAuthorEmail());
                            existing.setAuthorName(dto.getAuthorName());

                            if (existing.getStudent() == null) {
                                if (dto.getAuthorEmail() != null) {
                                    studentRepository.findByEmail(dto.getAuthorEmail()).ifPresent(existing::setStudent);
                                }
                                if (existing.getStudent() == null && dto.getAuthorName() != null) {
                                    studentRepository.findByFullNameIgnoreCase(dto.getAuthorName()).ifPresent(existing::setStudent);
                                }
                            }
                            vcsCommitRepository.save(existing);
                        },
                        () -> {
                            VcsCommit commit = new VcsCommit();
                            commit.setSha(dto.getSha());
                            commit.setMessage(dto.getMessage());
                            commit.setCommitTime(dto.getCommitTime());
                            commit.setAuthorEmail(dto.getAuthorEmail());
                            commit.setAuthorName(dto.getAuthorName());

                            if (dto.getAuthorEmail() != null) {
                                studentRepository.findByEmail(dto.getAuthorEmail()).ifPresent(commit::setStudent);
                            }
                            if (commit.getStudent() == null && dto.getAuthorName() != null) {
                                studentRepository.findByFullNameIgnoreCase(dto.getAuthorName()).ifPresent(commit::setStudent);
                            }
                            vcsCommitRepository.save(commit);
                        });
            }
        } catch (Exception e) {
            log.error("Error syncing GitHub for group {}: {}", groupId, e.getMessage());
            throw e;
        }
    }

    @Override
    @Transactional
    public int mapTasksToCommits(UUID groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group does not exist: " + groupId));

        // Kiểm tra xem đã có dữ liệu Jira chưa
        List<Requirement> groupTasks = requirementRepository.findByProjectGroup(group);
        if (groupTasks.isEmpty()) {
            throw new RuntimeException("No Jira data found. Please click 'Sync Jira' first.");
        }

        // Tìm các commit chưa được khớp
        List<VcsCommit> unmappedCommits = vcsCommitRepository.findByRequirementIsNull();
        if (unmappedCommits.isEmpty()) {
            throw new RuntimeException("No new GitHub data (Commits) found to map. Please click 'Sync GitHub' first.");
        }

        Pattern taskPattern = Pattern.compile("([A-Z]+-\\d+)");
        Pattern donePattern = Pattern.compile("(?i)(done|base|fix|fixed|close|closed)\\s+([A-Z]+-\\d+)");
        int count = 0;

        for (VcsCommit commit : unmappedCommits) {
            if (commit.getMessage() == null) continue;

            Matcher matcher = taskPattern.matcher(commit.getMessage());
            if (matcher.find()) {
                String jiraKey = matcher.group(1);
                // Chỉ khớp nếu Task thuộc về nhóm này
                for (Requirement req : groupTasks) {
                    if (req.getJiraKey().equalsIgnoreCase(jiraKey)) {
                        commit.setRequirement(req);
                        vcsCommitRepository.save(commit);
                        count++;

                        Matcher doneMatcher = donePattern.matcher(commit.getMessage());
                        if (doneMatcher.find()) {
                            req.setStatus("DONE");
                            requirementRepository.save(req);
                        }
                        break;
                    }
                }
            }
        }
        return count;
    }

    @Override
    @Transactional
    public void syncFull(UUID groupId) {
        syncJira(groupId);
        syncGithub(groupId);
        mapTasksToCommits(groupId);
    }
}
