package com.example.idlegame.controller;

import com.example.idlegame.dto.player.PlayerProfileDto;
import com.example.idlegame.dto.player.PlayerProgressDto;
import com.example.idlegame.service.player.CurrentPlayerService;
import com.example.idlegame.service.player.PlayerService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Player endpoints.
 */
@RestController
@RequestMapping("/api/player")
public class PlayerController {
    private final CurrentPlayerService currentPlayerService;
    private final PlayerService playerService;

    public PlayerController(CurrentPlayerService currentPlayerService, PlayerService playerService) {
        this.currentPlayerService = currentPlayerService;
        this.playerService = playerService;
    }

    /**
     * Returns player profile.
     */
    @GetMapping("/profile")
    public PlayerProfileDto profile() {
        return playerService.getProfile(currentPlayerService.getCurrentPlayer());
    }

    /**
     * Returns player progress data.
     */
    @GetMapping("/progress")
    public PlayerProgressDto progress() {
        return playerService.getProgress(currentPlayerService.getCurrentPlayer());
    }
}
