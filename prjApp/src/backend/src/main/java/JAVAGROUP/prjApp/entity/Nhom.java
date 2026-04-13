package JAVAGROUP.prjApp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "NHOM")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Nhom {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_nhom", updatable = false, nullable = false)
    private UUID idNhom;

    @Column(name = "ten_nhom", nullable = false, columnDefinition = "NVARCHAR(255)")
    private String tenNhom;

    @Column(name = "de_tai", columnDefinition = "NVARCHAR(MAX)")
    private String deTai;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_giang_vien")
    private GiangVien giangVien;

    @OneToMany(mappedBy = "nhom")
    private List<CauHinhTichHop> cauHinhTichHops;

    @OneToMany(mappedBy = "nhom")
    private List<YeuCau> yeuCaus;

    @OneToMany(mappedBy = "nhom")
    private List<ThanhVienNhom> thanhVienNhoms;
}
