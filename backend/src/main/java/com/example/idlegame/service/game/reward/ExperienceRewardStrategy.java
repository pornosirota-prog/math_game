package com.example.idlegame.service.game.reward;

import com.example.idlegame.domain.reward.AppliedReward;
import com.example.idlegame.domain.reward.RewardConfig;
import com.example.idlegame.entity.Player;
import com.example.idlegame.entity.enums.RewardType;
import com.example.idlegame.service.game.level.LevelService;
import org.springframework.stereotype.Component;

import java.util.concurrent.ThreadLocalRandom;

/**
 * Experience reward strategy.
 */
@Component
public class ExperienceRewardStrategy implements RewardStrategy {
    private final LevelService levelService;

    public ExperienceRewardStrategy(LevelService levelService) {
        this.levelService = levelService;
    }

    @Override
    public RewardType getType() {
        return RewardType.EXPERIENCE;
    }

    @Override
    public AppliedReward apply(Player player, RewardConfig config) {
        long value = ThreadLocalRandom.current().nextLong(config.getMinValue(), config.getMaxValue() + 1);
        levelService.grantExperience(player, value);
        return AppliedReward.builder().type(getType().name()).description("+" + value + " exp").build();
    }
}
