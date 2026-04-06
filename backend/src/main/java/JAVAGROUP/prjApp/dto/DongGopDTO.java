package JAVAGROUP.prjApp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DongGopDTO {
    private UUID idSinhVien;
    private String tenSinhVien;
    private int soNhiemVuHoanThanh;
    private int soCommit;
}
