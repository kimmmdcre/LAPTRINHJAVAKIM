package javagroup.prjApp.services;

import javagroup.prjApp.dtos.ContributionDTO;
import javagroup.prjApp.dtos.GitStatsDTO;
import javagroup.prjApp.dtos.ProgressDTO;
import javagroup.prjApp.dtos.CommitDTO;
import org.springframework.core.io.Resource;

import java.util.List;
import java.util.UUID;
import java.util.Map;
import java.io.IOException;

public interface ReportService {
    ProgressDTO getProjectProgress(UUID groupId);
    GitStatsDTO getGithubStats(UUID groupId);
    List<ContributionDTO> getPersonalContributions(UUID groupId);
    List<Map<String, Object>> getProgressHistory(UUID groupId);
    List<Map<String, Object>> getGroupCommitHistory(UUID groupId);
    List<CommitDTO> getGroupCommitDetails(UUID groupId);
    List<Map<String, Object>> getPersonalCommitHistory(UUID studentId);
    
    Resource exportSummaryReport(UUID groupId);
    Resource exportDocxReport(UUID groupId) throws IOException;
    Resource exportPdfReport(UUID groupId);
    Resource exportSrsReport(UUID groupId) throws IOException;
}
