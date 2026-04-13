package com.example.idlegame.service.game.reward;

import com.example.idlegame.domain.reward.AppliedReward;
import com.example.idlegame.domain.reward.RewardConfig;
import com.example.idlegame.entity.Player;
import com.example.idlegame.entity.enums.RewardType;
import com.example.idlegame.service.game.boost.BoostService;
import org.springframework.stereotype.Component;

/**
 * Temporary boost activation strategy.
 */
@Component
public class TemporaryBoostRewardStrategy implements RewardStrategy {
    private final BoostService boostService;

    public TemporaryBoostRewardStrategy(BoostService boostService) {
        this.boostService = boostService;
    }

    @Override
    public RewardType getType() {
        return RewardType.TEMP_BOOST;
    }

    @Override
    public AppliedReward apply(Player player, RewardConfig config) {
        boostService.addCoinMultiplierBoost(player, 2.0, config.getMaxValue());
        return AppliedReward.builder().type(getType().name()).description("x2 coins for " + config.getMaxValue() + " seconds").build();
    }
}
