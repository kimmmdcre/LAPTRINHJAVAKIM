package JAVAGROUP.prjApp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "THANH_VIEN_NHOM")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ThanhVienNhom {

    @EmbeddedId
    private ThanhVienNhomId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idNhom")
    @JoinColumn(name = "id_nhom")
    private Nhom nhom;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idSinhVien")
    @JoinColumn(name = "id_sinh_vien")
    private SinhVien sinhVien;

    @Enumerated(EnumType.STRING)
    @Column(name = "vai_tro", nullable = false)
    private VaiTroNhom vaiTro;
}
