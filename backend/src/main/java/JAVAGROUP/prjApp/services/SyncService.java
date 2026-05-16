package javagroup.prjApp.services;

import java.util.UUID;

public interface SyncService {
    void syncJira(UUID groupId);

    void syncGithub(UUID groupId);

    int mapTasksToCommits(UUID groupId);

    void syncFull(UUID groupId);
}
