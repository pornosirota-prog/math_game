package com.example.idlegame.service.player;

import com.example.idlegame.dto.player.PlayerProgressDto;
import com.example.idlegame.entity.Player;
import com.example.idlegame.mapper.PlayerMapper;
import com.example.idlegame.dto.player.PlayerProfileDto;
import com.example.idlegame.service.game.level.LevelService;
import org.springframework.stereotype.Service;

/**
 * Read-only player aggregate projections.
 */
@Service
public class PlayerService {
    private final PlayerMapper playerMapper;
    private final LevelService levelService;

    public PlayerService(PlayerMapper playerMapper, LevelService levelService) {
        this.playerMapper = playerMapper;
        this.levelService = levelService;
    }

    /**
     * Builds profile DTO.
     */
    public PlayerProfileDto getProfile(Player player) {
        return playerMapper.toProfile(player);
    }

    /**
     * Builds progress DTO for game HUD.
     */
    public PlayerProgressDto getProgress(Player player) {
        return PlayerProgressDto.builder()
                .level(player.getLevel())
                .experience(player.getExperience())
                .experienceToNextLevel(levelService.expToNextLevel(player))
                .coins(player.getCoins())
                .energy(player.getEnergy())
                .build();
    }
}
