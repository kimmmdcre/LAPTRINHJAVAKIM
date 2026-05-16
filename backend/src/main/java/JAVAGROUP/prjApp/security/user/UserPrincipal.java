package javagroup.prjApp.security.user;
 
import com.fasterxml.jackson.annotation.JsonIgnore;
import javagroup.prjApp.entities.Student;
import javagroup.prjApp.entities.User;
import javagroup.prjApp.enums.UserRole;
import javagroup.prjApp.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
 
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
 
/**
 * Lớp đại diện cho người dùng đã xác thực trong hệ thống Spring Security.
 * Chứa đầy đủ thông tin định danh và quyền hạn của người dùng.
 */
@Getter
@Builder
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class UserPrincipal implements UserDetails {
 
    private final UUID id;
    private final String username;
 
    @JsonIgnore
    private final String passwordHash;
 
    private final String fullName;
    private final String email;
    private final UserRole roleCode;
    private final String groupRole;
    private final UUID groupId;
    private final UserStatus status;
    private final LocalDateTime createdAt;
    private final Collection<? extends GrantedAuthority> authorities;
 
    /**
     * Chuyển đổi từ thực thể User (Database) sang đối tượng UserPrincipal (Security).
     */
    public static UserPrincipal create(User user) {
        List<GrantedAuthority> authorities = new ArrayList<>();
        
        // 1. Gán quyền hệ thống (ROLE_ADMIN, ROLE_TEACHER, ROLE_STUDENT)
        authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRoleCode().name()));
 
        String groupRole = null;
        UUID groupId = null;
 
        // 2. Nếu là Sinh viên, bổ sung thông tin nhóm và quyền trong nhóm
        if (user instanceof Student sv) {
            if (sv.getGroupMembers() != null && !sv.getGroupMembers().isEmpty()) {
                var gm = sv.getGroupMembers().get(0);
                groupRole = gm.getRole().name();
                groupId = gm.getProjectGroup().getGroupId();
                
                // Quyền hạn theo vai trò nhóm (ví dụ: GROUP_LEADER)
                authorities.add(new SimpleGrantedAuthority("GROUP_" + groupRole));
            }
        }
 
        return UserPrincipal.builder()
                .id(user.getId())
                .username(user.getUsername())
                .passwordHash(user.getPasswordHash())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .roleCode(user.getRoleCode())
                .groupRole(groupRole)
                .groupId(groupId)
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .authorities(authorities)
                .build();
    }
 
    // --- Các hàm tiện ích kiểm tra quyền nhanh ---
 
    public boolean isAdmin() {
        return roleCode == UserRole.ADMIN;
    }
 
    public boolean isLeader() {
        return "LEADER".equals(groupRole);
    }
 
    // --- Các phương thức bắt buộc của UserDetails Interface ---
 
    @Override
    public String getPassword() {
        return passwordHash;
    }
 
    @Override
    public String getUsername() {
        return username;
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
        return status != UserStatus.BANNED;
    }
 
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
 
    @Override
    public boolean isEnabled() {
        return status == UserStatus.ACTIVE;
    }
}
