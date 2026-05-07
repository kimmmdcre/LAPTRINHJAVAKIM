package javagroup.prjApp.services;

import javagroup.prjApp.services.ConfigService;
import javagroup.prjApp.dtos.ConfigDTO;
import javagroup.prjApp.entities.IntegrationConfig;
import javagroup.prjApp.entities.Group;
import javagroup.prjApp.repositories.IntegrationConfigRepository;
import javagroup.prjApp.repositories.GroupRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

public interface ConfigService {
    public List<IntegrationConfig> getConfigsByGroupId(UUID groupId);
    public void saveConfig(ConfigDTO dto);
    public void removeConfig(UUID id);
    public boolean testConnection(ConfigDTO dto);
}
