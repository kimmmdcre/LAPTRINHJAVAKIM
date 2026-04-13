package JAVAGROUP.prjApp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import JAVAGROUP.prjApp.entites.CommitVCS;

import java.util.List;

@Repository
public interface CommitVCSRepository extends JpaRepository<CommitVCS, String> {
    List<CommitVCS> findByNhiemVu_IdNhiemVu(String idNhiemVu);
}
