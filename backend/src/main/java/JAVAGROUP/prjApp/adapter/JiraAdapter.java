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

            Map<String, Object> response = webClient.get()
                    .uri(duongDan + "/rest/api/3/search?jql=project={key}", maDuAn)
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
                String tieuDe = fields != null ? (String) fields.get("summary") : "";
                String moTa = fields != null ? (String) fields.get("description") : "";
                
                String trangThai = "TODO";
                if (fields != null && fields.get("status") != null) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> statusMap = (Map<String, Object>) fields.get("status");
                    trangThai = statusMap.get("name").toString();
                }
                
                result.add(new YeuCauDTO(id, null, tieuDe, moTa, trangThai));
            }
            log.info("Đã lấy thành công {} yêu cầu từ Jira", result.size());
            return result;
        } catch (WebClientResponseException e) {
            log.error("Lỗi Jira API: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Lỗi kết nối Jira: " + e.getStatusCode().value());
        } catch (Exception e) {
            log.error("Lỗi bất ngờ khi lấy yêu cầu Jira", e);
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
