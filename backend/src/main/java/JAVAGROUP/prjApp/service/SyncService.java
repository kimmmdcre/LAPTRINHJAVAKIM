package JAVAGROUP.prjApp.service;

import JAVAGROUP.prjApp.adapter.IGitHubClient;
import JAVAGROUP.prjApp.adapter.IJiraClient;
import JAVAGROUP.prjApp.dto.CommitDTO;
import JAVAGROUP.prjApp.dto.YeuCauDTO;
import JAVAGROUP.prjApp.entity.*;
import JAVAGROUP.prjApp.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class SyncService {

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

        List<YeuCauDTO> issues = jiraClient.fetchIssues(jiraConf.getUrl(), jiraConf.getApiToken(), nhom.getTenNhom());
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
    }

    public void mappingTaskCommit() {
        List<CommitVCS> commits = commitVCSRepository.findAll();
        for (CommitVCS commit : commits) {
            if (commit.getNhiemVu() == null && commit.getThongDiep() != null) {
                String[] parts = commit.getThongDiep().split(":");
                if (parts.length > 0) {
                    String possibleTaskId = parts[0].trim();
                    nhiemVuRepository.findById(possibleTaskId).ifPresent(nv -> {
                        commit.setNhiemVu(nv);
                        commitVCSRepository.save(commit);
                    });
                }
            }
        }
    }
}
