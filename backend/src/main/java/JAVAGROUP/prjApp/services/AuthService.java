package JAVAGROUP.prjApp.services;

import JAVAGROUP.prjApp.entities.BlacklistedToken;
import JAVAGROUP.prjApp.repositories.BlacklistedTokenRepository;
import JAVAGROUP.prjApp.security.JwtTokenProvider;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final BlacklistedTokenRepository blacklistedTokenRepository;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       BlacklistedTokenRepository blacklistedTokenRepository) {
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.blacklistedTokenRepository = blacklistedTokenRepository;
    }

    /**
     * Xác thực đăng nhập bằng tên đăng nhập + mật khẩu.
     * Trả về token JWT thực tế.
     */
    public String dangNhap(String tenDangNhap, String matKhau) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(tenDangNhap, matKhau)
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        return tokenProvider.generateToken(authentication);
    }

    public void dangXuat(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        if (tokenProvider.validateToken(token)) {
            java.util.Date expiryDate = tokenProvider.getExpirationDateFromJWT(token);
            java.time.LocalDateTime expiryLDT = expiryDate.toInstant()
                    .atZone(java.time.ZoneId.systemDefault())
                    .toLocalDateTime();
            
            BlacklistedToken blacklisted = new BlacklistedToken();
            blacklisted.setToken(token);
            blacklisted.setExpiryDate(expiryLDT);
            blacklistedTokenRepository.save(blacklisted);
        }
    }
}
