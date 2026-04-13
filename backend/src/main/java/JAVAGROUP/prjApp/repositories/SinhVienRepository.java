package JAVAGROUP.prjApp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import JAVAGROUP.prjApp.entites.SinhVien;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SinhVienRepository extends JpaRepository<SinhVien, UUID> {
    Optional<SinhVien> findByMaSv(String maSv);
}
