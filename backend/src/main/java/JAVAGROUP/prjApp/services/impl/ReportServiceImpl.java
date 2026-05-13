package javagroup.prjApp.services.impl;

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

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.PdfPTable;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final TaskRepository taskRepository;
    private final VcsCommitRepository vcsCommitRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final RequirementRepository requirementRepository;

    public ReportServiceImpl(TaskRepository taskRepository,
            VcsCommitRepository vcsCommitRepository,
            GroupMemberRepository groupMemberRepository,
            RequirementRepository requirementRepository) {
        this.taskRepository = taskRepository;
        this.vcsCommitRepository = vcsCommitRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.requirementRepository = requirementRepository;
    }

    @Override
    public ProgressDTO getProjectProgress(UUID groupId) {
        List<Requirement> requirements = requirementRepository.findByProjectGroup_GroupId(groupId);

        int total = requirements.size();
        long done = requirements.stream().filter(req -> "DONE".equalsIgnoreCase(req.getStatus())).count();
        double percent = total == 0 ? 0.0 : (double) done / total * 100;
        return new ProgressDTO(groupId, total, (int) done, percent);
    }

    @Override
    public GitStatsDTO getGithubStats(UUID groupId) {
        List<VcsCommit> commits = vcsCommitRepository.findByRequirement_ProjectGroup_GroupId(groupId);

        Map<String, Integer> commitsByStudent = new HashMap<>();
        Map<String, Set<LocalDate>> commitDaysByStudent = new HashMap<>();
        Map<String, Double> totalQualityScore = new HashMap<>();

        for (VcsCommit c : commits) {
            String name = null;
            if (c.getStudent() != null) {
                name = c.getStudent().getFullName();
            } else if (c.getAuthorName() != null) {
                name = c.getAuthorName() + " (GitHub)";
            }

            if (name != null) {
                commitsByStudent.merge(name, 1, (oldVal, newVal) -> oldVal + newVal);

                if (c.getCommitTime() != null) {
                    LocalDate date = c.getCommitTime().toLocalDate();
                    commitDaysByStudent.computeIfAbsent(name, k -> new HashSet<>())
                            .add(date);
                }

                double score = 0.0;
                if (c.getMessage() != null) {
                    if (c.getMessage().length() > 20)
                        score += 0.4;
                    if (c.getMessage().matches(".*[A-Z]+-\\d+.*"))
                        score += 0.6;
                }
                totalQualityScore.merge(name, Double.valueOf(score),
                        (v1, v2) -> Double.valueOf(v1.doubleValue() + v2.doubleValue()));
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

    @Override
    public List<Map<String, Object>> getProgressHistory(UUID groupId) {
        List<Requirement> reqs = requirementRepository.findByProjectGroup_GroupId(groupId).stream()
                .filter(req -> "DONE".equalsIgnoreCase(req.getStatus()))
                .sorted((a, b) -> {
                    java.time.LocalDateTime t1 = a.getUpdatedAt() != null ? a.getUpdatedAt()
                            : (a.getCreatedAt() != null ? a.getCreatedAt() : java.time.LocalDateTime.now());
                    java.time.LocalDateTime t2 = b.getUpdatedAt() != null ? b.getUpdatedAt()
                            : (b.getCreatedAt() != null ? b.getCreatedAt() : java.time.LocalDateTime.now());
                    return t1.compareTo(t2);
                })
                .collect(Collectors.toList());

        Map<String, Integer> completionsByDay = new LinkedHashMap<>();
        int currentTotal = 0;

        for (Requirement req : reqs) {
            java.time.LocalDateTime ts = req.getUpdatedAt() != null ? req.getUpdatedAt()
                    : (req.getCreatedAt() != null ? req.getCreatedAt() : java.time.LocalDateTime.now());
            String date = ts.toLocalDate().toString();
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

    @Override
    public List<Map<String, Object>> getPersonalCommitHistory(UUID studentId) {
        List<VcsCommit> commits = vcsCommitRepository.findAll().stream()
                .filter(c -> c.getStudent() != null && studentId.equals(c.getStudent().getId())
                        && c.getCommitTime() != null)
                .sorted(Comparator.comparing(VcsCommit::getCommitTime))
                .collect(Collectors.toList());

        return toHistoryData(commits);
    }

    @Override
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

    @Override
    public List<CommitDTO> getGroupCommitDetails(UUID groupId) {
        return vcsCommitRepository.findByRequirement_ProjectGroup_GroupId(groupId).stream()
                .sorted(Comparator.comparing(VcsCommit::getCommitTime).reversed())
                .map(c -> {
                    CommitDTO dto = new CommitDTO();
                    dto.setSha(c.getSha());
                    dto.setMessage(c.getMessage());
                    dto.setCommitTime(c.getCommitTime());
                    if (c.getStudent() != null) {
                        dto.setAuthorName(c.getStudent().getFullName());
                        dto.setAuthorEmail(c.getStudent().getEmail());
                        dto.setExternalAuthor(false);
                    } else if (c.getAuthorName() != null) {
                        dto.setAuthorName(c.getAuthorName());
                        dto.setAuthorEmail(c.getAuthorEmail());
                        dto.setExternalAuthor(true);
                    } else {
                        dto.setAuthorName("Unknown");
                        dto.setExternalAuthor(true);
                    }

                    if (c.getRequirement() != null) {
                        dto.setRequirementId(c.getRequirement().getRequirementId().toString());
                        dto.setRequirementTitle(c.getRequirement().getTitle());
                        dto.setUnlinkedTask(false);
                    } else {
                        dto.setUnlinkedTask(true);
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

    @Override
    public List<ContributionDTO> getPersonalContributions(UUID groupId) {
        // Lấy tất cả commit của nhóm này một lần để tối ưu hiệu năng
        List<VcsCommit> groupCommits = vcsCommitRepository.findByRequirement_ProjectGroup_GroupId(groupId);

        return groupMemberRepository.findById_GroupId(groupId).stream()
                .map(gm -> {
                    Student student = gm.getStudent();

                    // 1. Đếm các Task thủ công được giao và đã DONE
                    List<Task> manualTasks = taskRepository.findByStudent_Id(student.getId());
                    long doneManualTasks = manualTasks.stream()
                            .filter(task -> "DONE".equalsIgnoreCase(task.getStatus())).count();

                    // 2. Đếm các Requirement (từ Jira) mà sinh viên này có đóng góp commit và đã
                    // DONE
                    long doneJiraRequirements = groupCommits.stream()
                            .filter(c -> c.getStudent() != null && student.getId().equals(c.getStudent().getId()))
                            .filter(c -> c.getRequirement() != null
                                    && "DONE".equalsIgnoreCase(c.getRequirement().getStatus()))
                            .map(c -> c.getRequirement().getRequirementId())
                            .distinct() // Mỗi requirement chỉ tính 1 lần
                            .count();

                    long commitCount = groupCommits.stream()
                            .filter(c -> c.getStudent() != null && student.getId().equals(c.getStudent().getId()))
                            .count();

                    int totalCompleted = (int) (doneManualTasks + doneJiraRequirements);

                    ContributionDTO dto = new ContributionDTO();
                    dto.setStudentId(student.getId());
                    dto.setStudentName(student.getFullName());
                    dto.setStudentCode(student.getStudentCode());
                    dto.setCompletedTaskCount(totalCompleted);
                    dto.setCommitCount((int) commitCount);
                    dto.setStatus(student.getStatus() != null ? student.getStatus().toString() : "ACTIVE");
                    return dto;
                })
                .collect(Collectors.toList());
    }



    @Override
    public Resource exportPdfReport(UUID groupId) {
        ProgressDTO progress = getProjectProgress(groupId);
        List<ContributionDTO> contributions = getPersonalContributions(groupId);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font fontHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Font fontSection = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
            Font fontNormal = FontFactory.getFont(FontFactory.HELVETICA, 11);

            // University Header
            Paragraph header1 = new Paragraph("HO CHI MINH CITY UNIVERSITY OF TRANSPORT", fontHeader);
            header1.setAlignment(Element.ALIGN_CENTER);
            document.add(header1);
            Paragraph header2 = new Paragraph("FACULTY OF INFORMATION TECHNOLOGY", fontHeader);
            header2.setAlignment(Element.ALIGN_CENTER);
            document.add(header2);
            document.add(new Paragraph("--------------------------------------------------", fontHeader) {{ setAlignment(Element.ALIGN_CENTER); }});
            document.add(new Paragraph(" "));

            // Title
            Paragraph title = new Paragraph("PROJECT SUMMARY REPORT", fontTitle);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            // Info Section
            PdfPTable infoTable = new PdfPTable(1);
            infoTable.setWidthPercentage(100);
            infoTable.addCell(new com.lowagie.text.pdf.PdfPCell(new Paragraph("Group ID: " + groupId, fontBold)) {{
                setPadding(10);
                setBorderColor(java.awt.Color.LIGHT_GRAY);
                setBackgroundColor(new java.awt.Color(245, 245, 245));
            }});
            document.add(infoTable);
            document.add(new Paragraph(" "));

            // Progress Section
            document.add(new Paragraph("1. OVERALL PROGRESS", fontSection));
            document.add(new Paragraph("Total Requirements: " + progress.getTotalTasks(), fontNormal));
            document.add(new Paragraph("Completed: " + progress.getCompletedTasks(), fontNormal));
            document.add(new Paragraph("Completion Rate: " + String.format("%.1f", progress.getProgressPercentage()) + "%", fontBold));
            document.add(new Paragraph(" "));

            // Member Contributions
            document.add(new Paragraph("2. MEMBER CONTRIBUTIONS", fontSection));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(3);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3, 1, 1});

            // Table Header
            com.lowagie.text.pdf.PdfPCell h1 = new com.lowagie.text.pdf.PdfPCell(new Paragraph("Student Name", fontBold));
            h1.setBackgroundColor(java.awt.Color.DARK_GRAY);
            h1.setPadding(8);
            h1.setHorizontalAlignment(Element.ALIGN_CENTER);
            com.lowagie.text.pdf.PdfPCell h2 = new com.lowagie.text.pdf.PdfPCell(new Paragraph("Done Tasks", fontBold));
            h2.setBackgroundColor(java.awt.Color.DARK_GRAY);
            h2.setPadding(8);
            h2.setHorizontalAlignment(Element.ALIGN_CENTER);
            com.lowagie.text.pdf.PdfPCell h3 = new com.lowagie.text.pdf.PdfPCell(new Paragraph("Commits", fontBold));
            h3.setBackgroundColor(java.awt.Color.DARK_GRAY);
            h3.setPadding(8);
            h3.setHorizontalAlignment(Element.ALIGN_CENTER);
            
            table.addCell(h1);
            table.addCell(h2);
            table.addCell(h3);

            for (ContributionDTO contribution : contributions) {
                table.addCell(new com.lowagie.text.pdf.PdfPCell(new Paragraph(contribution.getStudentName(), fontNormal)) {{ setPadding(6); }});
                table.addCell(new com.lowagie.text.pdf.PdfPCell(new Paragraph(String.valueOf(contribution.getCompletedTaskCount()), fontNormal)) {{ setPadding(6); setHorizontalAlignment(Element.ALIGN_CENTER); }});
                table.addCell(new com.lowagie.text.pdf.PdfPCell(new Paragraph(String.valueOf(contribution.getCommitCount()), fontNormal)) {{ setPadding(6); setHorizontalAlignment(Element.ALIGN_CENTER); }});
            }
            document.add(table);

            // Footer / Signature
            document.add(new Paragraph(" "));
            document.add(new Paragraph(" "));
            Paragraph datePara = new Paragraph("Date: " + LocalDate.now(), fontNormal);
            datePara.setAlignment(Element.ALIGN_RIGHT);
            document.add(datePara);
            
            PdfPTable signTable = new PdfPTable(2);
            signTable.setWidthPercentage(100);
            signTable.getDefaultCell().setBorder(com.lowagie.text.Rectangle.NO_BORDER);
            signTable.addCell(new Paragraph("\nGroup Leader Signature", fontBold) {{ setAlignment(Element.ALIGN_CENTER); }});
            signTable.addCell(new Paragraph("\nCourse Instructor Signature", fontBold) {{ setAlignment(Element.ALIGN_CENTER); }});
            document.add(signTable);

            document.close();
            return new ByteArrayResource(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tạo PDF", e);
        }
    }

    @Override
    public Resource exportSrsReport(UUID groupId) throws IOException {
        List<Requirement> requirements = requirementRepository.findByProjectGroup_GroupId(groupId);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font fontHeader = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22);
            Font fontSection = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            Font fontBold = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 11);
            Font fontNormal = FontFactory.getFont(FontFactory.HELVETICA, 11);

            // University Header
            Paragraph uHeader = new Paragraph("HO CHI MINH CITY UNIVERSITY OF TRANSPORT\nFACULTY OF INFORMATION TECHNOLOGY", fontHeader);
            uHeader.setAlignment(Element.ALIGN_CENTER);
            document.add(uHeader);
            document.add(new Paragraph("--------------------------------------------------", fontHeader) {{ setAlignment(Element.ALIGN_CENTER); }});
            document.add(new Paragraph(" "));

            // Title
            Paragraph title = new Paragraph("SOFTWARE REQUIREMENTS SPECIFICATION (SRS)", fontTitle);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            PdfPTable info = new PdfPTable(2);
            info.setWidthPercentage(100);
            info.addCell(new com.lowagie.text.pdf.PdfPCell(new Paragraph("Group ID:", fontBold)) {{ setBorder(com.lowagie.text.Rectangle.NO_BORDER); }});
            info.addCell(new com.lowagie.text.pdf.PdfPCell(new Paragraph(groupId.toString(), fontNormal)) {{ setBorder(com.lowagie.text.Rectangle.NO_BORDER); }});
            info.addCell(new com.lowagie.text.pdf.PdfPCell(new Paragraph("Export Date:", fontBold)) {{ setBorder(com.lowagie.text.Rectangle.NO_BORDER); }});
            info.addCell(new com.lowagie.text.pdf.PdfPCell(new Paragraph(LocalDate.now().toString(), fontNormal)) {{ setBorder(com.lowagie.text.Rectangle.NO_BORDER); }});
            document.add(info);
            document.add(new Paragraph(" "));

            // Section 1
            document.add(new Paragraph("1. INTRODUCTION", fontSection));
            document.add(new Paragraph("This document specifies the functional requirements for the Java project, synchronized directly from the Jira management system.", fontNormal));
            document.add(new Paragraph(" "));

            // Section 2
            document.add(new Paragraph("2. FUNCTIONAL REQUIREMENTS", fontSection));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(3);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1, 4, 1.5f});

            // Table Header
            com.lowagie.text.pdf.PdfPCell th1 = new com.lowagie.text.pdf.PdfPCell(new Paragraph("ID", fontBold));
            th1.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
            th1.setPadding(8);
            com.lowagie.text.pdf.PdfPCell th2 = new com.lowagie.text.pdf.PdfPCell(new Paragraph("Task Title & Description", fontBold));
            th2.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
            th2.setPadding(8);
            com.lowagie.text.pdf.PdfPCell th3 = new com.lowagie.text.pdf.PdfPCell(new Paragraph("Status", fontBold));
            th3.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
            th3.setPadding(8);

            table.addCell(th1);
            table.addCell(th2);
            table.addCell(th3);

            for (int i = 0; i < requirements.size(); i++) {
                Requirement req = requirements.get(i);
                
                table.addCell(new com.lowagie.text.pdf.PdfPCell(new Paragraph(req.getJiraKey() != null ? req.getJiraKey() : "REQ-" + (i+1), fontBold)) {{ setPadding(6); }});
                
                com.lowagie.text.pdf.PdfPCell cellDesc = new com.lowagie.text.pdf.PdfPCell();
                cellDesc.addElement(new Paragraph(req.getTitle(), fontBold));
                cellDesc.addElement(new Paragraph(req.getDescription() != null ? req.getDescription() : "No description provided.", fontNormal));
                cellDesc.setPadding(6);
                table.addCell(cellDesc);

                com.lowagie.text.pdf.PdfPCell cellStatus = new com.lowagie.text.pdf.PdfPCell(new Paragraph(req.getStatus(), fontNormal));
                cellStatus.setPadding(6);
                cellStatus.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(cellStatus);
            }
            document.add(table);

            document.close();
            return new ByteArrayResource(out.toByteArray());
        } catch (Exception e) {
            throw new IOException("Lỗi tạo PDF cho SRS", e);
        }
    }
}
