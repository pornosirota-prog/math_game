package com.example.idlegame.service.game.reward;

import com.example.idlegame.domain.reward.AppliedReward;
import com.example.idlegame.domain.reward.RewardConfig;
import com.example.idlegame.entity.Player;
import com.example.idlegame.entity.enums.RewardType;

/**
 * Strategy interface for applying reward config.
 */
public interface RewardStrategy {
    /**
     * Declares supported reward type.
     */
    RewardType getType();

    /**
     * Applies reward and returns resulting message.
     */
    AppliedReward apply(Player player, RewardConfig config);
}
