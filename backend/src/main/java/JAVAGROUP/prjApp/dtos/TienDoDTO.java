package JAVAGROUP.prjApp.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TienDoDTO {
    private UUID idNhom;
    private int tongSoNhiemVu;
    private int nhiemVuHoanThanh;
    private double phanTramTienDo;
}
