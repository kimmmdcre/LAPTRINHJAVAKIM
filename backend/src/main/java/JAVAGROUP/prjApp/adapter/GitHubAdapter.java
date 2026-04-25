package JAVAGROUP.prjApp.adapter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import JAVAGROUP.prjApp.dtos.CommitDTO;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class GitHubAdapter implements IGitHubClient {

    private static final Logger log = LoggerFactory.getLogger(GitHubAdapter.class);
    private final WebClient webClient;

    public GitHubAdapter(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://api.github.com").build();
    }

    @Override
    public List<CommitDTO> getCommits(String repoInput, String accessToken, String sinceDate) {
        String repoPath = parseRepoPath(repoInput);
        log.info("Starting getCommits for repo: {}", repoPath);

        try {
            if (accessToken != null) {
                accessToken = accessToken.trim();
            }
            String uri = "/repos/" + repoPath + "/commits";
            if (sinceDate != null && !sinceDate.isEmpty()) {
                uri += "?since=" + sinceDate;
            }
            log.info("--------------------------------------------------");
            log.info("CALLING GITHUB API: https://api.github.com{}", uri);
            if (accessToken != null && accessToken.length() > 6) {
                log.info("Using Token (first 6 chars): {}...", accessToken.substring(0, 6));
            } else {
                log.warn("WARNING: Token is empty or too short!");
            }
            log.info("--------------------------------------------------");
 
            List<Map<String, Object>> rawCommits = webClient.get()
                    .uri(uri)
                    .header("Authorization", "token " + accessToken)
                    .header("Accept", "application/vnd.github+json")
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                    .block();

            log.info("GitHub response: found {} commits", rawCommits != null ? rawCommits.size() : 0);

            List<CommitDTO> result = new ArrayList<>();
            if (rawCommits == null) return result;

            for (Map<String, Object> raw : rawCommits) {
                String sha = (String) raw.get("sha");
                @SuppressWarnings("unchecked")
                Map<String, Object> commitInfo = (Map<String, Object>) raw.get("commit");
                if (commitInfo == null) continue;
                String message = (String) commitInfo.get("message");
                
                LocalDateTime commitTime = LocalDateTime.now();
                String authorName = null;
                String authorEmail = null;
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> author = (Map<String, Object>) commitInfo.get("author");
                    if (author != null) {
                        if (author.get("date") != null) {
                            commitTime = ZonedDateTime.parse((String) author.get("date")).toLocalDateTime();
                        }
                        authorName = (String) author.get("name");
                        authorEmail = (String) author.get("email");
                    }
                } catch (Exception e) {
                    log.warn("Error parsing commit author info for {}: {}", sha, e.getMessage());
                }

                CommitDTO dto = new CommitDTO(sha, message != null ? message : "", commitTime, null, null, authorName, authorEmail);
                result.add(dto);
            }
            log.info("Successfully fetched {} commits from GitHub", result.size());
            return result;

        } catch (WebClientResponseException e) {
            log.error("GitHub API error: {} {} - {}", e.getStatusCode(), e.getStatusText(), e.getResponseBodyAsString());
            throw new RuntimeException("GitHub API error: " + e.getStatusCode().value() + " - " + e.getStatusText());
        } catch (Exception e) {
            log.error("Unexpected error fetching GitHub commits: ", e);
            throw new RuntimeException("System error during GitHub sync: " + e.getMessage());
        }
    }

    @Override
    public void checkConnection(String repoInput, String accessToken) {
        String repoPath = parseRepoPath(repoInput);
        log.info("Checking GitHub connection for: {}", repoPath);
        try {
            String uri = "/repos/" + repoPath;
            log.info("Testing GitHub connection at: https://api.github.com{}", uri);
            webClient.get()
                    .uri(uri)
                    .header("Authorization", "token " + accessToken)
                    .header("Accept", "application/vnd.github+json")
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            log.info("GitHub connection check successful for {}", repoPath);
        } catch (WebClientResponseException e) {
            log.error("GitHub test error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 404) {
                throw new RuntimeException("Repository not found. Please check repo name (owner/repo).");
            } else if (e.getStatusCode().value() == 401) {
                throw new RuntimeException("Invalid or expired GitHub token.");
            }
            throw new RuntimeException("GitHub connection error: " + e.getStatusCode().value() + " - " + e.getStatusText());
        } catch (Exception e) {
            log.error("Unexpected GitHub test error", e);
            throw new RuntimeException("Unknown error during GitHub test: " + e.getMessage());
        }
    }

    private String parseRepoPath(String input) {
        if (input == null || input.isEmpty()) return "";
        String path = input.replace("https://github.com/", "").replace("http://github.com/", "");
        if (path.endsWith("/")) {
            path = path.substring(0, path.length() - 1);
        }
        if (path.endsWith(".git")) {
            path = path.substring(0, path.length() - 4);
        }
        return path;
    }
}
