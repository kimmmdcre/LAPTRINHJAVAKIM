package javagroup.prjApp.security.jwt;
 
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import javagroup.prjApp.security.user.UserPrincipal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
 
import java.security.Key;
import java.util.Date;
 
@Component
@Slf4j
public class JwtTokenProvider {
 
    @Value("${app.jwtSecret}")
    private String jwtSecret;
 
    @Value("${app.jwtExpirationMs}")
    private int jwtExpirationMs;
 
    public String generateToken(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
 
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);
 
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
 
        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(expiryDate)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
 
    public String getUsernameFromJWT(String token) {
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
 
        return claims.getSubject();
    }
 
    public Date getExpirationDateFromJWT(String token) {
        Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
 
        return claims.getExpiration();
    }
 
    public boolean validateToken(String authToken) {
        try {
            Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(authToken);
            return true;
        } catch (SecurityException ex) {
            log.error("Invalid JWT signature");
        } catch (MalformedJwtException ex) {
            log.error("Invalid JWT token");
        } catch (ExpiredJwtException ex) {
            log.error("Expired JWT token");
        } catch (UnsupportedJwtException ex) {
            log.error("Unsupported JWT token");
        } catch (IllegalArgumentException ex) {
            log.error("JWT claims string is empty");
        }
        return false;
    }
}
