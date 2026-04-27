package javagroup.prjapp.controllers;

import javagroup.prjapp.dtos.ContributionDTO;
import javagroup.prjapp.dtos.GitStatsDTO;
import javagroup.prjapp.dtos.ProgressDTO;
import javagroup.prjapp.dtos.CommitDTO;
import javagroup.prjapp.services.ReportService;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * GET /api/reports/{groupId}/progress
     * View project progress: total tasks, completed tasks, % progress
     */
    @GetMapping("/{groupId}/progress")
    public ResponseEntity<ProgressDTO> getProjectProgress(@PathVariable UUID groupId) {
        return ResponseEntity.ok(reportService.getProjectProgress(groupId));
    }

    /**
     * GET /api/reports/{groupId}/commits
     * GitHub commit statistics for the group
     */
    @GetMapping("/{groupId}/commits")
    public ResponseEntity<GitStatsDTO> getGithubStats(@PathVariable UUID groupId) {
        return ResponseEntity.ok(reportService.getGithubStats(groupId));
    }

    /**
     * GET /api/reports/{groupId}/contributions
     * View personal contributions of students in the group
     */
    @GetMapping("/{groupId}/contributions")
    public ResponseEntity<List<ContributionDTO>> getPersonalContributions(@PathVariable UUID groupId) {
        return ResponseEntity.ok(reportService.getPersonalContributions(groupId));
    }

    /**
     * GET /api/reports/{groupId}/history
     * Get progress history for AreaChart
     */
    @GetMapping("/{groupId}/history")
    public ResponseEntity<List<Map<String, Object>>> getProgressHistory(@PathVariable UUID groupId) {
        return ResponseEntity.ok(reportService.getProgressHistory(groupId));
    }

    /**
     * GET /api/reports/{groupId}/commits/history
     * Get group commit history for Heatmap
     */
    @GetMapping("/{groupId}/commits/history")
    public ResponseEntity<List<Map<String, Object>>> getGroupCommitHistory(@PathVariable UUID groupId) {
        return ResponseEntity.ok(reportService.getGroupCommitHistory(groupId));
    }

    /**
     * GET /api/reports/{groupId}/commits/detailed
     * Get detailed commit list for the group
     */
    @GetMapping("/{groupId}/commits/detailed")
    public ResponseEntity<List<CommitDTO>> getGroupCommitDetails(@PathVariable UUID groupId) {
        return ResponseEntity.ok(reportService.getGroupCommitDetails(groupId));
    }

    /**
     * GET /api/reports/personal/{studentId}/history
     * Get personal commit history for line/area chart
     */
    @GetMapping("/personal/{studentId}/history")
    public ResponseEntity<List<Map<String, Object>>> getPersonalCommitHistory(@PathVariable UUID studentId) {
        return ResponseEntity.ok(reportService.getPersonalCommitHistory(studentId));
    }

    /**
     * GET /api/reports/{groupId}/export
     * Export summary report as CSV
     */
    @GetMapping("/{groupId}/export")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Resource> exportSummaryReport(@PathVariable UUID groupId) {
        Resource file = reportService.exportSummaryReport(groupId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"group-report-" + groupId + ".csv\"")
                .body(file);
    }

    /**
     * GET /api/reports/{groupId}/export/docx
     * Export summary report as Docx
     */
    @GetMapping("/{groupId}/export/docx")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Resource> exportDocxReport(@PathVariable UUID groupId) throws java.io.IOException {
        Resource file = reportService.exportDocxReport(groupId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"report-" + groupId + ".docx\"")
                .body(file);
    }

    /**
     * GET /api/reports/{groupId}/export/pdf
     * Export summary report as PDF
     */
    @GetMapping("/{groupId}/export/pdf")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Resource> exportPdfReport(@PathVariable UUID groupId) {
        Resource file = reportService.exportPdfReport(groupId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/pdf"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"report-" + groupId + ".pdf\"")
                .body(file);
    }

    /**
     * GET /api/reports/{groupId}/export/srs
     * Export SRS document as Docx
     */
    @GetMapping("/{groupId}/export/srs")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Resource> exportSrsReport(@PathVariable UUID groupId) throws java.io.IOException {
        Resource file = reportService.exportSrsReport(groupId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"SRS-" + groupId + ".docx\"")
                .body(file);
    }
}
