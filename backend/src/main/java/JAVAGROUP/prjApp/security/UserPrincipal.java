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
    private Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(UUID id, String tenDangNhap, String matKhauHash, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.tenDangNhap = tenDangNhap;
        this.matKhauHash = matKhauHash;
        this.authorities = authorities;
    }

    public static UserPrincipal create(NguoiDung user) {
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getMaVaiTro())
        );

        return new UserPrincipal(
                user.getId(),
                user.getTenDangNhap(),
                user.getMatKhauHash(),
                authorities
        );
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
