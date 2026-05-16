package javagroup.prjApp.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import javagroup.prjApp.repositories.BlacklistedTokenRepository;
import javagroup.prjApp.security.user.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Bộ lọc xác thực JWT - Kiểm tra Token cho mỗi Request đi vào hệ thống.
 */
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService customUserDetailsService;
    private final BlacklistedTokenRepository blacklistedTokenRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        try {
            // 1. Trích xuất JWT từ Header "Authorization"
            String jwt = getJwtFromRequest(request);

            // 2. Kiểm tra tính hợp lệ của Token
            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {

                // 3. Kiểm tra xem Token có nằm trong danh sách đen (Blacklist) không
                if (blacklistedTokenRepository.existsByToken(jwt)) {
                    log.warn("Access denied: Token is blacklisted.");
                    filterChain.doFilter(request, response);
                    return;
                }

                // 4. Lấy thông tin người dùng từ Token
                String username = tokenProvider.getUsernameFromJWT(jwt);
                UserDetails userDetails = customUserDetailsService.loadUserByUsername(username);

                // 5. Nếu người dùng hợp lệ và không bị khóa, thiết lập thông tin xác thực vào
                // Security Context
                if (userDetails.isEnabled() && userDetails.isAccountNonLocked()) {
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    log.debug("Authentication successful for user: {}", username);
                } else {
                    log.warn("Authentication failed: Account {} is disabled or locked", username);
                }
            }
        } catch (Exception ex) {
            log.error("Serious error during user authentication process", ex);
        }

        // Tiếp tục chuyển request sang các bộ lọc tiếp theo
        filterChain.doFilter(request, response);
    }

    /**
     * Lấy chuỗi Token từ Header của Request.
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
