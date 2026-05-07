package javagroup.prjApp.services;

import javagroup.prjApp.services.SyncService;
import javagroup.prjApp.utils.adapters.IGitHubClient;
import javagroup.prjApp.utils.adapters.IJiraClient;
import javagroup.prjApp.dtos.CommitDTO;
import javagroup.prjApp.dtos.RequirementDTO;
import javagroup.prjApp.entities.Admin;
import javagroup.prjApp.entities.BlacklistedToken;
import javagroup.prjApp.entities.Group;
import javagroup.prjApp.entities.GroupMember;
import javagroup.prjApp.entities.GroupMemberId;
import javagroup.prjApp.entities.IntegrationConfig;
import javagroup.prjApp.entities.Requirement;
import javagroup.prjApp.entities.Student;
import javagroup.prjApp.entities.Task;
import javagroup.prjApp.entities.Teacher;
import javagroup.prjApp.entities.User;
import javagroup.prjApp.entities.VcsCommit;
import javagroup.prjApp.repositories.AdminRepository;
import javagroup.prjApp.repositories.BlacklistedTokenRepository;
import javagroup.prjApp.repositories.GroupMemberRepository;
import javagroup.prjApp.repositories.GroupRepository;
import javagroup.prjApp.repositories.IntegrationConfigRepository;
import javagroup.prjApp.repositories.RequirementRepository;
import javagroup.prjApp.repositories.StudentRepository;
import javagroup.prjApp.repositories.TaskRepository;
import javagroup.prjApp.repositories.TeacherRepository;
import javagroup.prjApp.repositories.UserRepository;
import javagroup.prjApp.repositories.VcsCommitRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public interface SyncService {
    public void syncJira(UUID groupId);
    public void syncGithub(UUID groupId);
    public void mapTasksToCommits();
}
