package JAVAGROUP.prjApp.service;

import JAVAGROUP.prjApp.entity.CauHinhTichHop;
import JAVAGROUP.prjApp.entity.Nhom;
import JAVAGROUP.prjApp.repository.CauHinhTichHopRepository;
import JAVAGROUP.prjApp.repository.NhomRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ConfigService {

    private final CauHinhTichHopRepository cauHinhTichHopRepository;
    private final NhomRepository nhomRepository;

    public ConfigService(CauHinhTichHopRepository cauHinhTichHopRepository, NhomRepository nhomRepository) {
        this.cauHinhTichHopRepository = cauHinhTichHopRepository;
        this.nhomRepository = nhomRepository;
    }

    public void cauHinhJira(UUID idNhom, String url, String email, String token, String projectKey, String doneStatus) {
        Nhom nhom = nhomRepository.findById(idNhom)
                .orElseThrow(() -> new RuntimeException("Nhóm không tồn tại: " + idNhom));
        
        // Find existing or create new
        CauHinhTichHop conf = cauHinhTichHopRepository.findByNhom_IdNhom(idNhom)
                .stream().filter(c -> "JIRA".equals(c.getLoaiNenTang())).findFirst()
                .orElse(new CauHinhTichHop());
                
        conf.setNhom(nhom);
        conf.setLoaiNenTang("JIRA");
        conf.setUrl(url);
        conf.setEmail(email);
        conf.setApiToken(token);
        conf.setProjectKey(projectKey);
        conf.setDoneStatusName(doneStatus);
        cauHinhTichHopRepository.save(conf);
    }

    public void cauHinhGithub(UUID idNhom, String repo, String token, String since) {
        Nhom nhom = nhomRepository.findById(idNhom)
                .orElseThrow(() -> new RuntimeException("Nhóm không tồn tại: " + idNhom));
        
        CauHinhTichHop conf = cauHinhTichHopRepository.findByNhom_IdNhom(idNhom)
                .stream().filter(c -> "GITHUB".equals(c.getLoaiNenTang())).findFirst()
                .orElse(new CauHinhTichHop());

        conf.setNhom(nhom);
        conf.setLoaiNenTang("GITHUB");
        conf.setRepoUrl(repo);
        conf.setApiToken(token);
        cauHinhTichHopRepository.save(conf);
    }

    public List<CauHinhTichHop> getConfigsByNhom(UUID idNhom) {
        return cauHinhTichHopRepository.findByNhom_IdNhom(idNhom);
    }
}
