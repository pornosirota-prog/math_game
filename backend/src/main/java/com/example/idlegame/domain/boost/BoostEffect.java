package com.example.idlegame.domain.boost;

import com.example.idlegame.entity.enums.BoostType;

/**
 * Defines operations supported by a boost type.
 */
public interface BoostEffect {
    /**
     * Provides boost type handled by this strategy.
     *
     * @return boost type.
     */
    BoostType getType();

    /**
     * Applies boost to base value.
     *
     * @param baseValue base amount.
     * @param multiplier active multiplier.
     * @return boosted amount.
     */
    long apply(long baseValue, double multiplier);
}
