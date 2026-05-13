package javagroup.prjApp.security.user;

import javagroup.prjApp.enums.UserRole;

import javagroup.prjApp.entities.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import javagroup.prjApp.entities.Student;

public class UserPrincipal implements UserDetails {
    private UUID id;
    private String username;
    private String passwordHash;
    private String fullName;
    private String email;
    private UserRole roleCode;
    private String groupRole; // LEADER, MEMBER
    private UUID groupId;
    private javagroup.prjApp.enums.UserStatus status;
    private LocalDateTime createdAt;
    private Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(UUID id, String username, String passwordHash, String fullName, String email,
            UserRole roleCode, String groupRole, UUID groupId, javagroup.prjApp.enums.UserStatus status,
            LocalDateTime createdAt,
            Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.fullName = fullName;
        this.email = email;
        this.roleCode = roleCode;
        this.groupRole = groupRole;
        this.groupId = groupId;
        this.status = status;
        this.createdAt = createdAt;
        this.authorities = authorities;
    }

    public static UserPrincipal create(User user) {
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getRoleCode().name()));

        String groupRole = null;
        UUID groupId = null;

        if (user instanceof Student sv) {
            if (sv.getGroupMembers() != null && !sv.getGroupMembers().isEmpty()) {
                var gm = sv.getGroupMembers().get(0);
                groupRole = gm.getRole().name();
                groupId = gm.getProjectGroup().getGroupId();
            }
        }

        return new UserPrincipal(
                user.getId(),
                user.getUsername(),
                user.getPasswordHash(),
                user.getFullName(),
                user.getEmail(),
                user.getRoleCode(),
                groupRole,
                groupId,
                user.getStatus(),
                user.getCreatedAt(),
                authorities);
    }

    public UUID getId() {
        return id;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public UserRole getRoleCode() {
        return roleCode;
    }

    public String getGroupRole() {
        return groupRole;
    }

    public UUID getGroupId() {
        return groupId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return status != javagroup.prjApp.enums.UserStatus.BANNED;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return status == javagroup.prjApp.enums.UserStatus.ACTIVE;
    }
}
