package javagroup.prjApp.features.tasks.adapters;

import java.util.List;

import javagroup.prjApp.features.tasks.RequirementDTO;

public interface IJiraClient {
    List<RequirementDTO> getRequirements(String url, String email, String accessToken, String projectKey);
    void checkConnection(String url, String email, String accessToken, String projectKey);
}
