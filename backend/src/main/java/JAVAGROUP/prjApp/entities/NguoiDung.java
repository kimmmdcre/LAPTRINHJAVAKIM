package JAVAGROUP.prjApp.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "NGUOI_DUNG")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public abstract class NguoiDung {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "username", nullable = false, unique = true)
    private String tenDangNhap;

    @Column(name = "password_hash", nullable = false)
    private String matKhauHash;

    @Column(name = "ho_ten", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String hoTen;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "trang_thai", nullable = false)
    private TrangThaiUser trangThai;

    @Column(name = "ma_vai_tro")
    private String maVaiTro;
}
