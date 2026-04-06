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

    public TaskService(YeuCauRepository yeuCauRepository, NhiemVuRepository nhiemVuRepository) {
        this.yeuCauRepository = yeuCauRepository;
        this.nhiemVuRepository = nhiemVuRepository;
    }

    public List<YeuCauDTO> layYeuCauNhom(UUID idNhom) {
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
