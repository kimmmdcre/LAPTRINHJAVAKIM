package JAVAGROUP.prjApp.repository;

import JAVAGROUP.prjApp.entity.GiangVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GiangVienRepository extends JpaRepository<GiangVien, UUID> {
    Optional<GiangVien> findByMaGiangVien(String maGiangVien);
}
