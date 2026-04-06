package JAVAGROUP.prjApp.dto;

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
    private Map<String, Integer> commitPerSinhVien;
}
