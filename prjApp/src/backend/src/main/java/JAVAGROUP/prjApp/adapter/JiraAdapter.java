package JAVAGROUP.prjApp.adapter;

import JAVAGROUP.prjApp.dto.YeuCauDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;

@Component
public class JiraAdapter implements IJiraClient {

    private static final Logger log = LoggerFactory.getLogger(JiraAdapter.class);
    private final WebClient webClient;

    public JiraAdapter(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    @Override
    public List<YeuCauDTO> fetchIssues(String url, String email, String token, String projectKey) {
        log.info("Fetching Jira issues from: {} for project: {}", url, projectKey);
        try {
            String auth = email + ":" + token;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());

            Map<String, Object> response = webClient.get()
                    .uri(url + "/rest/api/3/search?jql=project={key}", projectKey)
                    .header("Authorization", "Basic " + encodedAuth)
                    .header("Accept", "application/json")
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            List<YeuCauDTO> result = new ArrayList<>();
            if (response == null) return result;

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> issues = (List<Map<String, Object>>) response.get("issues");
            if (issues == null) return result;

            for (Map<String, Object> issue : issues) {
                String id = (String) issue.get("id");
                @SuppressWarnings("unchecked")
                Map<String, Object> fields = (Map<String, Object>) issue.get("fields");
                String summary = fields != null ? (String) fields.get("summary") : "";
                String description = fields != null ? (String) fields.get("description") : "";
                
                String statusName = "TODO";
                if (fields != null && fields.get("status") != null) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> statusMap = (Map<String, Object>) fields.get("status");
                    statusName = statusMap.get("name").toString();
                }
                
                result.add(new YeuCauDTO(id, null, summary, description, statusName));
            }
            log.info("Successfully fetched {} issues from Jira", result.size());
            return result;
        } catch (WebClientResponseException e) {
            log.error("Jira API error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Lỗi kết nối Jira: " + e.getStatusCode().value());
        } catch (Exception e) {
            log.error("Unexpected error fetching Jira issues", e);
            throw new RuntimeException("Lỗi đồng bộ Jira: " + e.getMessage());
        }
    }

    @Override
    public void testConnection(String url, String email, String token, String projectKey) {
        log.info("Testing Jira connection for: {} (Project: {})", url, projectKey);
        try {
            String auth = email + ":" + token;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());

            webClient.get()
                    .uri(url + "/rest/api/3/project/{key}", projectKey)
                    .header("Authorization", "Basic " + encodedAuth)
                    .header("Accept", "application/json")
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            log.info("Jira connection test successful for {}", projectKey);
        } catch (WebClientResponseException e) {
            log.error("Jira Test failed: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 401) {
                throw new RuntimeException("Email hoặc API Token của Jira không chính xác.");
            } else if (e.getStatusCode().value() == 404) {
                throw new RuntimeException("Không tìm thấy Project Key '" + projectKey + "' trên Jira của bạn.");
            } else if (e.getStatusCode().value() == 403) {
                throw new RuntimeException("Token không có quyền truy cập vào dự án này (Hãy kiểm tra lại quyền trong Jira).");
            }
            throw new RuntimeException("Lỗi kết nối Jira: " + e.getStatusCode().value());
        } catch (Exception e) {
            log.error("Unexpected Jira Test error", e);
            throw new RuntimeException("Lỗi hệ thống khi test Jira: " + e.getMessage());
        }
    }
}
