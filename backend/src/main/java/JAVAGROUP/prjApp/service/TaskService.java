package JAVAGROUP.prjApp.service;

import JAVAGROUP.prjApp.dto.NhiemVuDTO;
import JAVAGROUP.prjApp.dto.YeuCauDTO;
import JAVAGROUP.prjApp.entity.NhiemVu;
import JAVAGROUP.prjApp.entity.SinhVien;
import JAVAGROUP.prjApp.repository.NhiemVuRepository;
import JAVAGROUP.prjApp.repository.YeuCauRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final YeuCauRepository yeuCauRepository;
    private final NhiemVuRepository nhiemVuRepository;
    private final JAVAGROUP.prjApp.repository.NhomRepository nhomRepository;

    public TaskService(YeuCauRepository yeuCauRepository, 
                       NhiemVuRepository nhiemVuRepository,
                       JAVAGROUP.prjApp.repository.NhomRepository nhomRepository) {
        this.yeuCauRepository = yeuCauRepository;
        this.nhiemVuRepository = nhiemVuRepository;
        this.nhomRepository = nhomRepository;
    }

    public java.util.List<YeuCauDTO> layYeuCauNhom(UUID idNhom) {
        return yeuCauRepository.findByNhom_IdNhom(idNhom)
                .stream()
                .map(yc -> new YeuCauDTO(
                        yc.getIdYeuCau(),
                        yc.getNhom().getIdNhom(),
                        yc.getTieuDe(),
                        yc.getMoTa(),
                        yc.getTrangThai()
                ))
                .collect(Collectors.toList());
    }

    public java.util.List<NhiemVuDTO> layNhiemVuNhom(UUID idNhom) {
        // Mocking task retrieval for leader view based on group ID
        return nhiemVuRepository.findAll().stream()
                .filter(nv -> nv.getYeuCau() != null && nv.getYeuCau().getNhom().getIdNhom().equals(idNhom))
                .map(this::toNhiemVuDTO)
                .collect(Collectors.toList());
    }

    public void syncJira(UUID idNhom) {
        JAVAGROUP.prjApp.entity.Nhom nhom = nhomRepository.findById(idNhom)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm: " + idNhom));
        
        // Mock sync: Create 3 requirements if not exist
        for (int i = 1; i <= 3; i++) {
            String jiraKey = "JIRA-" + (100 + i);
            if (!yeuCauRepository.existsById(jiraKey)) {
                JAVAGROUP.prjApp.entity.YeuCau yc = new JAVAGROUP.prjApp.entity.YeuCau();
                yc.setIdYeuCau(jiraKey);
                yc.setNhom(nhom);
                yc.setTieuDe("Yêu cầu hệ thống " + i);
                yc.setMoTa("Mô tả yêu cầu được đồng bộ từ Jira...");
                yc.setTrangThai("OPEN");
                yeuCauRepository.save(yc);

                // Create a corresponding task
                NhiemVu nv = new NhiemVu();
                nv.setIdNhiemVu(java.util.UUID.randomUUID().toString());
                nv.setYeuCau(yc);
                nv.setTieuDe("Xử lý " + yc.getTieuDe());
                nv.setTrangThai("TODO");
                nhiemVuRepository.save(nv);
            }
        }
    }

    public List<NhiemVuDTO> layNhiemVuCaNhan(UUID idSinhVien) {
        return nhiemVuRepository.findBySinhVien_Id(idSinhVien)
                .stream()
                .map(this::toNhiemVuDTO)
                .collect(Collectors.toList());
    }

    public void capNhatTrangThaiTask(String idNhiemVu, String status) {
        NhiemVu nv = nhiemVuRepository.findById(idNhiemVu)
                .orElseThrow(() -> new RuntimeException("Nhiệm vụ không tồn tại: " + idNhiemVu));
        nv.setTrangThai(status);
        nhiemVuRepository.save(nv);
    }

    private NhiemVuDTO toNhiemVuDTO(NhiemVu nv) {
        SinhVien sv = nv.getSinhVien();
        return new NhiemVuDTO(
                nv.getIdNhiemVu(),
                nv.getYeuCau() != null ? nv.getYeuCau().getIdYeuCau() : null,
                sv != null ? sv.getId() : null,
                sv != null ? sv.getHoTen() : null,
                nv.getTieuDe(),
                nv.getTrangThai()
        );
    }
}
