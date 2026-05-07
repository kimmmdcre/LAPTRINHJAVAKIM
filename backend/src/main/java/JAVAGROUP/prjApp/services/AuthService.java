package javagroup.prjApp.services;

import javagroup.prjApp.services.AuthService;
import javagroup.prjApp.entities.BlacklistedToken;
import javagroup.prjApp.repositories.BlacklistedTokenRepository;
import javagroup.prjApp.config.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.time.LocalDateTime;
import java.time.ZoneId;

public interface AuthService {
    public String login(String username, String password);
    public void logout(String token);
}
