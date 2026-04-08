package JAVAGROUP.prjApp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {

    @NotBlank
    private String username;

    @NotBlank
    private String password;

    @NotBlank
    private String hoTen;

    @NotBlank
    @Email
    private String email;

    /** QUAN_TRI_VIEN | GIANG_VIEN | SINH_VIEN | TRUONG_NHOM | THANH_VIEN */
    @NotBlank
    private String maVaiTro;

    /**
     * Mã định danh theo loại: ma_sv (sinh viên), ma_giang_vien, hoặc ma quản trị (QTVxxx).
     * Bắt buộc với sinh viên / giảng viên; với quản trị viên có thể để trống (hệ thống gán mặc định).
     */
    private String maSo;

    private String lop;
    private String khoa;
}
