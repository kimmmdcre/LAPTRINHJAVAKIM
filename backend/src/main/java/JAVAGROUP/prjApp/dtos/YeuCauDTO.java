package JAVAGROUP.prjApp.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class YeuCauDTO {
    private String idYeuCau;
    private UUID idNhom;
    private String tieuDe;
    private String moTa;
    private String trangThai;
}
