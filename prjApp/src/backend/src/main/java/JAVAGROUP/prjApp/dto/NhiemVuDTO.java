package JAVAGROUP.prjApp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NhiemVuDTO {
    private String idNhiemVu;
    private String idYeuCau;
    private UUID idSinhVien;
    private String tenSinhVien;
    private String tieuDe;
    private String trangThai;
    private int commitCount;
}
