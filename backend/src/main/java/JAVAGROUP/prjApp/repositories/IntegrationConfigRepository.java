package javagroup.prjapp.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javagroup.prjapp.entities.IntegrationConfig;

import java.util.List;
import java.util.UUID;

@Repository
public interface IntegrationConfigRepository extends JpaRepository<IntegrationConfig, UUID> {
    List<IntegrationConfig> findByGroupId(UUID groupId);
}
