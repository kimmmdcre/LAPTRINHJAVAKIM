package JAVAGROUP.prjApp.services;

import JAVAGROUP.prjApp.dtos.DongGopDTO;
import JAVAGROUP.prjApp.dtos.ThongKeGitDTO;
import JAVAGROUP.prjApp.dtos.TienDoDTO;
import JAVAGROUP.prjApp.entities.CommitVCS;
import JAVAGROUP.prjApp.entities.NhiemVu;
import JAVAGROUP.prjApp.entities.SinhVien;
import JAVAGROUP.prjApp.entities.YeuCau;
import JAVAGROUP.prjApp.repositories.CommitVCSRepository;
import JAVAGROUP.prjApp.repositories.NhiemVuRepository;
import JAVAGROUP.prjApp.repositories.ThanhVienNhomRepository;
import JAVAGROUP.prjApp.repositories.YeuCauRepository;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.apache.poi.xwpf.usermodel.*;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.PdfPTable;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@org.springframework.transaction.annotation.Transactional(readOnly = true)
public class ReportService {

    private final NhiemVuRepository nhiemVuRepository;
    private final CommitVCSRepository commitVCSRepository;
    private final ThanhVienNhomRepository thanhVienNhomRepository;
    private final YeuCauRepository yeuCauRepository;

    public ReportService(NhiemVuRepository nhiemVuRepository,
                         CommitVCSRepository commitVCSRepository,
                         ThanhVienNhomRepository thanhVienNhomRepository,
                         YeuCauRepository yeuCauRepository) {
        this.nhiemVuRepository = nhiemVuRepository;
        this.commitVCSRepository = commitVCSRepository;
        this.thanhVienNhomRepository = thanhVienNhomRepository;
        this.yeuCauRepository = yeuCauRepository;
    }

    public TienDoDTO xemTienDoDuAn(UUID idNhom) {
        java.util.List<NhiemVu> tasks = nhiemVuRepository.findAll().stream()
                .filter(nv -> nv.getYeuCau() != null
                        && nv.getYeuCau().getNhom() != null
                        && idNhom.equals(nv.getYeuCau().getNhom().getIdNhom()))
                .collect(Collectors.toList());

        int total = tasks.size();
        long done = tasks.stream().filter(nv -> "DONE".equalsIgnoreCase(nv.getTrangThai())).count();
        double percent = total == 0 ? 0.0 : (double) done / total * 100;
        return new TienDoDTO(idNhom, total, (int) done, percent);
    }

    public ThongKeGitDTO thongKeGithub(UUID idNhom) {
        java.util.List<CommitVCS> commits = commitVCSRepository.findAll().stream()
                .filter(c -> c.getNhiemVu() != null
                        && c.getNhiemVu().getYeuCau() != null
                        && c.getNhiemVu().getYeuCau().getNhom() != null
                        && idNhom.equals(c.getNhiemVu().getYeuCau().getNhom().getIdNhom()))
                .collect(Collectors.toList());

        java.util.Map<String, Integer> soCommitTheoSinhVien = new HashMap<>();
        java.util.Map<String, Set<LocalDate>> ngayCommitTheoSinhVien = new HashMap<>();
        java.util.Map<String, Double> tongDiemChatLuong = new HashMap<>();

        for (CommitVCS c : commits) {
            if (c.getSinhVien() != null) {
                String name = c.getSinhVien().getHoTen();
                soCommitTheoSinhVien.merge(name, 1, Integer::sum);
                
                if (c.getThoiGian() != null) {
                    LocalDate date = c.getThoiGian().toLocalDate();
                    ngayCommitTheoSinhVien.computeIfAbsent(name, k -> new HashSet<>())
                            .add(date);
                }

                double diem = 0.0;
                if (c.getThongDiep() != null) {
                    if (c.getThongDiep().length() > 20) diem += 0.4;
                    if (c.getThongDiep().matches(".*[A-Z]+-\\d+.*")) diem += 0.6;
                }
                tongDiemChatLuong.merge(name, diem, Double::sum);
            }
        }

        java.util.Map<String, Double> chiSoTanSuat = new HashMap<>();
        java.util.Map<String, Double> chiSoChatLuong = new HashMap<>();

        soCommitTheoSinhVien.forEach((name, count) -> {
            Set<LocalDate> days = ngayCommitTheoSinhVien.getOrDefault(name, new HashSet<>());
            int uniqueDays = days.size();
            chiSoTanSuat.put(name, Math.min(1.0, (double) uniqueDays / 7.0));

            Double totalDiem = tongDiemChatLuong.getOrDefault(name, 0.0);
            chiSoChatLuong.put(name, Math.min(1.0, totalDiem / count.doubleValue()));
        });

        return new ThongKeGitDTO(idNhom, commits.size(), soCommitTheoSinhVien, chiSoTanSuat, chiSoChatLuong);
    }

    public java.util.List<java.util.Map<String, Object>> xemLichSuTienDo(UUID idNhom) {
        java.util.List<NhiemVu> tasks = nhiemVuRepository.findAll().stream()
                .filter(nv -> nv.getYeuCau() != null
                        && nv.getYeuCau().getNhom() != null
                        && idNhom.equals(nv.getYeuCau().getNhom().getIdNhom())
                        && "DONE".equalsIgnoreCase(nv.getTrangThai())
                        && nv.getThoiGianCapNhat() != null)
                .sorted(Comparator.comparing(NhiemVu::getThoiGianCapNhat))
                .collect(Collectors.toList());

        java.util.Map<String, Integer> hoanThanhTheoNgay = new LinkedHashMap<>();
        int currentTotal = 0;
        
        for (NhiemVu nv : tasks) {
            String date = nv.getThoiGianCapNhat().toLocalDate().toString();
            currentTotal++;
            hoanThanhTheoNgay.put(date, currentTotal); 
        }

        java.util.List<java.util.Map<String, Object>> data = new ArrayList<>();
        for (java.util.Map.Entry<String, Integer> entry : hoanThanhTheoNgay.entrySet()) {
            java.util.Map<String, Object> point = new HashMap<>();
            point.put("ngay", entry.getKey());
            point.put("hoanThanh", entry.getValue());
            data.add(point);
        }
        return data;
    }

    public java.util.List<java.util.Map<String, Object>> xemLichSuCommitCaNhan(UUID idSinhVien) {
        java.util.List<CommitVCS> commits = commitVCSRepository.findAll().stream()
                .filter(c -> c.getSinhVien() != null && idSinhVien.equals(c.getSinhVien().getId()) && c.getThoiGian() != null)
                .sorted(Comparator.comparing(CommitVCS::getThoiGian))
                .collect(Collectors.toList());

        return toHistoryData(commits);
    }

    public java.util.List<java.util.Map<String, Object>> xemLichSuCommitNhom(UUID idNhom) {
        java.util.List<CommitVCS> commits = commitVCSRepository.findAll().stream()
                .filter(c -> c.getNhiemVu() != null
                        && c.getNhiemVu().getYeuCau() != null
                        && c.getNhiemVu().getYeuCau().getNhom() != null
                        && idNhom.equals(c.getNhiemVu().getYeuCau().getNhom().getIdNhom())
                        && c.getThoiGian() != null)
                .sorted(Comparator.comparing(CommitVCS::getThoiGian))
                .collect(Collectors.toList());

        return toHistoryData(commits);
    }

    public java.util.List<JAVAGROUP.prjApp.dtos.CommitDTO> layChiTietCommitNhom(UUID idNhom) {
        return commitVCSRepository.findAll().stream()
                .filter(c -> c.getNhiemVu() != null
                        && c.getNhiemVu().getYeuCau() != null
                        && c.getNhiemVu().getYeuCau().getNhom() != null
                        && idNhom.equals(c.getNhiemVu().getYeuCau().getNhom().getIdNhom()))
                .sorted(Comparator.comparing(CommitVCS::getThoiGian).reversed())
                .map(c -> {
                    JAVAGROUP.prjApp.dtos.CommitDTO dto = new JAVAGROUP.prjApp.dtos.CommitDTO();
                    dto.setSha(c.getSha());
                    dto.setThongDiep(c.getThongDiep());
                    dto.setThoiGian(c.getThoiGian());
                    if (c.getSinhVien() != null) {
                        dto.setAuthorName(c.getSinhVien().getHoTen());
                        dto.setAuthorEmail(c.getSinhVien().getEmail());
                    } else {
                        dto.setAuthorName("Unknown");
                    }
                    if (c.getYeuCau() != null) {
                        dto.setIdYeuCau(c.getYeuCau().getIdYeuCau().toString());
                        dto.setTieuDeYeuCau(c.getYeuCau().getTieuDe());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private java.util.List<java.util.Map<String, Object>> toHistoryData(java.util.List<CommitVCS> commits) {
        java.util.Map<String, Integer> countPerDay = new LinkedHashMap<>();
        for (CommitVCS c : commits) {
            String date = c.getThoiGian().toLocalDate().toString();
            countPerDay.merge(date, 1, (oldValue, newValue) -> oldValue + newValue);
        }

        java.util.List<java.util.Map<String, Object>> data = new ArrayList<>();
        for (java.util.Map.Entry<String, Integer> entry : countPerDay.entrySet()) {
            java.util.Map<String, Object> point = new HashMap<>();
            point.put("date", entry.getKey());
            point.put("count", entry.getValue());
            data.add(point);
        }
        return data;
    }

    public java.util.List<DongGopDTO> xemDongGopCaNhan(UUID idNhom) {
        return thanhVienNhomRepository.findById_IdNhom(idNhom).stream()
                .map(tv -> {
                    SinhVien sv = tv.getSinhVien();
                    java.util.List<NhiemVu> tasks = nhiemVuRepository.findBySinhVien_Id(sv.getId());
                    long doneTasks = tasks.stream()
                            .filter(nv -> "DONE".equalsIgnoreCase(nv.getTrangThai())).count();
                    long commitCount = commitVCSRepository.findAll().stream()
                            .filter(c -> c.getSinhVien() != null && sv.getId().equals(c.getSinhVien().getId()))
                            .count();
                    return new DongGopDTO(sv.getId(), sv.getHoTen(), (int) doneTasks, (int) commitCount);
                })
                .collect(Collectors.toList());
    }

    public Resource xuatBaoCaoTongHop(UUID idNhom) {
        TienDoDTO tienDo = xemTienDoDuAn(idNhom);
        java.util.List<DongGopDTO> dongGops = xemDongGopCaNhan(idNhom);

        StringBuilder sb = new StringBuilder();
        sb.append("BAO CAO NHOM: ").append(idNhom).append("\n\n");
        sb.append("TIEN DO:\nTong NV,NV Hoan Thanh,% Tien Do\n");
        sb.append(tienDo.getTongSoNhiemVu()).append(",")
                .append(tienDo.getNhiemVuHoanThanh()).append(",")
                .append(String.format("%.1f", tienDo.getPhanTramTienDo())).append("%\n\n");

        sb.append("DONG GOP THANH VIEN:\nTen,Nhiem Vu Hoan Thanh,So Commit\n");
        for (DongGopDTO dg : dongGops) {
            sb.append(dg.getTenSinhVien()).append(",")
                    .append(dg.getSoNhiemVuHoanThanh()).append(",")
                    .append(dg.getSoCommit()).append("\n");
        }
        return new ByteArrayResource(sb.toString().getBytes(StandardCharsets.UTF_8));
    }

    public Resource xuatBaoCaoDocx(UUID idNhom) throws IOException {
        TienDoDTO tienDo = xemTienDoDuAn(idNhom);
        java.util.List<DongGopDTO> dongGops = xemDongGopCaNhan(idNhom);

        try (XWPFDocument doc = new XWPFDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            XWPFParagraph title = doc.createParagraph();
            title.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun titleRun = title.createRun();
            titleRun.setText("BAO CAO TONG HOP NHOM");
            titleRun.setBold(true);
            titleRun.setFontSize(20);

            XWPFParagraph p1 = doc.createParagraph();
            p1.createRun().setText("Tiên độ tổng quát: " + String.format("%.1f", tienDo.getPhanTramTienDo()) + "%");

            XWPFTable table = doc.createTable();
            XWPFTableRow header = table.getRow(0);
            header.getCell(0).setText("Tên thành viên");
            header.addNewTableCell().setText("Nhiệm vụ xong");
            header.addNewTableCell().setText("Số Commits");

            for (DongGopDTO dg : dongGops) {
                XWPFTableRow row = table.createRow();
                row.getCell(0).setText(dg.getTenSinhVien());
                row.getCell(1).setText(String.valueOf(dg.getSoNhiemVuHoanThanh()));
                row.getCell(2).setText(String.valueOf(dg.getSoCommit()));
            }

            doc.write(out);
            return new ByteArrayResource(out.toByteArray());
        }
    }

    public Resource xuatBaoCaoPdf(UUID idNhom) {
        TienDoDTO tienDo = xemTienDoDuAn(idNhom);
        java.util.List<DongGopDTO> dongGops = xemDongGopCaNhan(idNhom);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();

            Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("BAO CAO TONG HOP NHOM", fontTitle);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            document.add(new Paragraph(" "));

            document.add(new Paragraph("Tien do du an: " + String.format("%.1f", tienDo.getPhanTramTienDo()) + "%"));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(3);
            table.addCell("Ten Sinh Vien");
            table.addCell("Nhiem Vu Xong");
            table.addCell("So Commits");

            for (DongGopDTO dg : dongGops) {
                table.addCell(dg.getTenSinhVien());
                table.addCell(String.valueOf(dg.getSoNhiemVuHoanThanh()));
                table.addCell(String.valueOf(dg.getSoCommit()));
            }
            document.add(table);
            document.close();
            return new ByteArrayResource(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Lỗi tạo PDF", e);
        }
    }

    public Resource xuatBaoCaoSRS(UUID idNhom) throws IOException {
        java.util.List<YeuCau> requirements = yeuCauRepository.findByNhom_IdNhom(idNhom);

        try (XWPFDocument doc = new XWPFDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            XWPFParagraph title = doc.createParagraph();
            title.setAlignment(ParagraphAlignment.CENTER);
            XWPFRun titleRun = title.createRun();
            titleRun.setText("SOFTWARE REQUIREMENTS SPECIFICATION (SRS)");
            titleRun.setBold(true);
            titleRun.setFontSize(22);
            titleRun.addBreak();
            
            XWPFParagraph info = doc.createParagraph();
            info.createRun().setText("Mã nhóm: " + idNhom);
            info.createRun().addBreak();
            info.createRun().setText("Ngày xuất: " + LocalDate.now());
            
            XWPFParagraph section1 = doc.createParagraph();
            XWPFRun r1 = section1.createRun();
            r1.setText("1. GIỚI THIỆU");
            r1.setBold(true);
            r1.setFontSize(14);
            
            XWPFParagraph p1 = doc.createParagraph();
            p1.createRun().setText("Tài liệu này đặc tả các yêu cầu chức năng cho dự án môn học Java, được đồng bộ trực tiếp từ hệ thống quản lý Jira.");

            XWPFParagraph section2 = doc.createParagraph();
            XWPFRun r2 = section2.createRun();
            r2.setText("2. YÊU CẦU CHỨC NĂNG");
            r2.setBold(true);
            r2.setFontSize(14);

            for (int i = 0; i < requirements.size(); i++) {
                YeuCau yc = requirements.get(i);
                XWPFParagraph p = doc.createParagraph();
                XWPFRun run = p.createRun();
                run.setText((i + 1) + ". " + yc.getTieuDe());
                run.setBold(true);
                
                XWPFParagraph desc = doc.createParagraph();
                desc.setIndentationLeft(720); 
                desc.createRun().setText("Mô tả: " + (yc.getMoTa() != null ? yc.getMoTa() : "Không có mô tả."));
                
                XWPFParagraph status = doc.createParagraph();
                status.setIndentationLeft(720);
                status.createRun().setText("Trạng thái hiện tại: " + yc.getTrangThai());
            }

            doc.write(out);
            return new ByteArrayResource(out.toByteArray());
        }
    }
}
