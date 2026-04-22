package JAVAGROUP.prjApp.adapter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import JAVAGROUP.prjApp.dtos.YeuCauDTO;

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
    public List<YeuCauDTO> layDanhSachYeuCau(String duongDan, String email, String maTruyCap, String maDuAn) {
        log.info("Đang lấy danh sách yêu cầu từ Jira: {} cho dự án: {}", duongDan, maDuAn);
        try {
            String auth = email + ":" + maTruyCap;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
 
            Map<String, Object> body = new HashMap<>();
            body.put("jql", "project='" + maDuAn + "'");
            body.put("fields", List.of("summary", "status", "description"));
 
            Map<String, Object> response = webClient.post()
                    .uri(duongDan + "/rest/api/3/search/jql")
                    .header("Authorization", "Basic " + encodedAuth)
                    .header("Accept", "application/json")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();

            log.info("Phản hồi thô từ Jira: {}", response);
            List<YeuCauDTO> result = new ArrayList<>();
            if (response == null) {
                log.warn("Jira trả về response NULL");
                return result;
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> issues = (List<Map<String, Object>>) response.get("issues");
            if (issues == null || issues.isEmpty()) {
                log.warn("Không tìm thấy issue nào trong phản hồi từ Jira.");
                return result;
            }

            for (Map<String, Object> issue : issues) {
                try {
                    String id = (String) issue.get("id");
                    String key = (String) issue.get("key"); // Lấy key kiểu JT-1
                    @SuppressWarnings("unchecked")
                    Map<String, Object> fields = (Map<String, Object>) issue.get("fields");
                    
                    String tieuDe = fields != null ? (String) fields.get("summary") : "No Title";
                    
                    // Jira API v3 Description là một Object (ADF), chúng ta sẽ lấy text đơn giản nếu có
                    String moTa = "";
                    Object rawDesc = fields != null ? fields.get("description") : null;
                    if (rawDesc instanceof String) {
                        moTa = (String) rawDesc;
                    } else if (rawDesc != null) {
                        moTa = "[Định dạng phức tạp]";
                    }

                    String trangThai = "TODO";
                    if (fields != null && fields.get("status") != null) {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> statusMap = (Map<String, Object>) fields.get("status");
                        trangThai = statusMap.get("name").toString();
                    }
                    
                    log.info("Tìm thấy Task: {} - {}", key, tieuDe);
                    result.add(new YeuCauDTO(key, null, tieuDe, moTa, trangThai));
                } catch (Exception e) {
                    log.warn("Bỏ qua 1 task do lỗi định dạng: {}", e.getMessage());
                }
            }
            log.info("Đã lấy thành công {} yêu cầu từ Jira", result.size());
            return result;
        } catch (WebClientResponseException e) {
            log.error("Lỗi Jira API: {} - Body: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Lỗi kết nối Jira: " + e.getStatusCode().value() + " - " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Lỗi bất ngờ khi lấy yêu cầu Jira: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi đồng bộ Jira: " + e.getMessage());
        }
    }

    @Override
    public void kiemTraKetNoi(String duongDan, String email, String maTruyCap, String maDuAn) {
        log.info("Đang kiểm tra kết nối Jira cho: {} (Dự án: {})", duongDan, maDuAn);
        try {
            String auth = email + ":" + maTruyCap;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());

            webClient.get()
                    .uri(duongDan + "/rest/api/3/project/{key}", maDuAn)
                    .header("Authorization", "Basic " + encodedAuth)
                    .header("Accept", "application/json")
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            log.info("Kiểm tra kết nối Jira thành công cho {}", maDuAn);
        } catch (WebClientResponseException e) {
            log.error("Lỗi test Jira: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 401) {
                throw new RuntimeException("Email hoặc API Token của Jira không chính xác.");
            } else if (e.getStatusCode().value() == 404) {
                throw new RuntimeException("Không tìm thấy Project Key '" + maDuAn + "' trên Jira của bạn.");
            } else if (e.getStatusCode().value() == 403) {
                throw new RuntimeException("Token không có quyền truy cập vào dự án này (Hãy kiểm tra lại quyền trong Jira).");
            }
            throw new RuntimeException("Lỗi kết nối Jira: " + e.getStatusCode().value());
        } catch (Exception e) {
            log.error("Lỗi test Jira bất ngờ", e);
            throw new RuntimeException("Lỗi hệ thống khi test Jira: " + e.getMessage());
        }
    }
}
