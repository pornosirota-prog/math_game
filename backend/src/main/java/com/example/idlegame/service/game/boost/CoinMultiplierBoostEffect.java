package com.example.idlegame.service.game.boost;

import com.example.idlegame.domain.boost.BoostEffect;
import com.example.idlegame.entity.enums.BoostType;
import org.springframework.stereotype.Component;

/**
 * Coin multiplier implementation.
 */
@Component
public class CoinMultiplierBoostEffect implements BoostEffect {
    @Override
    public BoostType getType() {
        return BoostType.COIN_MULTIPLIER;
    }

    @Override
    public long apply(long baseValue, double multiplier) {
        return Math.round(baseValue * multiplier);
    }
}
