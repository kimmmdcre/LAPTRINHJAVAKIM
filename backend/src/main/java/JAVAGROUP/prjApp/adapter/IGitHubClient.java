package javagroup.prjApp.adapter;

import java.util.List;

import javagroup.prjApp.dtos.CommitDTO;

public interface IGitHubClient {
    List<CommitDTO> getCommits(String repo, String accessToken, String sinceDate);

    void checkConnection(String repo, String accessToken);
}
