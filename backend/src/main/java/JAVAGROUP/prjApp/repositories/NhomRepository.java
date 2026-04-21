package JAVAGROUP.prjApp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import JAVAGROUP.prjApp.entities.Nhom;

import java.util.UUID;

@Repository
public interface NhomRepository extends JpaRepository<Nhom, UUID> {
}
