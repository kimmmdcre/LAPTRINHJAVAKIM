package JAVAGROUP.prjApp.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommitDTO {
    private String sha;
    private String thongDiep;
    private LocalDateTime thoiGian;
    private UUID idTacGia;
    private String idYeuCau;
    private String tieuDeYeuCau;
}
