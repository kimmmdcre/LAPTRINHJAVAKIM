package JAVAGROUP.prjApp.adapter;

import java.util.List;

import JAVAGROUP.prjApp.dtos.YeuCauDTO;

public interface IJiraClient {
    List<YeuCauDTO> layDanhSachYeuCau(String duongDan, String email, String maTruyCap, String maDuAn);
    void kiemTraKetNoi(String duongDan, String email, String maTruyCap, String maDuAn);
}
