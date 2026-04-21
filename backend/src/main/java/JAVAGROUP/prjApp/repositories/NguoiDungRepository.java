package JAVAGROUP.prjApp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import JAVAGROUP.prjApp.entities.NguoiDung;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NguoiDungRepository extends JpaRepository<NguoiDung, UUID> {
    Optional<NguoiDung> findByTenDangNhap(String tenDangNhap);
    Optional<NguoiDung> findByEmail(String email);
}
