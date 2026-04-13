package com.example.idlegame.dto.player;

import lombok.Builder;
import lombok.Value;

/**
 * Progress snapshot for game screen.
 */
@Value
@Builder
public class PlayerProgressDto {
    int level;
    long experience;
    long experienceToNextLevel;
    long coins;
    int energy;
}
