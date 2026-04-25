package JAVAGROUP.prjApp.adapter;

import java.util.List;

import JAVAGROUP.prjApp.dtos.CommitDTO;

public interface IGitHubClient {
    List<CommitDTO> getCommits(String repo, String accessToken, String sinceDate);

    void checkConnection(String repo, String accessToken);
}
