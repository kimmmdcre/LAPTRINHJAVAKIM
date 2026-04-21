package JAVAGROUP.prjApp.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "CAU_HINH_TICH_HOP")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CauHinhTichHop {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_cau_hinh", updatable = false, nullable = false)
    private UUID idCauHinh;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_nhom")
    private Nhom nhom;

    @Column(name = "repo_url")
    private String repoUrl;

    @Column(name = "loai_nen_tang", nullable = false)
    private String loaiNenTang;

    @Column(name = "url")
    private String url;

    @Column(name = "api_token")
    private String apiToken;

    @Column(name = "email")
    private String email;

    @Column(name = "project_key")
    private String projectKey;

    @Column(name = "done_status_name")
    private String doneStatusName;
}
