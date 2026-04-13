package JAVAGROUP.prjApp.service;

import JAVAGROUP.prjApp.dto.DongGopDTO;
import JAVAGROUP.prjApp.dto.ThongKeGitDTO;
import JAVAGROUP.prjApp.dto.TienDoDTO;
import JAVAGROUP.prjApp.entity.CommitVCS;
import JAVAGROUP.prjApp.entity.NhiemVu;
import JAVAGROUP.prjApp.entity.SinhVien;
import JAVAGROUP.prjApp.repository.CommitVCSRepository;
import JAVAGROUP.prjApp.repository.NhiemVuRepository;
import JAVAGROUP.prjApp.repository.ThanhVienNhomRepository;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.apache.poi.xwpf.usermodel.*;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.PdfPTable;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final NhiemVuRepository nhiemVuRepository;
    private final CommitVCSRepository commitVCSRepository;
    private final ThanhVienNhomRepository thanhVienNhomRepository;

    public ReportService(NhiemVuRepository nhiemVuRepository,
                         CommitVCSRepository commitVCSRepository,
                         ThanhVienNhomRepository thanhVienNhomRepository) {
        this.nhiemVuRepository = nhiemVuRepository;
        this.commitVCSRepository = commitVCSRepository;
        this.thanhVienNhomRepository = thanhVienNhomRepository;
    }

    public TienDoDTO xemTienDoDuAn(UUID idNhom) {
        List<NhiemVu> tasks = nhiemVuRepository.findAll().stream()
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
        List<CommitVCS> commits = commitVCSRepository.findAll().stream()
                .filter(c -> c.getNhiemVu() != null
                        && c.getNhiemVu().getYeuCau() != null
                        && c.getNhiemVu().getYeuCau().getNhom() != null
                        && idNhom.equals(c.getNhiemVu().getYeuCau().getNhom().getIdNhom()))
                .collect(Collectors.toList());

        Map<String, Integer> commitPerSV = new HashMap<>();
        for (CommitVCS c : commits) {
            if (c.getSinhVien() != null) {
                String name = c.getSinhVien().getHoTen();
                commitPerSV.merge(name, 1, Integer::sum);
            }
        }
        return new ThongKeGitDTO(idNhom, commits.size(), commitPerSV);
    }

    public List<Map<String, Object>> xemLichSuTienDo(UUID idNhom) {
        List<NhiemVu> tasks = nhiemVuRepository.findAll().stream()
                .filter(nv -> nv.getYeuCau() != null
                        && nv.getYeuCau().getNhom() != null
                        && idNhom.equals(nv.getYeuCau().getNhom().getIdNhom())
                        && "DONE".equalsIgnoreCase(nv.getTrangThai())
                        && nv.getThoiGianCapNhat() != null)
                .sorted(Comparator.comparing(NhiemVu::getThoiGianCapNhat))
                .collect(Collectors.toList());

        Map<String, Integer> hoanThanhTheoNgay = new LinkedHashMap<>();
        int currentTotal = 0;
        
        for (NhiemVu nv : tasks) {
            String date = nv.getThoiGianCapNhat().toLocalDate().toString();
            currentTotal++;
            hoanThanhTheoNgay.put(date, currentTotal); 
        }

        List<Map<String, Object>> data = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : hoanThanhTheoNgay.entrySet()) {
            Map<String, Object> point = new HashMap<>();
            point.put("ngay", entry.getKey());
            point.put("hoanThanh", entry.getValue());
            data.add(point);
        }
        return data;
    }

    public List<Map<String, Object>> xemLichSuCommitCaNhan(UUID idSinhVien) {
        List<CommitVCS> commits = commitVCSRepository.findAll().stream()
                .filter(c -> c.getSinhVien() != null && idSinhVien.equals(c.getSinhVien().getId()) && c.getThoiGian() != null)
                .sorted(Comparator.comparing(CommitVCS::getThoiGian))
                .collect(Collectors.toList());

        return toHistoryData(commits);
    }

    public List<Map<String, Object>> xemLichSuCommitNhom(UUID idNhom) {
        List<CommitVCS> commits = commitVCSRepository.findAll().stream()
                .filter(c -> c.getNhiemVu() != null
                        && c.getNhiemVu().getYeuCau() != null
                        && c.getNhiemVu().getYeuCau().getNhom() != null
                        && idNhom.equals(c.getNhiemVu().getYeuCau().getNhom().getIdNhom())
                        && c.getThoiGian() != null)
                .sorted(Comparator.comparing(CommitVCS::getThoiGian))
                .collect(Collectors.toList());

        return toHistoryData(commits);
    }

    private List<Map<String, Object>> toHistoryData(List<CommitVCS> commits) {
        Map<String, Integer> countPerDay = new LinkedHashMap<>();
        for (CommitVCS c : commits) {
            String date = c.getThoiGian().toLocalDate().toString();
            countPerDay.merge(date, 1, Integer::sum);
        }

        List<Map<String, Object>> data = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : countPerDay.entrySet()) {
            Map<String, Object> point = new HashMap<>();
            point.put("date", entry.getKey());
            point.put("count", entry.getValue());
            data.add(point);
        }
        return data;
    }

    public List<DongGopDTO> xemDongGopCaNhan(UUID idNhom) {
        return thanhVienNhomRepository.findById_IdNhom(idNhom).stream()
                .map(tv -> {
                    SinhVien sv = tv.getSinhVien();
                    List<NhiemVu> tasks = nhiemVuRepository.findBySinhVien_Id(sv.getId());
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
        List<DongGopDTO> dongGops = xemDongGopCaNhan(idNhom);

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
        List<DongGopDTO> dongGops = xemDongGopCaNhan(idNhom);

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
        List<DongGopDTO> dongGops = xemDongGopCaNhan(idNhom);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            com.lowagie.text.Document document = new com.lowagie.text.Document();
            PdfWriter.getInstance(document, out);
            document.open();

            com.lowagie.text.Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
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
}
