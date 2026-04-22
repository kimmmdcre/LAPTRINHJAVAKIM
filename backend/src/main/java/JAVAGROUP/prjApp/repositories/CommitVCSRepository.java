package JAVAGROUP.prjApp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import JAVAGROUP.prjApp.entities.CommitVCS;

import java.util.List;

@Repository
public interface CommitVCSRepository extends JpaRepository<CommitVCS, String> {
    List<CommitVCS> findByNhiemVu_IdNhiemVu(String idNhiemVu);
    @org.springframework.data.jpa.repository.Query("SELECT c FROM CommitVCS c JOIN FETCH c.yeuCau y WHERE y.nhom.idNhom = :idNhom")
    List<CommitVCS> findByYeuCau_Nhom_IdNhom(@org.springframework.data.repository.query.Param("idNhom") java.util.UUID idNhom);
}
