package JAVAGROUP.prjApp.adapter;

import java.util.List;

import JAVAGROUP.prjApp.dtos.CommitDTO;

public interface IGitHubClient {
    List<CommitDTO> fetchCommits(String repo, String token, String since);

    void testConnection(String repo, String token);
}
