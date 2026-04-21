package JAVAGROUP.prjApp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import JAVAGROUP.prjApp.entities.YeuCau;

import java.util.List;
import java.util.UUID;

@Repository
public interface YeuCauRepository extends JpaRepository<YeuCau, String> {
    List<YeuCau> findByNhom_IdNhom(UUID idNhom);
}
