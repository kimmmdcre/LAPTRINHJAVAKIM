package JAVAGROUP.prjApp.controllers;

import JAVAGROUP.prjApp.dtos.NhomDTO;
import JAVAGROUP.prjApp.dtos.ThanhVienNhomDTO;
import JAVAGROUP.prjApp.entites.Nhom;
import JAVAGROUP.prjApp.services.GroupService;

import org.springframework.http.ResponseEntity;
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

    /**
     * POST /api/groups
     * Body: NhomDTO (tạo nhóm mới)
     */
    @PostMapping
    public ResponseEntity<NhomDTO> taoNhom(@RequestBody NhomDTO dto) {
        Nhom nhom = groupService.taoNhom(dto);
        return ResponseEntity.ok(groupService.xemThongTinNhom(nhom.getIdNhom()));
    }

    /**
     * DELETE /api/groups/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> xoaNhom(@PathVariable UUID id) {
        groupService.xoaNhom(id);
        return ResponseEntity.ok(Map.of("message", "Xoá nhóm thành công"));
    }

    /**
     * PATCH /api/groups/{id}/assign
     * Body: { "idGiangVien": "..." }
     * Phân công giảng viên phụ trách nhóm
     */
    @PatchMapping("/{id}/assign")
    public ResponseEntity<Map<String, String>> phanCongGiangVien(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        groupService.phanCongGiangVien(id, UUID.fromString(body.get("idGiangVien")));
        return ResponseEntity.ok(Map.of("message", "Phân công giảng viên thành công"));
    }

    /**
     * GET /api/groups
     * GET /api/groups?idGiangVien={uuid}
     * Lấy danh sách nhóm (tất cả hoặc theo giảng viên)
     */
    @GetMapping
    public ResponseEntity<java.util.List<NhomDTO>> layDanhSachNhom(
            @RequestParam(required = false) UUID idGiangVien) {
        return ResponseEntity.ok(groupService.layDanhSachNhom(idGiangVien));
    }

    /**
     * GET /api/groups/{id}
     * Xem thông tin chi tiết một nhóm
     */
    @GetMapping("/{id}")
    public ResponseEntity<NhomDTO> xemThongTinNhom(@PathVariable UUID id) {
        return ResponseEntity.ok(groupService.xemThongTinNhom(id));
    }

    /**
     * GET /api/groups/{id}/members
     * Lấy danh sách thành viên của nhóm
     */
    @GetMapping("/{id}/members")
    public ResponseEntity<List<ThanhVienNhomDTO>> layDanhSachThanhVien(@PathVariable UUID id) {
        return ResponseEntity.ok(groupService.layDanhSachThanhVien(id));
    }

    /**
     * POST /api/groups/{idNhom}/members/{idSinhVien}
     * Thêm sinh viên vào nhóm
     */
    @PostMapping("/{idNhom}/members/{idSinhVien}")
    public ResponseEntity<Map<String, String>> themThanhVien(
            @PathVariable UUID idNhom,
            @PathVariable UUID idSinhVien) {
        groupService.themThanhVien(idNhom, idSinhVien);
        return ResponseEntity.ok(Map.of("message", "Thêm thành viên thành công"));
    }

    /**
     * DELETE /api/groups/members/{idSinhVien}
     * Loại bỏ sinh viên khỏi nhóm hiện tại
     */
    @DeleteMapping("/members/{idSinhVien}")
    public ResponseEntity<Map<String, String>> boThanhVien(@PathVariable UUID idSinhVien) {
        groupService.boThanhVien(idSinhVien);
        return ResponseEntity.ok(Map.of("message", "Đã loại bỏ sinh viên khỏi nhóm"));
    }
}
