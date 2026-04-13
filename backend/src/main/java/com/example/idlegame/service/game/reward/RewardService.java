package com.example.idlegame.service.game.reward;

import com.example.idlegame.domain.reward.AppliedReward;
import com.example.idlegame.domain.reward.RewardConfig;
import com.example.idlegame.entity.Player;
import com.example.idlegame.entity.enums.RewardType;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Registry-based reward resolver.
 */
@Service
public class RewardService {
    private final Map<RewardType, RewardStrategy> strategyRegistry;

    public RewardService(List<RewardStrategy> strategies) {
        this.strategyRegistry = strategies.stream().collect(Collectors.toMap(RewardStrategy::getType, Function.identity()));
    }

    /**
     * Applies a reward config.
     */
    public AppliedReward applyReward(Player player, RewardConfig config) {
        return strategyRegistry.get(config.getRewardType()).apply(player, config);
    }
}
