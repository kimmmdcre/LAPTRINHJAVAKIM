package JAVAGROUP.prjApp.repository;

import JAVAGROUP.prjApp.entity.NhiemVu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NhiemVuRepository extends JpaRepository<NhiemVu, String> {
    List<NhiemVu> findByIdSinhVien_Id(UUID idSinhVien);
    List<NhiemVu> findByIdYeuCau_IdYeuCau(String idYeuCau);
}
