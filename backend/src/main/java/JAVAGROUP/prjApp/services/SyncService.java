package JAVAGROUP.prjApp.services;

import JAVAGROUP.prjApp.adapter.IGitHubClient;
import JAVAGROUP.prjApp.adapter.IJiraClient;
import JAVAGROUP.prjApp.dtos.CommitDTO;
import JAVAGROUP.prjApp.dtos.YeuCauDTO;
import JAVAGROUP.prjApp.entites.*;
import JAVAGROUP.prjApp.repositories.*;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class SyncService {

    private static final Logger log = LoggerFactory.getLogger(SyncService.class);

    private final IJiraClient jiraClient;
    private final IGitHubClient gitHubClient;
    private final CauHinhTichHopRepository cauHinhTichHopRepository;
    private final NhomRepository nhomRepository;
    private final YeuCauRepository yeuCauRepository;
    private final NhiemVuRepository nhiemVuRepository;
    private final CommitVCSRepository commitVCSRepository;

    public SyncService(IJiraClient jiraClient, IGitHubClient gitHubClient,
                       CauHinhTichHopRepository cauHinhTichHopRepository,
                       NhomRepository nhomRepository, YeuCauRepository yeuCauRepository,
                       NhiemVuRepository nhiemVuRepository, CommitVCSRepository commitVCSRepository) {
        this.jiraClient = jiraClient;
        this.gitHubClient = gitHubClient;
        this.cauHinhTichHopRepository = cauHinhTichHopRepository;
        this.nhomRepository = nhomRepository;
        this.yeuCauRepository = yeuCauRepository;
        this.nhiemVuRepository = nhiemVuRepository;
        this.commitVCSRepository = commitVCSRepository;
    }

    public void dongBoJira(UUID idNhom) {
        Nhom nhom = nhomRepository.findById(idNhom)
                .orElseThrow(() -> new RuntimeException("Nhóm không tồn tại: " + idNhom));
        List<CauHinhTichHop> configs = cauHinhTichHopRepository.findByNhom_IdNhom(idNhom);
        CauHinhTichHop jiraConf = configs.stream()
                .filter(c -> "JIRA".equals(c.getLoaiNenTang())).findFirst()
                .orElseThrow(() -> new RuntimeException("Chưa cấu hình Jira cho nhóm: " + idNhom));

        List<YeuCauDTO> issues = jiraClient.fetchIssues(jiraConf.getUrl(), jiraConf.getEmail(), jiraConf.getApiToken(), jiraConf.getProjectKey());
        for (YeuCauDTO dto : issues) {
            if (!yeuCauRepository.existsById(dto.getIdYeuCau())) {
                YeuCau yc = new YeuCau();
                yc.setIdYeuCau(dto.getIdYeuCau());
                yc.setNhom(nhom);
                yc.setTieuDe(dto.getTieuDe());
                yc.setMoTa(dto.getMoTa());
                yc.setTrangThai(dto.getTrangThai());
                yeuCauRepository.save(yc);
            }
        }
    }

    public void dongBoGithub(UUID idNhom) {
        List<CauHinhTichHop> configs = cauHinhTichHopRepository.findByNhom_IdNhom(idNhom);
        CauHinhTichHop ghConf = configs.stream()
                .filter(c -> "GITHUB".equals(c.getLoaiNenTang())).findFirst()
                .orElseThrow(() -> new RuntimeException("Chưa cấu hình GitHub cho nhóm: " + idNhom));

        try {
            List<CommitDTO> commits = gitHubClient.fetchCommits(ghConf.getRepoUrl(), ghConf.getApiToken(), null);
            for (CommitDTO dto : commits) {
                if (!commitVCSRepository.existsById(dto.getSha())) {
                    CommitVCS commit = new CommitVCS();
                    commit.setSha(dto.getSha());
                    commit.setThongDiep(dto.getThongDiep());
                    commit.setThoiGian(dto.getThoiGian());
                    commitVCSRepository.save(commit);
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi đồng bộ GitHub cho nhóm {}: {}", idNhom, e.getMessage());
            throw e;
        }
    }

    public void mappingTaskCommit() {
        List<CommitVCS> commits = commitVCSRepository.findAll();
        // Regex to find patterns like [PROJ-123], PROJ-123, or keywords done PROJ-123
        Pattern taskPattern = Pattern.compile("([A-Z]+-\\d+)");
        Pattern donePattern = Pattern.compile("(?i)(done|close|fix|fixed)\\s+([A-Z]+-\\d+)");

        for (CommitVCS commit : commits) {
            if (commit.getThongDiep() == null) continue;

            // Check if this commit maps to a task
            Matcher matcher = taskPattern.matcher(commit.getThongDiep());
            if (matcher.find()) {
                String taskId = matcher.group(1);
                nhiemVuRepository.findById(taskId).ifPresent(nv -> {
                    commit.setNhiemVu(nv);
                    if (nv.getSinhVien() != null && commit.getSinhVien() == null) {
                        commit.setSinhVien(nv.getSinhVien());
                    }
                    commitVCSRepository.save(commit);

                    // Check for auto-update keywords
                    Matcher doneMatcher = donePattern.matcher(commit.getThongDiep());
                    if (doneMatcher.find()) {
                        nv.setTrangThai("DONE");
                        nv.setThoiGianCapNhat(java.time.LocalDateTime.now());
                        nhiemVuRepository.save(nv);
                    }
                });
            }
        }
    }
}
