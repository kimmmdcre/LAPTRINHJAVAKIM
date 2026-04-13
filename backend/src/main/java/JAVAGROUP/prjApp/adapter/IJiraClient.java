package JAVAGROUP.prjApp.adapter;

import java.util.List;

import JAVAGROUP.prjApp.dtos.YeuCauDTO;

public interface IJiraClient {
    List<YeuCauDTO> fetchIssues(String url, String email, String token, String projectKey);
    void testConnection(String url, String email, String token, String projectKey);
}
