package JAVAGROUP.prjApp.repository;

import JAVAGROUP.prjApp.entity.QuanTriVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface QuanTriVienRepository extends JpaRepository<QuanTriVien, UUID> {
    Optional<QuanTriVien> findByMaGv(String maGv);
}
