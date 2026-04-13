package JAVAGROUP.prjApp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import JAVAGROUP.prjApp.entites.ThanhVienNhom;
import JAVAGROUP.prjApp.entites.ThanhVienNhomId;

import java.util.List;
import java.util.UUID;

@Repository
public interface ThanhVienNhomRepository extends JpaRepository<ThanhVienNhom, ThanhVienNhomId> {
    List<ThanhVienNhom> findById_IdNhom(UUID idNhom);
    List<ThanhVienNhom> findById_IdSinhVien(UUID idSinhVien);
}
