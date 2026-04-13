package JAVAGROUP.prjApp.services;

import JAVAGROUP.prjApp.dtos.NhomDTO;
import JAVAGROUP.prjApp.dtos.ThanhVienNhomDTO;
import JAVAGROUP.prjApp.entites.*;
import JAVAGROUP.prjApp.repositories.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class GroupService {

    private final NhomRepository nhomRepository;
    private final GiangVienRepository giangVienRepository;
    private final ThanhVienNhomRepository thanhVienNhomRepository;
    private final SinhVienRepository sinhVienRepository;

    public GroupService(NhomRepository nhomRepository,
                        GiangVienRepository giangVienRepository,
                        ThanhVienNhomRepository thanhVienNhomRepository,
                        SinhVienRepository sinhVienRepository) {
        this.nhomRepository = nhomRepository;
        this.giangVienRepository = giangVienRepository;
        this.thanhVienNhomRepository = thanhVienNhomRepository;
        this.sinhVienRepository = sinhVienRepository;
    }

    public Nhom taoNhom(NhomDTO dto) {
        GiangVien gv = giangVienRepository.findById(UUID.fromString(dto.getIdGiangVien()))
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên: " + dto.getIdGiangVien()));
        Nhom nhom = new Nhom();
        nhom.setTenNhom(dto.getTenNhom());
        nhom.setDeTai(dto.getDeTai());
        nhom.setGiangVien(gv);
        return nhomRepository.save(nhom);
    }

    public void xoaNhom(UUID idNhom) {
        if (!nhomRepository.existsById(idNhom)) {
            throw new RuntimeException("Nhóm không tồn tại: " + idNhom);
        }
        nhomRepository.deleteById(idNhom);
    }

    public void phanCongGiangVien(UUID idNhom, UUID idGV) {
        Nhom nhom = nhomRepository.findById(idNhom)
                .orElseThrow(() -> new RuntimeException("Nhóm không tồn tại: " + idNhom));
        GiangVien gv = giangVienRepository.findById(idGV)
                .orElseThrow(() -> new RuntimeException("Giảng viên không tồn tại: " + idGV));
        nhom.setGiangVien(gv);
        nhomRepository.save(nhom);
    }

    @Transactional(readOnly = true)
    public java.util.List<NhomDTO> layDanhSachNhom(UUID idGV) {
        if (idGV == null) {
            return nhomRepository.findAll()
                    .stream().map(this::toDTO).collect(java.util.stream.Collectors.toList());
        }
        GiangVien gv = giangVienRepository.findById(idGV)
                .orElseThrow(() -> new RuntimeException("Giảng viên không tồn tại: " + idGV));
        return (gv.getNhoms() == null ? java.util.List.<Nhom>of() : gv.getNhoms())
                .stream().map(this::toDTO).collect(java.util.stream.Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NhomDTO xemThongTinNhom(UUID idNhom) {
        Nhom nhom = nhomRepository.findById(idNhom)
                .orElseThrow(() -> new RuntimeException("Nhóm không tồn tại: " + idNhom));
        return toDTO(nhom);
    }

    @Transactional(readOnly = true)
    public List<ThanhVienNhomDTO> layDanhSachThanhVien(UUID idNhom) {
        return thanhVienNhomRepository.findById_IdNhom(idNhom)
                .stream()
                .map(tv -> {
                    SinhVien sv = tv.getSinhVien();
                    return new ThanhVienNhomDTO(
                            sv.getId(), sv.getMaSv(), sv.getHoTen(), sv.getLop(), tv.getVaiTro()
                    );
                })
                .collect(Collectors.toList());
    }

    /**
     * Thêm sinh viên vào nhóm. 
     * Một sinh viên chỉ được tham gia 1 nhóm (remove cũ nếu có).
     */
    public void themThanhVien(UUID idNhom, UUID idSinhVien) {
        // 1. Kiểm tra tồn tại
        Nhom nhom = nhomRepository.findById(idNhom)
                .orElseThrow(() -> new RuntimeException("Nhóm không tồn tại: " + idNhom));
        SinhVien sv = sinhVienRepository.findById(idSinhVien)
                .orElseThrow(() -> new RuntimeException("Sinh viên không tồn tại: " + idSinhVien));

        // 2. Xoá sinh viên khỏi các nhóm cũ (nếu có)
        List<ThanhVienNhom> cu = thanhVienNhomRepository.findById_IdSinhVien(idSinhVien);
        if (!cu.isEmpty()) {
            thanhVienNhomRepository.deleteAll(cu);
        }

        // 3. Thêm vào nhóm mới
        ThanhVienNhom tv = new ThanhVienNhom();
        tv.setId(new ThanhVienNhomId(idNhom, idSinhVien));
        tv.setNhom(nhom);
        tv.setSinhVien(sv);
        tv.setVaiTro(VaiTroNhom.MEMBER); // Default role
        thanhVienNhomRepository.save(tv);
    }

    /**
     * Loại bỏ sinh viên khỏi nhóm.
     */
    public void boThanhVien(UUID idSinhVien) {
        List<ThanhVienNhom> list = thanhVienNhomRepository.findById_IdSinhVien(idSinhVien);
        if (!list.isEmpty()) {
            thanhVienNhomRepository.deleteAll(list);
        }
    }

    private NhomDTO toDTO(Nhom nhom) {
        GiangVien gv = nhom.getGiangVien();
        List<ThanhVienNhomDTO> members = nhom.getThanhVienNhoms() == null ? List.of() :
            nhom.getThanhVienNhoms().stream()
                .map(tv -> {
                    SinhVien sv = tv.getSinhVien();
                    return new ThanhVienNhomDTO(
                        sv.getId(), sv.getMaSv(), sv.getHoTen(), sv.getLop(), tv.getVaiTro()
                    );
                })
                .collect(Collectors.toList());
                
        return new NhomDTO(
                nhom.getIdNhom(), nhom.getTenNhom(), nhom.getDeTai(),
                gv != null ? gv.getId().toString() : null,
                gv != null ? gv.getHoTen() : null,
                members
        );
    }
}
