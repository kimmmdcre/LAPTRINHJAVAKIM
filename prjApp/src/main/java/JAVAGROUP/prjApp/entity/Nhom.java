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

    @Column(name = "ten_nhom", nullable = false)
    private String tenNhom;

    @Column(name = "de_tai")
    private String deTai;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_giang_vien")
    private GiangVien idGiangVien;

    @OneToMany(mappedBy = "idNhom")
    private List<CauHinhTichHop> cauHinhTichHops;

    @OneToMany(mappedBy = "idNhom")
    private List<YeuCau> yeuCaus;

    @OneToMany(mappedBy = "idNhom")
    private List<ThanhVienNhom> thanhVienNhoms;
}
