package JAVAGROUP.prjApp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "NHIEM_VU")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NhiemVu {

    @Id
    @Column(name = "id_nhiem_vu", nullable = false)
    private String idNhiemVu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_yeu_cau")
    private YeuCau yeuCau;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sinh_vien")
    private SinhVien sinhVien;

    @Column(name = "tieu_de", nullable = false)
    private String tieuDe;

    @Column(name = "trang_thai")
    private String trangThai;

    @Column(name = "thoi_gian_cap_nhat")
    private java.time.LocalDateTime thoiGianCapNhat;

    @OneToMany(mappedBy = "nhiemVu")
    private List<CommitVCS> commitVCSs;
}
