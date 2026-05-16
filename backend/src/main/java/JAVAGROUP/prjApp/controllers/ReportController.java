package javagroup.prjApp.controllers;

import lombok.RequiredArgsConstructor;

import javagroup.prjApp.dtos.ContributionDTO;
import javagroup.prjApp.dtos.GitStatsDTO;
import javagroup.prjApp.dtos.ProgressDTO;
import javagroup.prjApp.dtos.CommitDTO;
import javagroup.prjApp.services.ReportService;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import java.io.IOException;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * GET /api/reports/{groupId}/progress
     * View project progress: total tasks, completed tasks, % progress
     */
    @GetMapping("/{groupId}/progress")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ProgressDTO> getProjectProgress(@PathVariable UUID groupId) {
        return ResponseEntity.ok(reportService.getProjectProgress(groupId));
    }

    /**
     * GET /api/reports/{groupId}/commits
     * GitHub commit statistics for the group
     */
    @GetMapping("/{groupId}/commits")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<GitStatsDTO> getGithubStats(@PathVariable UUID groupId) {
        return ResponseEntity.ok(reportService.getGithubStats(groupId));
    }

    @GetMapping("/{groupId}/contributions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ContributionDTO>> getPersonalContributions(@PathVariable UUID groupId) {
        return ResponseEntity.ok(reportService.getPersonalContributions(groupId));
    }

    @GetMapping("/{groupId}/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getProgressHistory(@PathVariable UUID groupId) {
        return ResponseEntity.ok(reportService.getProgressHistory(groupId));
    }

    @GetMapping("/{groupId}/commits/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getGroupCommitHistory(@PathVariable UUID groupId) {
        return ResponseEntity.ok(reportService.getGroupCommitHistory(groupId));
    }

    @GetMapping("/{groupId}/commits/detailed")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CommitDTO>> getGroupCommitDetails(@PathVariable UUID groupId) {
        return ResponseEntity.ok(reportService.getGroupCommitDetails(groupId));
    }

    @GetMapping("/personal/{studentId}/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Map<String, Object>>> getPersonalCommitHistory(@PathVariable UUID studentId) {
        return ResponseEntity.ok(reportService.getPersonalCommitHistory(studentId));
    }

    @GetMapping("/{groupId}/export/pdf")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Resource> exportPdfReport(@PathVariable UUID groupId) {
        Resource file = reportService.exportPdfReport(groupId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/pdf"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"report-" + groupId + ".pdf\"")
                .body(file);
    }

    @GetMapping("/{groupId}/export/srs")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    public ResponseEntity<Resource> exportSrsReport(@PathVariable UUID groupId) throws IOException {
        Resource file = reportService.exportSrsReport(groupId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/pdf"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"SRS-" + groupId + ".pdf\"")
                .body(file);
    }
}