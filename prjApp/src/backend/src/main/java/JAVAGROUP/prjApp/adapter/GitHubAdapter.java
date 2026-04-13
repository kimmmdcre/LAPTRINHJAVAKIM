package JAVAGROUP.prjApp.adapter;

import JAVAGROUP.prjApp.dto.CommitDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

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
    public List<CommitDTO> fetchCommits(String repoInput, String token, String since) {
        String repoPath = parseRepoPath(repoInput);
        log.info("Starting fetchCommits for repo: {}", repoPath);

        try {
            String uri = "/repos/" + repoPath + "/commits";
            if (since != null && !since.isEmpty()) {
                uri += "?since=" + since;
            }
            log.info("Calling GitHub API: https://api.github.com{}", uri);
            
            List<Map<String, Object>> rawCommits = webClient.get()
                    .uri(uri)
                    .header("Authorization", "token " + token)
                    .header("Accept", "application/vnd.github+json")
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                    .block();

            List<CommitDTO> result = new ArrayList<>();
            if (rawCommits == null) return result;

            for (Map<String, Object> raw : rawCommits) {
                String sha = (String) raw.get("sha");
                @SuppressWarnings("unchecked")
                Map<String, Object> commitInfo = (Map<String, Object>) raw.get("commit");
                if (commitInfo == null) continue;
                String message = (String) commitInfo.get("message");
                
                // Parse date if available
                LocalDateTime time = LocalDateTime.now();
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> author = (Map<String, Object>) commitInfo.get("author");
                    if (author != null && author.get("date") != null) {
                        time = ZonedDateTime.parse((String) author.get("date")).toLocalDateTime();
                    }
                } catch (Exception e) {
                    log.warn("Failed to parse commit date for {}: {}", sha, e.getMessage());
                }

                CommitDTO dto = new CommitDTO(sha, message != null ? message : "", time, null);
                result.add(dto);
            }
            log.info("Successfully fetched {} commits from GitHub", result.size());
            return result;

        } catch (WebClientResponseException e) {
            log.error("GitHub API error: {} {} - {}", e.getStatusCode(), e.getStatusText(), e.getResponseBodyAsString());
            throw new RuntimeException("Lỗi từ GitHub API: " + e.getStatusCode().value() + " - " + e.getStatusText());
        } catch (Exception e) {
            log.error("Unexpected error fetching GitHub commits: ", e);
            throw new RuntimeException("Lỗi hệ thống khi đồng bộ GitHub: " + e.getMessage());
        }
    }

    @Override
    public void testConnection(String repoInput, String token) {
        String repoPath = parseRepoPath(repoInput);
        log.info("Testing GitHub connection for: {}", repoPath);
        try {
            String uri = "/repos/" + repoPath;
            log.info("Testing GitHub connection at: https://api.github.com{}", uri);
            webClient.get()
                    .uri(uri)
                    .header("Authorization", "token " + token)
                    .header("Accept", "application/vnd.github+json")
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            log.info("GitHub connection test successful for {}", repoPath);
        } catch (WebClientResponseException e) {
            log.error("GitHub Test failed: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 404) {
                throw new RuntimeException("Không tìm thấy repository. Vui lòng kiểm tra lại tên repo (owner/repo).");
            } else if (e.getStatusCode().value() == 401) {
                throw new RuntimeException("Token GitHub không hợp lệ hoặc đã hết hạn.");
            }
            throw new RuntimeException("Lỗi kết nối GitHub: " + e.getStatusCode().value() + " - " + e.getStatusText());
        } catch (Exception e) {
            log.error("Unexpected GitHub Test error", e);
            throw new RuntimeException("Lỗi không xác định khi test GitHub: " + e.getMessage());
        }
    }

    private String parseRepoPath(String input) {
        if (input == null || input.isEmpty()) return "";
        // If input is a URL, extract the owner/repo part
        // Example: https://github.com/google/guava -> google/guava
        String path = input.replace("https://github.com/", "").replace("http://github.com/", "");
        if (path.endsWith("/")) {
            path = path.substring(0, path.length() - 1);
        }
        // Handle .git suffix
        if (path.endsWith(".git")) {
            path = path.substring(0, path.length() - 4);
        }
        return path;
    }
}
