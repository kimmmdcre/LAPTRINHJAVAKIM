package JAVAGROUP.prjApp.adapter;

import java.util.List;

import JAVAGROUP.prjApp.dtos.CommitDTO;

public interface IGitHubClient {
    List<CommitDTO> layDanhSachCommit(String repo, String maTruyCap, String tuNgay);

    void kiemTraKetNoi(String repo, String maTruyCap);
}
