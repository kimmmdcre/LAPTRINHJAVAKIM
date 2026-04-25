package JAVAGROUP.prjApp.adapter;

import java.util.List;

import JAVAGROUP.prjApp.dtos.RequirementDTO;

public interface IJiraClient {
    List<RequirementDTO> getRequirements(String url, String email, String accessToken, String projectKey);
    void checkConnection(String url, String email, String accessToken, String projectKey);
}
