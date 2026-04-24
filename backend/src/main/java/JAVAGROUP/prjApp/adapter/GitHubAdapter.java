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
    public List<CommitDTO> layDanhSachCommit(String repoDauVao, String maTruyCap, String tuNgay) {
        String repoPath = parseRepoPath(repoDauVao);
        log.info("Bắt đầu layDanhSachCommit cho repo: {}", repoPath);

        try {
            if (maTruyCap != null) {
                maTruyCap = maTruyCap.trim();
            }
            String uri = "/repos/" + repoPath + "/commits";
            if (tuNgay != null && !tuNgay.isEmpty()) {
                uri += "?since=" + tuNgay;
            }
            log.info("--------------------------------------------------");
            log.info("ĐANG GỌI GITHUB API: https://api.github.com{}", uri);
            if (maTruyCap != null && maTruyCap.length() > 6) {
                log.info("Sử dụng Token (6 ký tự đầu): {}...", maTruyCap.substring(0, 6));
            } else {
                log.warn("CẢNH BÁO: Token trống hoặc quá ngắn!");
            }
            log.info("--------------------------------------------------");
 
            List<Map<String, Object>> rawCommits = webClient.get()
                    .uri(uri)
                    .header("Authorization", "token " + maTruyCap)
                    .header("Accept", "application/vnd.github+json")
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                    .block();

            log.info("Phản hồi từ GitHub: đã tìm thấy {} commits", rawCommits != null ? rawCommits.size() : 0);

            List<CommitDTO> result = new ArrayList<>();
            if (rawCommits == null) return result;

            for (Map<String, Object> raw : rawCommits) {
                String sha = (String) raw.get("sha");
                @SuppressWarnings("unchecked")
                Map<String, Object> commitInfo = (Map<String, Object>) raw.get("commit");
                if (commitInfo == null) continue;
                String thongDiep = (String) commitInfo.get("message");
                
                // Parse date and author info if available
                LocalDateTime thoiGian = LocalDateTime.now();
                String authorName = null;
                String authorEmail = null;
                try {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> author = (Map<String, Object>) commitInfo.get("author");
                    if (author != null) {
                        if (author.get("date") != null) {
                            thoiGian = ZonedDateTime.parse((String) author.get("date")).toLocalDateTime();
                        }
                        authorName = (String) author.get("name");
                        authorEmail = (String) author.get("email");
                    }
                } catch (Exception e) {
                    log.warn("Lỗi phân tích thông tin tác giả commit cho {}: {}", sha, e.getMessage());
                }

                CommitDTO dto = new CommitDTO(sha, thongDiep != null ? thongDiep : "", thoiGian, null, null, authorName, authorEmail);
                result.add(dto);
            }
            log.info("Đã lấy thành công {} commits từ GitHub", result.size());
            return result;

        } catch (WebClientResponseException e) {
            log.error("Lỗi GitHub API: {} {} - {}", e.getStatusCode(), e.getStatusText(), e.getResponseBodyAsString());
            throw new RuntimeException("Lỗi từ GitHub API: " + e.getStatusCode().value() + " - " + e.getStatusText());
        } catch (Exception e) {
            log.error("Lỗi bất ngờ khi lấy commit GitHub: ", e);
            throw new RuntimeException("Lỗi hệ thống khi đồng bộ GitHub: " + e.getMessage());
        }
    }

    @Override
    public void kiemTraKetNoi(String repoDauVao, String maTruyCap) {
        String repoPath = parseRepoPath(repoDauVao);
        log.info("Đang kiểm tra kết nối GitHub cho: {}", repoPath);
        try {
            String uri = "/repos/" + repoPath;
            log.info("Đang test kết nối GitHub tại: https://api.github.com{}", uri);
            webClient.get()
                    .uri(uri)
                    .header("Authorization", "token " + maTruyCap)
                    .header("Accept", "application/vnd.github+json")
                    .retrieve()
                    .toBodilessEntity()
                    .block();
            log.info("Kiểm tra kết nối GitHub thành công cho {}", repoPath);
        } catch (WebClientResponseException e) {
            log.error("Lỗi test GitHub: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            if (e.getStatusCode().value() == 404) {
                throw new RuntimeException("Không tìm thấy repository. Vui lòng kiểm tra lại tên repo (owner/repo).");
            } else if (e.getStatusCode().value() == 401) {
                throw new RuntimeException("Token GitHub không hợp lệ hoặc đã hết hạn.");
            }
            throw new RuntimeException("Lỗi kết nối GitHub: " + e.getStatusCode().value() + " - " + e.getStatusText());
        } catch (Exception e) {
            log.error("Lỗi test GitHub bất ngờ", e);
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
