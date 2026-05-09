package javagroup.prjApp.services;

import javagroup.prjApp.dtos.ConfigDTO;
import javagroup.prjApp.entities.IntegrationConfig;
import java.util.List;
import java.util.UUID;

public interface ConfigService {
    public List<IntegrationConfig> getConfigsByGroupId(UUID groupId);
    public void saveConfig(ConfigDTO dto);
    public void removeConfig(UUID id);
    public boolean testConnection(ConfigDTO dto);
}
