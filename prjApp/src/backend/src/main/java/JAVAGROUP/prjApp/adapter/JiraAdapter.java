package JAVAGROUP.prjApp.adapter;

import JAVAGROUP.prjApp.dto.YeuCauDTO;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class JiraAdapter implements IJiraClient {

    private final WebClient webClient;

    public JiraAdapter(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    @Override
    public List<YeuCauDTO> fetchIssues(String url, String token, String projectKey) {
        Map response = webClient.get()
                .uri(url + "/rest/api/3/search?jql=project={key}", projectKey)
                .header("Authorization", "Bearer " + token)
                .header("Accept", "application/json")
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        List<YeuCauDTO> result = new ArrayList<>();
        if (response == null) return result;

        List<Map> issues = (List<Map>) response.get("issues");
        if (issues == null) return result;

        for (Map issue : issues) {
            String id = (String) issue.get("id");
            Map fields = (Map) issue.get("fields");
            String summary = fields != null ? (String) fields.get("summary") : "";
            String description = fields != null ? (String) fields.get("description") : "";
            String status = fields != null
                    ? ((Map) fields.getOrDefault("status", Map.of())).getOrDefault("name", "TODO").toString()
                    : "TODO";
            result.add(new YeuCauDTO(id, null, summary, description, status));
        }
        return result;
    }
}
