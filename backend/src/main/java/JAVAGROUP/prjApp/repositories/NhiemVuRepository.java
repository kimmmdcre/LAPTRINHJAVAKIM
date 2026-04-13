package JAVAGROUP.prjApp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import JAVAGROUP.prjApp.entites.NhiemVu;

import java.util.List;
import java.util.UUID;

@Repository
public interface NhiemVuRepository extends JpaRepository<NhiemVu, String> {
    List<NhiemVu> findBySinhVien_Id(UUID idSinhVien);
    List<NhiemVu> findByYeuCau_IdYeuCau(String idYeuCau);
}
