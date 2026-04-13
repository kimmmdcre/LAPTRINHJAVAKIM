package JAVAGROUP.prjApp.controllers;

import JAVAGROUP.prjApp.dtos.DongGopDTO;
import JAVAGROUP.prjApp.dtos.ThongKeGitDTO;
import JAVAGROUP.prjApp.dtos.TienDoDTO;
import JAVAGROUP.prjApp.services.ReportService;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * GET /api/reports/{idNhom}/progress
     * Xem tiến độ dự án: tổng nhiệm vụ, hoàn thành, % tiến độ
     */
    @GetMapping("/{idNhom}/progress")
    public ResponseEntity<TienDoDTO> xemTienDo(@PathVariable UUID idNhom) {
        return ResponseEntity.ok(reportService.xemTienDoDuAn(idNhom));
    }

    /**
     * GET /api/reports/{idNhom}/commits
     * Thống kê số commit GitHub của nhóm
     */
    @GetMapping("/{idNhom}/commits")
    public ResponseEntity<ThongKeGitDTO> thongKeGithub(@PathVariable UUID idNhom) {
        return ResponseEntity.ok(reportService.thongKeGithub(idNhom));
    }

    /**
     * GET /api/reports/{idNhom}/contributions
     * Xem đóng góp cá nhân của từng sinh viên trong nhóm
     */
    @GetMapping("/{idNhom}/contributions")
    public ResponseEntity<List<DongGopDTO>> xemDongGop(@PathVariable UUID idNhom) {
        return ResponseEntity.ok(reportService.xemDongGopCaNhan(idNhom));
    }

    /**
     * GET /api/reports/{idNhom}/history
     * Lấy lịch sử biến động tiến độ phục vụ biểu đồ AreaChart
     */
    @GetMapping("/{idNhom}/history")
    public ResponseEntity<List<java.util.Map<String, Object>>> xemLichSuTienDo(@PathVariable UUID idNhom) {
        return ResponseEntity.ok(reportService.xemLichSuTienDo(idNhom));
    }

    /**
     * GET /api/reports/{idNhom}/commits/history
     * Lấy lịch sử commit của cả nhóm để vẽ Heatmap
     */
    @GetMapping("/{idNhom}/commits/history")
    public ResponseEntity<List<java.util.Map<String, Object>>> xemLichSuCommitNhom(@PathVariable UUID idNhom) {
        return ResponseEntity.ok(reportService.xemLichSuCommitNhom(idNhom));
    }

    /**
     * GET /api/reports/personal/{idSinhVien}/history
     * Lấy lịch sử commit cá nhân để vẽ biểu đồ line/area
     */
    @GetMapping("/personal/{idSinhVien}/history")
    public ResponseEntity<List<java.util.Map<String, Object>>> xemLichSuCommitCaNhan(@PathVariable UUID idSinhVien) {
        return ResponseEntity.ok(reportService.xemLichSuCommitCaNhan(idSinhVien));
    }

    /**
     * GET /api/reports/{idNhom}/export
     * Xuất báo cáo tổng hợp dưới dạng file CSV
     */
    @GetMapping("/{idNhom}/export")
    public ResponseEntity<Resource> xuatBaoCao(@PathVariable UUID idNhom) {
        Resource file = reportService.xuatBaoCaoTongHop(idNhom);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"bao-cao-nhom-" + idNhom + ".csv\"")
                .body(file);
    }

    @GetMapping("/{idNhom}/export/docx")
    public ResponseEntity<Resource> xuatBaoCaoDocx(@PathVariable UUID idNhom) throws java.io.IOException {
        Resource file = reportService.xuatBaoCaoDocx(idNhom);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"bao-cao-" + idNhom + ".docx\"")
                .body(file);
    }

    @GetMapping("/{idNhom}/export/pdf")
    public ResponseEntity<Resource> xuatBaoCaoPdf(@PathVariable UUID idNhom) {
        Resource file = reportService.xuatBaoCaoPdf(idNhom);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/pdf"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"bao-cao-" + idNhom + ".pdf\"")
                .body(file);
    }
}
