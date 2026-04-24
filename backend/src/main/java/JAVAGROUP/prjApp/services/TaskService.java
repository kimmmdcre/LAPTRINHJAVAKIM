package JAVAGROUP.prjApp.services;

import JAVAGROUP.prjApp.dtos.NhiemVuDTO;
import JAVAGROUP.prjApp.dtos.YeuCauDTO;
import JAVAGROUP.prjApp.entities.NhiemVu;
import JAVAGROUP.prjApp.entities.SinhVien;
import JAVAGROUP.prjApp.repositories.NhiemVuRepository;
import JAVAGROUP.prjApp.repositories.SinhVienRepository;
import JAVAGROUP.prjApp.repositories.YeuCauRepository;
import JAVAGROUP.prjApp.repositories.ThanhVienNhomRepository;
import JAVAGROUP.prjApp.entities.ThanhVienNhom;
import JAVAGROUP.prjApp.entities.VaiTroNhom;
import JAVAGROUP.prjApp.entities.ThanhVienNhomId;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final YeuCauRepository yeuCauRepository;
    private final NhiemVuRepository nhiemVuRepository;
    private final SinhVienRepository sinhVienRepository;
    private final ThanhVienNhomRepository thanhVienNhomRepository;
    private final JAVAGROUP.prjApp.repositories.CommitVCSRepository commitVCSRepository;

    public TaskService(YeuCauRepository yeuCauRepository, 
                       NhiemVuRepository nhiemVuRepository,
                       SinhVienRepository sinhVienRepository,
                       ThanhVienNhomRepository thanhVienNhomRepository,
                       JAVAGROUP.prjApp.repositories.CommitVCSRepository commitVCSRepository) {
        this.yeuCauRepository = yeuCauRepository;
        this.nhiemVuRepository = nhiemVuRepository;
        this.sinhVienRepository = sinhVienRepository;
        this.thanhVienNhomRepository = thanhVienNhomRepository;
        this.commitVCSRepository = commitVCSRepository;
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

    public void phanCongNhiemVu(String idNhiemVu, UUID idSinhVien, UUID idNguoiYeuCau) {
        NhiemVu nv = nhiemVuRepository.findById(idNhiemVu)
                .orElseThrow(() -> new RuntimeException("Nhiệm vụ không tồn tại: " + idNhiemVu));
        
        UUID idNhom = nv.getYeuCau().getNhom().getIdNhom();
        
        // Kiểm tra xem người yêu cầu có phải là LEADER của nhóm này không
        ThanhVienNhomId requesterId = new ThanhVienNhomId(idNhom, idNguoiYeuCau);
        ThanhVienNhom thanhVien = thanhVienNhomRepository.findById(requesterId)
                .orElseThrow(() -> new RuntimeException("Bạn không thuộc nhóm này"));
        
        if (thanhVien.getVaiTro() != VaiTroNhom.LEADER) {
            throw new RuntimeException("Chỉ Trưởng nhóm (Leader) mới có quyền phân công nhiệm vụ");
        }

        SinhVien sv = sinhVienRepository.findById(idSinhVien)
                .orElseThrow(() -> new RuntimeException("Sinh viên được phân công không tồn tại: " + idSinhVien));
        
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

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public List<JAVAGROUP.prjApp.dtos.CommitDTO> layCommitNhom(UUID idNhom) {
        return commitVCSRepository.findByYeuCau_Nhom_IdNhom(idNhom)
                .stream()
                .map(c -> {
                    JAVAGROUP.prjApp.dtos.CommitDTO dto = new JAVAGROUP.prjApp.dtos.CommitDTO();
                    dto.setSha(c.getSha());
                    dto.setThongDiep(c.getThongDiep());
                    dto.setThoiGian(c.getThoiGian());
                    if (c.getYeuCau() != null) {
                        dto.setIdYeuCau(c.getYeuCau().getIdYeuCau());
                        dto.setTieuDeYeuCau(c.getYeuCau().getTieuDe());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
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
