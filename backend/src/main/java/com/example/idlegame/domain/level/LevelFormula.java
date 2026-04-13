package com.example.idlegame.domain.level;

/**
 * Strategy for level curve calculations.
 */
public interface LevelFormula {
    /**
     * Calculates total experience required to reach a level.
     *
     * @param level target level.
     * @return required total experience.
     */
    long requiredExperienceForLevel(int level);
}
