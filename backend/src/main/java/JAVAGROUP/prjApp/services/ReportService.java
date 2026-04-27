package javagroup.prjapp.services;

import javagroup.prjapp.dtos.ContributionDTO;
import javagroup.prjapp.dtos.GitStatsDTO;
import javagroup.prjapp.dtos.ProgressDTO;
import javagroup.prjapp.dtos.CommitDTO;
import javagroup.prjapp.entities.VcsCommit;
import javagroup.prjapp.entities.Task;
import javagroup.prjapp.entities.Student;
import javagroup.prjapp.entities.Requirement;
import javagroup.prjapp.repositories.VcsCommitRepository;
import javagroup.prjapp.repositories.TaskRepository;
import javagroup.prjapp.repositories.GroupMemberRepository;
import javagroup.prjapp.repositories.RequirementRepository;

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

@Service
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class ReportService {

    private final TaskRepository taskRepository;
    private final VcsCommitRepository vcsCommitRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final RequirementRepository requirementRepository;

    public ReportService(TaskRepository taskRepository,
                         VcsCommitRepository vcsCommitRepository,
                         GroupMemberRepository groupMemberRepository,
                         RequirementRepository requirementRepository) {
        this.taskRepository = taskRepository;
        this.vcsCommitRepository = vcsCommitRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.requirementRepository = requirementRepository;
    }

    public ProgressDTO getProjectProgress(UUID groupId) {
        List<Task> tasks = taskRepository.findAll().stream()
                .filter(task -> task.getRequirement() != null
                        && task.getRequirement().getProjectGroup() != null
                        && groupId.equals(task.getRequirement().getProjectGroup().getGroupId()))
                .collect(Collectors.toList());

        int total = tasks.size();
        long done = tasks.stream().filter(task -> "DONE".equalsIgnoreCase(task.getStatus())).count();
        double percent = total == 0 ? 0.0 : (double) done / total * 100;
        return new ProgressDTO(groupId, total, (int) done, percent);
    }

    public GitStatsDTO getGithubStats(UUID groupId) {
        List<VcsCommit> commits = vcsCommitRepository.findAll().stream()
                .filter(c -> c.getRequirement() != null
                        && c.getRequirement().getProjectGroup() != null
                        && groupId.equals(c.getRequirement().getProjectGroup().getGroupId()))
                .collect(Collectors.toList());

        Map<String, Integer> commitsByStudent = new HashMap<>();
        Map<String, Set<LocalDate>> commitDaysByStudent = new HashMap<>();
        Map<String, Double> totalQualityScore = new HashMap<>();

        for (VcsCommit c : commits) {
            if (c.getStudent() != null) {
                String name = c.getStudent().getFullName();
                commitsByStudent.merge(name, 1, Integer::sum);
                
                if (c.getCommitTime() != null) {
                    LocalDate date = c.getCommitTime().toLocalDate();
                    commitDaysByStudent.computeIfAbsent(name, k -> new HashSet<>())
                            .add(date);
                }

                double score = 0.0;
                if (c.getMessage() != null) {
                    if (c.getMessage().length() > 20) score += 0.4;
                    if (c.getMessage().matches(".*[A-Z]+-\\d+.*")) score += 0.6;
                }
                totalQualityScore.merge(name, score, Double::sum);
            }
        }

        Map<String, Double> frequencyIndex = new HashMap<>();
        Map<String, Double> qualityIndex = new HashMap<>();

        commitsByStudent.forEach((name, count) -> {
            Set<LocalDate> days = commitDaysByStudent.getOrDefault(name, new HashSet<>());
            int uniqueDays = days.size();
            frequencyIndex.put(name, Math.min(1.0, (double) uniqueDays / 7.0));

            Double totalScore = totalQualityScore.getOrDefault(name, 0.0);
            qualityIndex.put(name, Math.min(1.0, totalScore / count.doubleValue()));
        });

        return new GitStatsDTO(groupId, commits.size(), commitsByStudent, frequencyIndex, qualityIndex);
    }

    public List<Map<String, Object>> getProgressHistory(UUID groupId) {
        List<Task> tasks = taskRepository.findAll().stream()
                .filter(task -> task.getRequirement() != null
                        && task.getRequirement().getProjectGroup() != null
                        && groupId.equals(task.getRequirement().getProjectGroup().getGroupId())
                        && "DONE".equalsIgnoreCase(task.getStatus())
                        && task.getUpdatedAt() != null)
                .sorted(Comparator.comparing(Task::getUpdatedAt))
                .collect(Collectors.toList());

        Map<String, Integer> completionsByDay = new LinkedHashMap<>();
        int currentTotal = 0;
        
        for (Task task : tasks) {
            String date = task.getUpdatedAt().toLocalDate().toString();
            currentTotal++;
            completionsByDay.put(date, currentTotal); 
        }

        List<Map<String, Object>> data = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : completionsByDay.entrySet()) {
            Map<String, Object> point = new HashMap<>();
            point.put("date", entry.getKey());
            point.put("completed", entry.getValue());
            data.add(point);
        }
        return data;
    }

    public List<Map<String, Object>> getPersonalCommitHistory(UUID studentId) {
        List<VcsCommit> commits = vcsCommitRepository.findAll().stream()
                .filter(c -> c.getStudent() != null && studentId.equals(c.getStudent().getId()) && c.getCommitTime() != null)
                .sorted(Comparator.comparing(VcsCommit::getCommitTime))
                .collect(Collectors.toList());

        return toHistoryData(commits);
    }

    public List<Map<String, Object>> getGroupCommitHistory(UUID groupId) {
        List<VcsCommit> commits = vcsCommitRepository.findAll().stream()
                .filter(c -> c.getRequirement() != null
                        && c.getRequirement().getProjectGroup() != null
                        && groupId.equals(c.getRequirement().getProjectGroup().getGroupId())
                        && c.getCommitTime() != null)
                .sorted(Comparator.comparing(VcsCommit::getCommitTime))
                .collect(Collectors.toList());

        return toHistoryData(commits);
    }

    public List<CommitDTO> getGroupCommitDetails(UUID groupId) {
        return vcsCommitRepository.findAll().stream()
                .filter(c -> c.getRequirement() != null
                        && c.getRequirement().getProjectGroup() != null
                        && groupId.equals(c.getRequirement().getProjectGroup().getGroupId()))
                .sorted(Comparator.comparing(VcsCommit::getCommitTime).reversed())
                .map(c -> {
                    CommitDTO dto = new CommitDTO();
                    dto.setSha(c.getSha());
                    dto.setMessage(c.getMessage());
                    dto.setCommitTime(c.getCommitTime());
                    if (c.getStudent() != null) {
                        dto.setAuthorName(c.getStudent().getFullName());
                        dto.setAuthorEmail(c.getStudent().getEmail());
                    } else {
                        dto.setAuthorName("Unknown");
                    }
                    if (c.getRequirement() != null) {
                        dto.setRequirementId(c.getRequirement().getRequirementId().toString());
                        dto.setRequirementTitle(c.getRequirement().getTitle());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private List<Map<String, Object>> toHistoryData(List<VcsCommit> commits) {
        Map<String, Integer> countPerDay = new LinkedHashMap<>();
        for (VcsCommit c : commits) {
            String date = c.getCommitTime().toLocalDate().toString();
            countPerDay.merge(date, 1, (oldValue, newValue) -> oldValue + newValue);
        }

        List<Map<String, Object>> data = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : countPerDay.entrySet()) {
            Map<String, Object> point = new HashMap<>();
            point.put("date", entry.getKey());
            point.put("count", entry.getValue());
            data.add(point);
        }
        return data;
    }

    public List<ContributionDTO> getPersonalContributions(UUID groupId) {
        return groupMemberRepository.findById_GroupId(groupId).stream()
                .map(gm -> {
                    Student student = gm.getStudent();
                    List<Task> tasks = taskRepository.findByStudent_Id(student.getId());
                    long doneTasks = tasks.stream()
                            .filter(task -> "DONE".equalsIgnoreCase(task.getStatus())).count();
                    long commitCount = vcsCommitRepository.findAll().stream()
                            .filter(c -> c.getStudent() != null && student.getId().equals(c.getStudent().getId()))
                            .count();
                    return new ContributionDTO(student.getId(), student.getFullName(), (int) doneTasks, (int) commitCount);
                })
                .collect(Collectors.toList());
    }

    public Resource exportSummaryReport(UUID groupId) {
        ProgressDTO progress = getProjectProgress(groupId);
        List<ContributionDTO> contributions = getPersonalContributions(groupId);

        StringBuilder sb = new StringBuilder();
        sb.append("BAO CAO NHOM: ").append(groupId).append("\n\n");
        sb.append("TIEN DO:\nTong NV,NV Hoan Thanh,% Tien Do\n");
        sb.append(progress.getTotalTasks()).append(",")
                .append(progress.getCompletedTasks()).append(",")
                .append(String.format("%.1f", progress.getProgressPercentage())).append("%\n\n");

        sb.append("DONG GOP THANH VIEN:\nTen,Nhiem Vu Hoan Thanh,So Commit\n");
        for (ContributionDTO contribution : contributions) {
            sb.append(contribution.getStudentName()).append(",")
                    .append(contribution.getCompletedTaskCount()).append(",")
                    .append(contribution.getCommitCount()).append("\n");
        }
        return new ByteArrayResource(sb.toString().getBytes(StandardCharsets.UTF_8));
    }

    public Resource exportDocxReport(UUID groupId) throws IOException {
        ProgressDTO progress = getProjectProgress(groupId);
        List<ContributionDTO> contributions = getPersonalContributions(groupId);

        try (XWPFDocument doc = new XWPFDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            XWPFParagraph title = doc.createParagraph();
            title.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun titleRun = title.createRun();
            titleRun.setText("BAO CAO TONG HOP NHOM");
            titleRun.setBold(true);
            titleRun.setFontSize(20);

            XWPFParagraph p1 = doc.createParagraph();
            p1.createRun().setText("Tiên độ tổng quát: " + String.format("%.1f", progress.getProgressPercentage()) + "%");

            XWPFTable table = doc.createTable();
            XWPFTableRow header = table.getRow(0);
            header.getCell(0).setText("Tên thành viên");
            header.addNewTableCell().setText("Nhiệm vụ xong");
            header.addNewTableCell().setText("Số Commits");

            for (ContributionDTO contribution : contributions) {
                XWPFTableRow row = table.createRow();
                row.getCell(0).setText(contribution.getStudentName());
                row.getCell(1).setText(String.valueOf(contribution.getCompletedTaskCount()));
                row.getCell(2).setText(String.valueOf(contribution.getCommitCount()));
            }

            doc.write(out);
            return new ByteArrayResource(out.toByteArray());
        }
    }

    public Resource exportPdfReport(UUID groupId) {
        ProgressDTO progress = getProjectProgress(groupId);
        List<ContributionDTO> contributions = getPersonalContributions(groupId);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("BAO CAO TONG HOP NHOM", fontTitle);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Tien do du an: " + String.format("%.1f", progress.getProgressPercentage()) + "%"));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(3);
            table.addCell("Ten Sinh Vien");
            table.addCell("Nhiem Vu Xong");
            table.addCell("So Commits");

            for (ContributionDTO contribution : contributions) {
                table.addCell(contribution.getStudentName());
                table.addCell(String.valueOf(contribution.getCompletedTaskCount()));
                table.addCell(String.valueOf(contribution.getCommitCount()));
            }
            document.add(table);
            document.close();
            return new ByteArrayResource(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tạo PDF", e);
        }
    }

    public Resource exportSrsReport(UUID groupId) throws IOException {
        List<Requirement> requirements = requirementRepository.findByProjectGroup_GroupId(groupId);

        try (XWPFDocument doc = new XWPFDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            XWPFParagraph title = doc.createParagraph();
            title.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun titleRun = title.createRun();
            titleRun.setText("SOFTWARE REQUIREMENTS SPECIFICATION (SRS)");
            titleRun.setBold(true);
            titleRun.setFontSize(22);
            titleRun.addBreak();
            
            XWPFParagraph info = doc.createParagraph();
            info.createRun().setText("Mã nhóm: " + groupId);
            info.createRun().addBreak();
            info.createRun().setText("Ngày xuất: " + LocalDate.now());
            
            XWPFParagraph section1 = doc.createParagraph();
            XWPFRun r1 = section1.createRun();
            r1.setText("1. GIỚI THIỆU");
            r1.setBold(true);
            r1.setFontSize(14);
            
            XWPFParagraph p1 = doc.createParagraph();
            p1.createRun().setText("Tài liệu này đặc tả các yêu cầu chức năng cho dự án môn học Java, được đồng bộ trực tiếp từ hệ thống quản lý Jira.");

            XWPFParagraph section2 = doc.createParagraph();
            XWPFRun r2 = section2.createRun();
            r2.setText("2. YÊU CẦU CHỨC NĂNG");
            r2.setBold(true);
            r2.setFontSize(14);

            for (int i = 0; i < requirements.size(); i++) {
                Requirement req = requirements.get(i);
                XWPFParagraph p = doc.createParagraph();
                XWPFRun run = p.createRun();
                run.setText((i + 1) + ". " + req.getTitle());
                run.setBold(true);
                
                XWPFParagraph desc = doc.createParagraph();
                desc.setIndentationLeft(720); 
                desc.createRun().setText("Mô tả: " + (req.getDescription() != null ? req.getDescription() : "Không có mô tả."));
                
                XWPFParagraph status = doc.createParagraph();
                status.setIndentationLeft(720);
                status.createRun().setText("Trạng thái hiện tại: " + req.getStatus());
            }

            doc.write(out);
            return new ByteArrayResource(out.toByteArray());
        }
    }
}
