package com.example.idlegame.security;

import com.example.idlegame.entity.Player;
import com.example.idlegame.entity.enums.AuthProvider;
import com.example.idlegame.repository.PlayerRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 * Creates or reuses local player after Google login and redirects with JWT.
 */
@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {
    private final PlayerRepository playerRepository;
    private final JwtService jwtService;
    private final String frontendBaseUrl;

    public OAuth2LoginSuccessHandler(PlayerRepository playerRepository, JwtService jwtService,
                                     @Value("${app.frontend.base-url}") String frontendBaseUrl) {
        this.playerRepository = playerRepository;
        this.jwtService = jwtService;
        this.frontendBaseUrl = frontendBaseUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User user = (OAuth2User) authentication.getPrincipal();
        String email = user.getAttribute("email");
        String name = user.getAttribute("name");
        Player player = playerRepository.findByEmail(email).orElseGet(() -> playerRepository.save(Player.builder()
                .email(email)
                .displayName(name != null ? name : email)
                .authProvider(AuthProvider.GOOGLE)
                .level(1)
                .experience(0)
                .coins(100)
                .energy(20)
                .build()));
        String token = jwtService.generateToken(player.getEmail());
        response.sendRedirect(frontendBaseUrl + "/oauth-success?token=" + token);
    }
}
