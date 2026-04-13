package com.example.idlegame.service.game.level;

import com.example.idlegame.domain.level.LevelFormula;
import com.example.idlegame.entity.Player;
import org.springframework.stereotype.Service;

/**
 * Applies experience and level-up logic.
 */
@Service
public class LevelService {
    private final LevelFormula levelFormula;

    public LevelService(LevelFormula levelFormula) {
        this.levelFormula = levelFormula;
    }

    /**
     * Adds experience and performs level-up steps.
     */
    public void grantExperience(Player player, long amount) {
        player.setExperience(player.getExperience() + amount);
        while (player.getExperience() >= levelFormula.requiredExperienceForLevel(player.getLevel() + 1)) {
            player.setLevel(player.getLevel() + 1);
            player.setEnergy(player.getEnergy() + 5);
        }
    }

    /**
     * Returns exp needed for next level.
     */
    public long expToNextLevel(Player player) {
        return Math.max(0, levelFormula.requiredExperienceForLevel(player.getLevel() + 1) - player.getExperience());
    }
}
