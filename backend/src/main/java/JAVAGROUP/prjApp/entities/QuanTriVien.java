package JAVAGROUP.prjApp.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "QUAN_TRI_VIEN")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuanTriVien extends NguoiDung {

    @Column(name = "ma_gv", nullable = false, unique = true)
    private String maGv;

    @Column(name = "cap_do_quyen")
    private Integer capDoQuyen;
}
