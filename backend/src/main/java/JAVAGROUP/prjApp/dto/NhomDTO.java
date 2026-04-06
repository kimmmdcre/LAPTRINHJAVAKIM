package JAVAGROUP.prjApp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NhomDTO {
    private UUID idNhom;
    private String tenNhom;
    private String deTai;
    private String idGiangVien;
    private String tenGiangVien;
}
