package JAVAGROUP.prjApp.security;

import JAVAGROUP.prjApp.entities.NguoiDung;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class UserPrincipal implements UserDetails {
    private UUID id;
    private String tenDangNhap;
    private String matKhauHash;
    private String hoTen;
    private String email;
    private String maVaiTro;
    private String groupRole; // LEADER, MEMBER
    private UUID idNhom;
    private Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(UUID id, String tenDangNhap, String matKhauHash, String hoTen, String email, String maVaiTro,
            String groupRole, UUID idNhom, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.tenDangNhap = tenDangNhap;
        this.matKhauHash = matKhauHash;
        this.hoTen = hoTen;
        this.email = email;
        this.maVaiTro = maVaiTro;
        this.groupRole = groupRole;
        this.idNhom = idNhom;
        this.authorities = authorities;
    }

    public static UserPrincipal create(NguoiDung user) {
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getMaVaiTro()));

        String groupRole = null;
        UUID idNhom = null;

        if (user instanceof JAVAGROUP.prjApp.entities.SinhVien sv) {
            if (sv.getThanhVienNhoms() != null && !sv.getThanhVienNhoms().isEmpty()) {
                // Lấy nhóm đầu tiên (giả định sinh viên chỉ thuộc 1 nhóm đồ án)
                var tv = sv.getThanhVienNhoms().get(0);
                groupRole = tv.getVaiTro().name();
                idNhom = tv.getNhom().getIdNhom();
            }
        }

        return new UserPrincipal(
                user.getId(),
                user.getTenDangNhap(),
                user.getMatKhauHash(),
                user.getHoTen(),
                user.getEmail(),
                user.getMaVaiTro(),
                groupRole,
                idNhom,
                authorities);
    }

    public UUID getId() {
        return id;
    }

    @Override
    public String getUsername() {
        return tenDangNhap;
    }

    @Override
    public String getPassword() {
        return matKhauHash;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    public String getHoTen() {
        return hoTen;
    }

    public String getEmail() {
        return email;
    }

    public String getMaVaiTro() {
        return maVaiTro;
    }

    public String getGroupRole() {
        return groupRole;
    }

    public UUID getIdNhom() {
        return idNhom;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
