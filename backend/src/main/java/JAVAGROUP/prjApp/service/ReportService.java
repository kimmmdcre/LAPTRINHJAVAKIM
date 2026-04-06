package JAVAGROUP.prjApp.service;

import JAVAGROUP.prjApp.dto.DongGopDTO;
import JAVAGROUP.prjApp.dto.ThongKeGitDTO;
import JAVAGROUP.prjApp.dto.TienDoDTO;
import JAVAGROUP.prjApp.entity.CommitVCS;
import JAVAGROUP.prjApp.entity.NhiemVu;
import JAVAGROUP.prjApp.entity.SinhVien;
import JAVAGROUP.prjApp.repository.CommitVCSRepository;
import JAVAGROUP.prjApp.repository.NhiemVuRepository;
import JAVAGROUP.prjApp.repository.ThanhVienNhomRepository;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final NhiemVuRepository nhiemVuRepository;
    private final CommitVCSRepository commitVCSRepository;
    private final ThanhVienNhomRepository thanhVienNhomRepository;

    public ReportService(NhiemVuRepository nhiemVuRepository,
                         CommitVCSRepository commitVCSRepository,
                         ThanhVienNhomRepository thanhVienNhomRepository) {
        this.nhiemVuRepository = nhiemVuRepository;
        this.commitVCSRepository = commitVCSRepository;
        this.thanhVienNhomRepository = thanhVienNhomRepository;
    }

    public TienDoDTO xemTienDoDuAn(UUID idNhom) {
        List<NhiemVu> tasks = nhiemVuRepository.findAll().stream()
                .filter(nv -> nv.getYeuCau() != null
                        && nv.getYeuCau().getNhom() != null
                        && idNhom.equals(nv.getYeuCau().getNhom().getIdNhom()))
                .collect(Collectors.toList());

        int total = tasks.size();
        long done = tasks.stream().filter(nv -> "DONE".equalsIgnoreCase(nv.getTrangThai())).count();
        double percent = total == 0 ? 0.0 : (double) done / total * 100;
        return new TienDoDTO(idNhom, total, (int) done, percent);
    }

    public ThongKeGitDTO thongKeGithub(UUID idNhom) {
        List<CommitVCS> commits = commitVCSRepository.findAll().stream()
                .filter(c -> c.getNhiemVu() != null
                        && c.getNhiemVu().getYeuCau() != null
                        && c.getNhiemVu().getYeuCau().getNhom() != null
                        && idNhom.equals(c.getNhiemVu().getYeuCau().getNhom().getIdNhom()))
                .collect(Collectors.toList());

        Map<String, Integer> commitPerSV = new HashMap<>();
        for (CommitVCS c : commits) {
            if (c.getSinhVien() != null) {
                String name = c.getSinhVien().getHoTen();
                commitPerSV.merge(name, 1, Integer::sum);
            }
        }
        return new ThongKeGitDTO(idNhom, commits.size(), commitPerSV);
    }

    public List<DongGopDTO> xemDongGopCaNhan(UUID idNhom) {
        return thanhVienNhomRepository.findById_IdNhom(idNhom).stream()
                .map(tv -> {
                    SinhVien sv = tv.getSinhVien();
                    List<NhiemVu> tasks = nhiemVuRepository.findBySinhVien_Id(sv.getId());
                    long doneTasks = tasks.stream()
                            .filter(nv -> "DONE".equalsIgnoreCase(nv.getTrangThai())).count();
                    long commitCount = commitVCSRepository.findAll().stream()
                            .filter(c -> c.getSinhVien() != null && sv.getId().equals(c.getSinhVien().getId()))
                            .count();
                    return new DongGopDTO(sv.getId(), sv.getHoTen(), (int) doneTasks, (int) commitCount);
                })
                .collect(Collectors.toList());
    }

    public Resource xuatBaoCaoTongHop(UUID idNhom) {
        TienDoDTO tienDo = xemTienDoDuAn(idNhom);
        List<DongGopDTO> dongGops = xemDongGopCaNhan(idNhom);

        StringBuilder sb = new StringBuilder();
        sb.append("BÁO CÁO NHÓM: ").append(idNhom).append("\n\n");
        sb.append("TIẾN ĐỘ:\nTổng NV,NV Hoàn Thành,% Tiến Độ\n");
        sb.append(tienDo.getTongSoNhiemVu()).append(",")
                .append(tienDo.getNhiemVuHoanThanh()).append(",")
                .append(String.format("%.1f", tienDo.getPhanTramTienDo())).append("%\n\n");

        sb.append("ĐÓNG GÓP THÀNH VIÊN:\nTên,Nhiệm Vụ Hoàn Thành,Số Commit\n");
        for (DongGopDTO dg : dongGops) {
            sb.append(dg.getTenSinhVien()).append(",")
                    .append(dg.getSoNhiemVuHoanThanh()).append(",")
                    .append(dg.getSoCommit()).append("\n");
        }
        return new ByteArrayResource(sb.toString().getBytes(StandardCharsets.UTF_8));
    }
}
