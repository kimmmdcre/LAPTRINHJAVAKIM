package JAVAGROUP.prjApp.repository;

import JAVAGROUP.prjApp.entity.Nhom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NhomRepository extends JpaRepository<Nhom, UUID> {
}
