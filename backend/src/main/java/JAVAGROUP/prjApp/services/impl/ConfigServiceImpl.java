package javagroup.prjApp.services.impl;

import javagroup.prjApp.services.ConfigService;

import javagroup.prjApp.dtos.ConfigDTO;
import javagroup.prjApp.entities.IntegrationConfig;
import javagroup.prjApp.repositories.IntegrationConfigRepository;
import javagroup.prjApp.repositories.GroupRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class ConfigServiceImpl implements ConfigService {

    private final IntegrationConfigRepository integrationConfigRepository;
    private final GroupRepository groupRepository;

    public ConfigServiceImpl(IntegrationConfigRepository integrationConfigRepository, GroupRepository groupRepository) {
        this.integrationConfigRepository = integrationConfigRepository;
        this.groupRepository = groupRepository;
    }

    @Transactional(readOnly = true)
    public List<IntegrationConfig> getConfigsByGroupId(UUID groupId) {
        return integrationConfigRepository.findByGroupId(groupId);
    }

    public void saveConfig(ConfigDTO dto) {
        if (dto.getGroupId() == null) {
            throw new RuntimeException("GroupId is required");
        }

        groupRepository.findById(dto.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group does not exist: " + dto.getGroupId()));

        IntegrationConfig conf;
        if (dto.getId() != null) {
            conf = integrationConfigRepository.findById(dto.getId())
                    .orElse(new IntegrationConfig());
        } else {
            // Check if config for this platform already exists in group
            conf = integrationConfigRepository.findByGroupId(dto.getGroupId())
                    .stream()
                    .filter(c -> dto.getPlatformType().equals(c.getPlatformType()))
                    .findFirst()
                    .orElse(new IntegrationConfig());
        }

        conf.setGroupId(dto.getGroupId());
        conf.setPlatformType(dto.getPlatformType());
        conf.setUrl(dto.getUrl());
        conf.setEmail(dto.getEmail());
        conf.setApiToken(dto.getApiToken());
        conf.setProjectKey(dto.getProjectKey());
        conf.setRepoUrl(dto.getRepoUrl());

        integrationConfigRepository.save(conf);
    }

    public void removeConfig(UUID id) {
        if (!integrationConfigRepository.existsById(id)) {
            throw new RuntimeException("Configuration does not exist: " + id);
        }
        integrationConfigRepository.deleteById(id);
    }

    /**
     * Dry run test connection logic
     */
    public boolean testConnection(ConfigDTO dto) {
        // Simple validation for now
        if ("JIRA".equals(dto.getPlatformType())) {
            return dto.getUrl() != null && dto.getApiToken() != null && dto.getProjectKey() != null;
        } else if ("GITHUB".equals(dto.getPlatformType())) {
            return dto.getRepoUrl() != null && dto.getApiToken() != null;
        }
        return false;
    }
}
