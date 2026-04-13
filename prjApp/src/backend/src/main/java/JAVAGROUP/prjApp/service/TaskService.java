package JAVAGROUP.prjApp.service;

import JAVAGROUP.prjApp.dto.NhiemVuDTO;
import JAVAGROUP.prjApp.dto.YeuCauDTO;
import JAVAGROUP.prjApp.entity.NhiemVu;
import JAVAGROUP.prjApp.entity.SinhVien;
import JAVAGROUP.prjApp.repository.NhiemVuRepository;
import JAVAGROUP.prjApp.repository.SinhVienRepository;
import JAVAGROUP.prjApp.repository.YeuCauRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final YeuCauRepository yeuCauRepository;
    private final NhiemVuRepository nhiemVuRepository;
    private final SinhVienRepository sinhVienRepository;
    private final JAVAGROUP.prjApp.repository.NhomRepository nhomRepository;

    public TaskService(YeuCauRepository yeuCauRepository, 
                       NhiemVuRepository nhiemVuRepository,
                       SinhVienRepository sinhVienRepository,
                       JAVAGROUP.prjApp.repository.NhomRepository nhomRepository) {
        this.yeuCauRepository = yeuCauRepository;
        this.nhiemVuRepository = nhiemVuRepository;
        this.sinhVienRepository = sinhVienRepository;
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

    public void phanCongNhiemVu(String idNhiemVu, UUID idSinhVien) {
        NhiemVu nv = nhiemVuRepository.findById(idNhiemVu)
                .orElseThrow(() -> new RuntimeException("Nhiệm vụ không tồn tại: " + idNhiemVu));
        SinhVien sv = sinhVienRepository.findById(idSinhVien)
                .orElseThrow(() -> new RuntimeException("Sinh viên không tồn tại: " + idSinhVien));
        
        nv.setSinhVien(sv);
        nhiemVuRepository.save(nv);
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
        nv.setThoiGianCapNhat(java.time.LocalDateTime.now());
        nhiemVuRepository.save(nv);
    }

    private NhiemVuDTO toNhiemVuDTO(NhiemVu nv) {
        SinhVien sv = nv.getSinhVien();
        int commitCount = nv.getCommitVCSs() != null ? nv.getCommitVCSs().size() : 0;
        return new NhiemVuDTO(
                nv.getIdNhiemVu(),
                nv.getYeuCau() != null ? nv.getYeuCau().getIdYeuCau() : null,
                sv != null ? sv.getId() : null,
                sv != null ? sv.getHoTen() : null,
                nv.getTieuDe(),
                nv.getTrangThai(),
                commitCount
        );
    }
}
