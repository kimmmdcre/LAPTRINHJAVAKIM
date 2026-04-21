package JAVAGROUP.prjApp.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

import JAVAGROUP.prjApp.entities.TrangThaiUser;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private UUID id;
    private String tenDangNhap;
    private String hoTen;
    private String email;
    private TrangThaiUser trangThai;
    private String maVaiTro;
    private String matKhau;
}
