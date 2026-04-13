package com.example.idlegame.service.game.reward;

import com.example.idlegame.domain.reward.AppliedReward;
import com.example.idlegame.domain.reward.RewardConfig;
import com.example.idlegame.entity.Player;
import com.example.idlegame.entity.enums.RewardType;
import com.example.idlegame.service.game.boost.BoostService;
import org.springframework.stereotype.Component;

import java.util.concurrent.ThreadLocalRandom;

/**
 * Coin reward strategy with boost support.
 */
@Component
public class CoinsRewardStrategy implements RewardStrategy {
    private final BoostService boostService;

    public CoinsRewardStrategy(BoostService boostService) {
        this.boostService = boostService;
    }

    @Override
    public RewardType getType() {
        return RewardType.COINS;
    }

    @Override
    public AppliedReward apply(Player player, RewardConfig config) {
        long base = ThreadLocalRandom.current().nextLong(config.getMinValue(), config.getMaxValue() + 1);
        long boosted = boostService.applyCoinBoost(player, base);
        player.setCoins(player.getCoins() + boosted);
        return AppliedReward.builder().type(getType().name()).description("+" + boosted + " coins").build();
    }
}
