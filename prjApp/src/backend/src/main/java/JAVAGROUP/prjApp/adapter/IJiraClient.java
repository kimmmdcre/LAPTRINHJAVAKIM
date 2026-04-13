package JAVAGROUP.prjApp.adapter;

import JAVAGROUP.prjApp.dto.YeuCauDTO;

import java.util.List;

public interface IJiraClient {
    List<YeuCauDTO> fetchIssues(String url, String email, String token, String projectKey);
    void testConnection(String url, String email, String token, String projectKey);
}
