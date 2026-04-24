package JAVAGROUP.prjApp.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommitDTO {
    private String sha;
    private String thongDiep;
    private LocalDateTime thoiGian;
    private String idYeuCau;
    private String tieuDeYeuCau;
    private String authorName;
    private String authorEmail;

    // Manual constructor for 6 arguments used in GitHubAdapter
    public CommitDTO(String sha, String thongDiep, LocalDateTime thoiGian, String idYeuCau, String tieuDeYeuCau, String authorName) {
        this.sha = sha;
        this.thongDiep = thongDiep;
        this.thoiGian = thoiGian;
        this.idYeuCau = idYeuCau;
        this.tieuDeYeuCau = tieuDeYeuCau;
        this.authorName = authorName;
    }
}
