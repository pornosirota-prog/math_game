package com.example.idlegame.controller;

import com.example.idlegame.dto.auth.AuthResponse;
import com.example.idlegame.dto.auth.LoginRequest;
import com.example.idlegame.dto.auth.RegisterRequest;
import com.example.idlegame.dto.player.PlayerProfileDto;
import com.example.idlegame.service.auth.AuthService;
import com.example.idlegame.service.player.CurrentPlayerService;
import com.example.idlegame.service.player.PlayerService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

/**
 * Auth REST endpoints.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;
    private final CurrentPlayerService currentPlayerService;
    private final PlayerService playerService;

    public AuthController(AuthService authService, CurrentPlayerService currentPlayerService, PlayerService playerService) {
        this.authService = authService;
        this.currentPlayerService = currentPlayerService;
        this.playerService = playerService;
    }

    /**
     * Registers local account.
     */
    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    /**
     * Authenticates local account.
     */
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /**
     * Returns current authenticated profile.
     */
    @GetMapping("/me")
    public PlayerProfileDto me() {
        return playerService.getProfile(currentPlayerService.getCurrentPlayer());
    }
}
