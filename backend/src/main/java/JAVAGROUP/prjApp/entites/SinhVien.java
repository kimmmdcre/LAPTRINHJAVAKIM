package JAVAGROUP.prjApp.entites;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "SINH_VIEN")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SinhVien extends NguoiDung {

    @Column(name = "ma_sv", nullable = false, unique = true)
    private String maSv;

    @Column(name = "lop")
    private String lop;

    @OneToMany(mappedBy = "sinhVien")
    private List<ThanhVienNhom> thanhVienNhoms;
}
