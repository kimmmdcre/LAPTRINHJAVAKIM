package javagroup.prjApp.utils.adapters;

import java.util.List;

import javagroup.prjApp.dtos.RequirementDTO;

public interface IJiraClient {
    List<RequirementDTO> getRequirements(String url, String email, String accessToken, String projectKey);
    void checkConnection(String url, String email, String accessToken, String projectKey);
}
