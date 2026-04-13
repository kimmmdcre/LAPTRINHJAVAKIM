package JAVAGROUP.prjApp.adapter;

import JAVAGROUP.prjApp.dto.CommitDTO;

import java.util.List;

public interface IGitHubClient {
    List<CommitDTO> fetchCommits(String repo, String token, String since);
    void testConnection(String repo, String token);
}
