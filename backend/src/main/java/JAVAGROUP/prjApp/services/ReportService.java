package javagroup.prjApp.services;

import javagroup.prjApp.services.ReportService;
import javagroup.prjApp.dtos.ContributionDTO;
import javagroup.prjApp.dtos.GitStatsDTO;
import javagroup.prjApp.dtos.ProgressDTO;
import javagroup.prjApp.dtos.CommitDTO;
import javagroup.prjApp.entities.VcsCommit;
import javagroup.prjApp.entities.Task;
import javagroup.prjApp.entities.Student;
import javagroup.prjApp.entities.Requirement;
import javagroup.prjApp.repositories.VcsCommitRepository;
import javagroup.prjApp.repositories.TaskRepository;
import javagroup.prjApp.repositories.GroupMemberRepository;
import javagroup.prjApp.repositories.RequirementRepository;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.apache.poi.xwpf.usermodel.*;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.PdfPTable;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

public interface ReportService {
    public ProgressDTO getProjectProgress(UUID groupId);
    public GitStatsDTO getGithubStats(UUID groupId);
    public List<Map<String, Object>> getProgressHistory(UUID groupId);
    public List<Map<String, Object>> getPersonalCommitHistory(UUID studentId);
    public List<Map<String, Object>> getGroupCommitHistory(UUID groupId);
    public List<CommitDTO> getGroupCommitDetails(UUID groupId);
    public List<ContributionDTO> getPersonalContributions(UUID groupId);
    public Resource exportSummaryReport(UUID groupId);
    public Resource exportDocxReport(UUID groupId) throws IOException;
    public Resource exportPdfReport(UUID groupId);
    public Resource exportSrsReport(UUID groupId) throws IOException;
}
