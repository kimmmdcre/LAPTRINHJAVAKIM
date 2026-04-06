package JAVAGROUP.prjApp.repository;

import JAVAGROUP.prjApp.entity.SinhVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SinhVienRepository extends JpaRepository<SinhVien, UUID> {
    Optional<SinhVien> findByMaSv(String maSv);
}
