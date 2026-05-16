package javagroup.prjApp.config;

import javagroup.prjApp.repositories.BlacklistedTokenRepository;
import javagroup.prjApp.security.jwt.JwtAuthenticationFilter;
import javagroup.prjApp.security.jwt.JwtTokenProvider;
import javagroup.prjApp.security.user.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;

import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Cấu hình bảo mật chính cho ứng dụng (Spring Security).
 * Quản lý phân quyền, xác thực và bộ lọc JWT.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtTokenProvider tokenProvider;
    private final BlacklistedTokenRepository blacklistedTokenRepository;

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(tokenProvider, customUserDetailsService, blacklistedTokenRepository);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/projects/**").permitAll()

                        // Role-based endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/groups/**").hasAnyRole("ADMIN", "TEACHER", "STUDENT")
                        .requestMatchers("/api/configs/**").hasAnyRole("ADMIN", "TEACHER", "STUDENT")
                        .requestMatchers("/api/sync/**").hasAnyRole("ADMIN", "TEACHER", "STUDENT")
                        .requestMatchers("/api/tasks/**").hasAnyRole("ADMIN", "TEACHER", "STUDENT")
                        .requestMatchers("/api/reports/**").hasAnyRole("ADMIN", "TEACHER", "STUDENT")

                        // Các yêu cầu khác phải đăng nhập
                        .anyRequest().authenticated());

        // Thêm bộ lọc JWT vào trước bộ lọc UsernamePassword truyền thống
        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
