package com.example.idlegame.service.game.level;

import com.example.idlegame.domain.level.LevelFormula;
import org.springframework.stereotype.Component;

/**
 * Default level formula configurable by class replacement.
 */
@Component
public class QuadraticLevelFormula implements LevelFormula {
    private static final int BASE_EXP = 100;
    private static final int GROWTH = 50;

    /**
     * {@inheritDoc}
     */
    @Override
    public long requiredExperienceForLevel(int level) {
        return (long) BASE_EXP * level + (long) GROWTH * level * level;
    }
}
