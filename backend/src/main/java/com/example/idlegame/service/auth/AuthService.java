package com.example.idlegame.service.auth;

import com.example.idlegame.dto.auth.AuthResponse;
import com.example.idlegame.dto.auth.LoginRequest;
import com.example.idlegame.dto.auth.RegisterRequest;
import com.example.idlegame.entity.Player;
import com.example.idlegame.entity.enums.AuthProvider;
import com.example.idlegame.repository.PlayerRepository;
import com.example.idlegame.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Local auth and registration flows.
 */
@Service
public class AuthService {
    private final PlayerRepository playerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(PlayerRepository playerRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.playerRepository = playerRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    /**
     * Registers local user and returns JWT.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (playerRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already used");
        }
        Player player = Player.builder()
                .email(request.getEmail())
                .displayName(request.getDisplayName())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .authProvider(AuthProvider.LOCAL)
                .level(1)
                .experience(0)
                .coins(100)
                .energy(20)
                .build();
        playerRepository.save(player);
        return AuthResponse.builder().token(jwtService.generateToken(player.getEmail())).build();
    }

    /**
     * Authenticates local user and returns JWT.
     */
    public AuthResponse login(LoginRequest request) {
        Player player = playerRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!passwordEncoder.matches(request.getPassword(), player.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        return AuthResponse.builder().token(jwtService.generateToken(player.getEmail())).build();
    }
}
