package JAVAGROUP.prjApp.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "COMMIT_VCS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommitVCS {

    @Id
    @Column(name = "sha", nullable = false)
    private String sha;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_nhiem_vu")
    private NhiemVu idNhiemVu;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sinh_vien")
    private SinhVien idSinhVien;

    @Column(name = "thong_diep")
    private String thongDiep;

    @Column(name = "thoi_gian")
    private LocalDateTime thoiGian;
}
