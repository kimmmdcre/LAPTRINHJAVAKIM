package JAVAGROUP.prjApp.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "GIANG_VIEN")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GiangVien extends NguoiDung {

    @Column(name = "ma_giang_vien", nullable = false, unique = true)
    private String maGiangVien;

    @Column(name = "khoa")
    private String khoa;

    @OneToMany(mappedBy = "giangVien")
    private List<Nhom> nhoms;
}
