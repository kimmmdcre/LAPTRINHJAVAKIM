package JAVAGROUP.prjApp.repository;

import JAVAGROUP.prjApp.entity.CommitVCS;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommitVCSRepository extends JpaRepository<CommitVCS, String> {
    List<CommitVCS> findByNhiemVu_IdNhiemVu(String idNhiemVu);
}
