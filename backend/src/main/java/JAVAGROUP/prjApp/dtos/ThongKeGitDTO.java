package JAVAGROUP.prjApp.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ThongKeGitDTO {
    private UUID idNhom;
    private int tongSoCommit;
    private Map<String, Integer> soCommitTheoSinhVien;
    
    // Thống kê nâng cao theo yêu cầu
    private Map<String, Double> chiSoTanSuat; // Độ đều đặn (0.0 - 1.0)
    private Map<String, Double> chiSoChatLuong; // Chất lượng thông điệp và mapping (0.0 - 1.0)
}
