package JAVAGROUP.prjApp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import JAVAGROUP.prjApp.entites.GiangVien;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GiangVienRepository extends JpaRepository<GiangVien, UUID> {
    Optional<GiangVien> findByMaGiangVien(String maGiangVien);
}
