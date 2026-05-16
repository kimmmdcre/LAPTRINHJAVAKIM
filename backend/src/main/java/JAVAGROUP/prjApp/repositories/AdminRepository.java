package javagroup.prjApp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javagroup.prjApp.entities.Admin;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdminRepository extends JpaRepository<Admin, UUID> {
    Optional<Admin> findByAdminCode(String adminCode);
}