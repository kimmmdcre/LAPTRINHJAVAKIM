package JAVAGROUP.prjApp.service;

import JAVAGROUP.prjApp.dto.ThanhVienNhomDTO;
import JAVAGROUP.prjApp.entity.GithubCommit;
import JAVAGROUP.prjApp.entity.Nhom;
import JAVAGROUP.prjApp.entity.Task;
import JAVAGROUP.prjApp.repository.GithubCommitRepository;
import JAVAGROUP.prjApp.repository.NhomRepository;
import JAVAGROUP.prjApp.repository.TaskRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final NhomRepository nhomRepository;
    private final TaskRepository taskRepository;
    private final GithubCommitRepository githubCommitRepository;
    private final GroupService groupService;

    public ReportService(NhomRepository nhomRepository, TaskRepository taskRepository, 
                         GithubCommitRepository githubCommitRepository, GroupService groupService) {
        this.nhomRepository = nhomRepository;
        this.taskRepository = taskRepository;
        this.githubCommitRepository = githubCommitRepository;
        this.groupService = groupService;
    }

    public Map<String, Object> getGroupStats(UUID idNhom) {
        Nhom nhom = nhomRepository.findById(idNhom)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhóm: " + idNhom));

        List<Task> tasks = taskRepository.findByIdNhom(idNhom);
        long totalTasks = tasks.size();
        long completedTasks = tasks.stream().filter(t -> "DONE".equalsIgnoreCase(t.getStatus())).count();

        List<GithubCommit> commits = githubCommitRepository.findByIdNhom(idNhom);
        long totalCommits = commits.size();

        // Calculate contributions by member
        List<ThanhVienNhomDTO> members = groupService.layDanhSachThanhVien(idNhom);
        Map<String, Long> contributions = new HashMap<>();
        for (ThanhVienNhomDTO mem : members) {
            long count = commits.stream()
                    .filter(c -> c.getNguoiThucHien() != null && c.getNguoiThucHien().getId().equals(mem.getIdSinhVien()))
                    .count();
            contributions.put(mem.getHoTen(), count);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("tenNhom", nhom.getTenNhom());
        result.put("totalTasks", totalTasks);
        result.put("completedTasks", completedTasks);
        result.put("totalCommits", totalCommits);
        result.put("contributions", contributions);

        return result;
    }
}
