package com.example.idlegame.controller;

import com.example.idlegame.dto.boost.BoostDto;
import com.example.idlegame.service.game.boost.BoostService;
import com.example.idlegame.service.player.CurrentPlayerService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Active boost endpoints.
 */
@RestController
@RequestMapping("/api/boost")
public class BoostController {
    private final BoostService boostService;
    private final CurrentPlayerService currentPlayerService;

    public BoostController(BoostService boostService, CurrentPlayerService currentPlayerService) {
        this.boostService = boostService;
        this.currentPlayerService = currentPlayerService;
    }

    /**
     * Returns currently active boosts.
     */
    @GetMapping("/active")
    public List<BoostDto> active() {
        return boostService.getActiveBoosts(currentPlayerService.getCurrentPlayer());
    }
}
