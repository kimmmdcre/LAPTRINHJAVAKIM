package JAVAGROUP.prjApp.dto;

import JAVAGROUP.prjApp.entity.TrangThaiUser;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private UUID id;
    private String username;
    private String hoTen;
    private String email;
    private TrangThaiUser trangThai;
    private String maVaiTro;
    private String password;
}
