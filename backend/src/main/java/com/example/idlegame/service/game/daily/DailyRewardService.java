package com.example.idlegame.service.game.daily;

import com.example.idlegame.dto.chest.OpenChestResponse;
import com.example.idlegame.entity.Player;
import com.example.idlegame.repository.PlayerRepository;
import com.example.idlegame.service.game.chest.ChestService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

/**
 * Daily reward claim logic isolated from chest service.
 */
@Service
public class DailyRewardService {
    private static final String DAILY_CHEST = "SILVER";

    private final ChestService chestService;
    private final PlayerRepository playerRepository;

    public DailyRewardService(ChestService chestService, PlayerRepository playerRepository) {
        this.chestService = chestService;
        this.playerRepository = playerRepository;
    }

    /**
     * Claims daily chest if cooldown passed.
     */
    @Transactional
    public OpenChestResponse claimDaily(Player player) {
        Instant now = Instant.now();
        if (player.getLastDailyClaimAt() != null && player.getLastDailyClaimAt().plus(1, ChronoUnit.DAYS).isAfter(now)) {
            throw new IllegalStateException("Daily reward already claimed");
        }
        player.setLastDailyClaimAt(now);
        playerRepository.save(player);
        return chestService.openChest(player.getId(), DAILY_CHEST);
    }
}
