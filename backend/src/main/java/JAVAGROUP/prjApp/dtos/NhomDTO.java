package JAVAGROUP.prjApp.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NhomDTO {
    private UUID idNhom;
    private String tenNhom;
    private String deTai;
    private String idGiangVien;
    private String tenGiangVien;
    private List<ThanhVienNhomDTO> thanhViens;
}
