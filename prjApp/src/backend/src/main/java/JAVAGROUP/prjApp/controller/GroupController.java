package JAVAGROUP.prjApp.controller;

import JAVAGROUP.prjApp.dto.NhomDTO;
import JAVAGROUP.prjApp.dto.ThanhVienNhomDTO;
import JAVAGROUP.prjApp.entity.Nhom;
import JAVAGROUP.prjApp.entity.VaiTroNhom;
import JAVAGROUP.prjApp.service.GroupService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','TRUONG_NHOM')")
    public ResponseEntity<NhomDTO> taoNhom(@RequestBody NhomDTO dto) {
        Nhom nhom = groupService.taoNhom(dto);
        return ResponseEntity.ok(groupService.xemThongTinNhom(nhom.getIdNhom()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TRUONG_NHOM')")
    public ResponseEntity<Map<String, String>> xoaNhom(@PathVariable UUID id) {
        groupService.xoaNhom(id);
        return ResponseEntity.ok(Map.of("message", "Xoá nhóm thành công"));
    }

    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> phanCongGiangVien(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        groupService.phanCongGiangVien(id, UUID.fromString(body.get("idGiangVien")));
        return ResponseEntity.ok(Map.of("message", "Phân công giảng viên thành công"));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NhomDTO>> layDanhSachNhom(@RequestParam UUID idGiangVien) {
        return ResponseEntity.ok(groupService.layDanhSachNhom(idGiangVien));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NhomDTO> xemThongTinNhom(@PathVariable UUID id) {
        return ResponseEntity.ok(groupService.xemThongTinNhom(id));
    }

    @GetMapping("/{id}/members")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ThanhVienNhomDTO>> layDanhSachThanhVien(@PathVariable UUID id) {
        return ResponseEntity.ok(groupService.layDanhSachThanhVien(id));
    }

    /**
     * Thêm sinh viên vào nhóm. Body: { "idSinhVien": "uuid", "vaiTro": "LEADER" | "MEMBER" }
     */
    @PostMapping("/{id}/members")
    @PreAuthorize("hasAnyRole('ADMIN','TRUONG_NHOM')")
    public ResponseEntity<Map<String, String>> themThanhVien(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        UUID sid = UUID.fromString(body.get("idSinhVien"));
        VaiTroNhom vt;
        try {
            vt = VaiTroNhom.valueOf(body.getOrDefault("vaiTro", "MEMBER").toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("vaiTro phải là LEADER hoặc MEMBER.");
        }
        groupService.themThanhVien(id, sid, vt);
        return ResponseEntity.ok(Map.of("message", "Đã thêm thành viên"));
    }

    @DeleteMapping("/{id}/members/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN','TRUONG_NHOM')")
    public ResponseEntity<Map<String, String>> xoaThanhVien(
            @PathVariable UUID id,
            @PathVariable UUID studentId) {
        groupService.xoaThanhVien(id, studentId);
        return ResponseEntity.ok(Map.of("message", "Đã xóa thành viên"));
    }
}
