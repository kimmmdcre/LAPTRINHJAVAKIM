package JAVAGROUP.prjApp.service;

import JAVAGROUP.prjApp.dto.NhomDTO;
import JAVAGROUP.prjApp.dto.ThanhVienNhomDTO;
import JAVAGROUP.prjApp.entity.*;
import JAVAGROUP.prjApp.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GroupService {

    private final NhomRepository nhomRepository;
    private final GiangVienRepository giangVienRepository;
    private final ThanhVienNhomRepository thanhVienNhomRepository;

    public GroupService(NhomRepository nhomRepository,
                        GiangVienRepository giangVienRepository,
                        ThanhVienNhomRepository thanhVienNhomRepository) {
        this.nhomRepository = nhomRepository;
        this.giangVienRepository = giangVienRepository;
        this.thanhVienNhomRepository = thanhVienNhomRepository;
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

    public List<NhomDTO> layDanhSachNhom(UUID idGV) {
        GiangVien gv = giangVienRepository.findById(idGV)
                .orElseThrow(() -> new RuntimeException("Giảng viên không tồn tại: " + idGV));
        return (gv.getNhoms() == null ? List.<Nhom>of() : gv.getNhoms())
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    public NhomDTO xemThongTinNhom(UUID idNhom) {
        Nhom nhom = nhomRepository.findById(idNhom)
                .orElseThrow(() -> new RuntimeException("Nhóm không tồn tại: " + idNhom));
        return toDTO(nhom);
    }

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

    private NhomDTO toDTO(Nhom nhom) {
        GiangVien gv = nhom.getGiangVien();
        return new NhomDTO(
                nhom.getIdNhom(), nhom.getTenNhom(), nhom.getDeTai(),
                gv != null ? gv.getId().toString() : null,
                gv != null ? gv.getHoTen() : null
        );
    }
}
