package javagroup.prjApp.adapter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import javagroup.prjApp.dtos.RequirementDTO;

import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
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
    public List<RequirementDTO> getRequirements(String url, String email, String accessToken, String projectKey) {
        log.info("Fetching requirements from Jira: {} for project: {}", url, projectKey);
        try {
            String auth = email + ":" + accessToken;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
 
            Map<String, Object> body = new HashMap<>();
            body.put("jql", "project='" + projectKey + "'");
            body.put("fields", List.of("summary", "status", "description"));
 
            Map<String, Object> response = webClient.post()
                    .uri(url + "/rest/api/3/search/jql")
                    .header("Authorization", "Basic " + encodedAuth)
                    .header("Accept", "application/json")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            List<RequirementDTO> result = new ArrayList<>();
            if (response == null) {
                log.warn("Jira returned NULL response");
                return result;
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> issues = (List<Map<String, Object>>) response.get("issues");
            if (issues == null || issues.isEmpty()) {
                log.warn("No issues found in Jira response.");
                return result;
            }

            for (Map<String, Object> issue : issues) {
                try {
                    String key = (String) issue.get("key"); 
                    @SuppressWarnings("unchecked")
                    Map<String, Object> fields = (Map<String, Object>) issue.get("fields");
                    
                    String title = fields != null ? (String) fields.get("summary") : "No Title";
                    
                    String description = "";
                    Object rawDesc = fields != null ? fields.get("description") : null;
                    if (rawDesc instanceof String) {
                        description = (String) rawDesc;
                    } else if (rawDesc != null) {
                        description = "[Complex Format]";
                    }

                    String status = "TODO";
                    if (fields != null && fields.get("status") != null) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> statusMap = (Map<String, Object>) fields.get("status");
                        status = statusMap.get("name").toString();
                    }
                    
                    RequirementDTO dto = new RequirementDTO();
                    dto.setJiraKey(key);
                    dto.setTitle(title);
                    dto.setDescription(description);
                    dto.setStatus(status);
                    
                    result.add(dto);
                } catch (Exception e) {
                    log.warn("Skipping a task due to format error: {}", e.getMessage());
                }
            }
            log.info("Successfully fetched {} requirements from Jira", result.size());
            return result;
        } catch (WebClientResponseException e) {
            log.error("Jira API error: {} - Body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Jira connection error: " + e.getStatusCode().value());
        } catch (Exception e) {
            log.error("Unexpected error fetching Jira requirements: {}", e.getMessage(), e);
            throw new RuntimeException("Jira sync error: " + e.getMessage());
        }
    }

    @Override
    public void checkConnection(String url, String email, String accessToken, String projectKey) {
        log.info("Checking Jira connection for: {} (Project: {})", url, projectKey);
        try {
            String auth = email + ":" + accessToken;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());

            webClient.get()
                    .uri(url + "/rest/api/3/project/{key}", projectKey)
                    .header("Authorization", "Basic " + encodedAuth)
                    .header("Accept", "application/json")
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            log.info("Jira connection check successful for {}", projectKey);
        } catch (WebClientResponseException e) {
            log.error("Jira test error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 401) {
                throw new RuntimeException("Incorrect Jira email or API Token.");
            } else if (e.getStatusCode().value() == 404) {
                throw new RuntimeException("Project Key '" + projectKey + "' not found.");
            }
            throw new RuntimeException("Jira connection error: " + e.getStatusCode().value());
        } catch (Exception e) {
            log.error("Unexpected Jira test error", e);
            throw new RuntimeException("System error testing Jira: " + e.getMessage());
        }
    }
}
