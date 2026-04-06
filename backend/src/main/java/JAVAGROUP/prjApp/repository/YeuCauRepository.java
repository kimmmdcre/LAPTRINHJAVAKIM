package JAVAGROUP.prjApp.repository;

import JAVAGROUP.prjApp.entity.YeuCau;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface YeuCauRepository extends JpaRepository<YeuCau, String> {
    List<YeuCau> findByNhom_IdNhom(UUID idNhom);
}
