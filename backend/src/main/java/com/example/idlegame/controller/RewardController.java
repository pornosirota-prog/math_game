package com.example.idlegame.controller;

import com.example.idlegame.dto.chest.OpenChestResponse;
import com.example.idlegame.service.game.daily.DailyRewardService;
import com.example.idlegame.service.player.CurrentPlayerService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Reward claim endpoints.
 */
@RestController
@RequestMapping("/api/rewards")
public class RewardController {
    private final DailyRewardService dailyRewardService;
    private final CurrentPlayerService currentPlayerService;

    public RewardController(DailyRewardService dailyRewardService, CurrentPlayerService currentPlayerService) {
        this.dailyRewardService = dailyRewardService;
        this.currentPlayerService = currentPlayerService;
    }

    /**
     * Claims daily chest reward.
     */
    @PostMapping("/daily-claim")
    public OpenChestResponse claimDaily() {
        return dailyRewardService.claimDaily(currentPlayerService.getCurrentPlayer());
    }
}
