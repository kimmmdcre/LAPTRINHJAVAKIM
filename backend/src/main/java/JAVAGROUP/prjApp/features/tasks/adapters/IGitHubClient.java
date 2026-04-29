package javagroup.prjApp.features.tasks.adapters;

import java.util.List;

import javagroup.prjApp.features.tasks.CommitDTO;

public interface IGitHubClient {
    List<CommitDTO> getCommits(String repo, String accessToken, String sinceDate);

    void checkConnection(String repo, String accessToken);
}
