package JAVAGROUP.prjApp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import JAVAGROUP.prjApp.entities.CauHinhTichHop;

import java.util.List;
import java.util.UUID;

@Repository
public interface CauHinhTichHopRepository extends JpaRepository<CauHinhTichHop, UUID> {
    List<CauHinhTichHop> findByNhom_IdNhom(UUID idNhom);
}
