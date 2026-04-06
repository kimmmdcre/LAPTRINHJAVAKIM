package JAVAGROUP.prjApp.adapter;

import JAVAGROUP.prjApp.dto.CommitDTO;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class GitHubAdapter implements IGitHubClient {

    private final WebClient webClient;

    public GitHubAdapter(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl("https://api.github.com").build();
    }

    @Override
    public List<CommitDTO> fetchCommits(String repo, String token, String since) {
        List<Map> rawCommits = webClient.get()
                .uri("/repos/{repo}/commits?since={since}", repo, since)
                .header("Authorization", "Bearer " + token)
                .header("Accept", "application/vnd.github+json")
                .retrieve()
                .bodyToFlux(Map.class)
                .collectList()
                .block();

        List<CommitDTO> result = new ArrayList<>();
        if (rawCommits == null) return result;

        for (Map raw : rawCommits) {
            String sha = (String) raw.get("sha");
            Map commitMap = (Map) raw.get("commit");
            String message = commitMap != null ? (String) commitMap.get("message") : "";
            CommitDTO dto = new CommitDTO(sha, message, LocalDateTime.now(), null);
            result.add(dto);
        }
        return result;
    }
}
