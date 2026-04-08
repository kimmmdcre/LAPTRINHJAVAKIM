package JAVAGROUP.prjApp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "YEU_CAU")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class YeuCau {

    @Id
    @Column(name = "id_yeu_cau", nullable = false)
    private String idYeuCau;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_nhom")
    private Nhom nhom;

    @Column(name = "tieu_de", nullable = false)
    private String tieuDe;

    @Column(name = "mo_ta", columnDefinition = "NVARCHAR(MAX)")
    private String moTa;

    @Column(name = "trang_thai", nullable = false)
    private String trangThai;

    @OneToMany(mappedBy = "yeuCau")
    private List<NhiemVu> nhiemVus;
}
