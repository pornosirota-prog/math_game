package com.example.idlegame.domain.reward;

import com.example.idlegame.entity.enums.RewardType;
import lombok.Builder;
import lombok.Value;

/**
 * Declarative reward config item used by chest definitions.
 */
@Value
@Builder
public class RewardConfig {
    RewardType rewardType;
    long minValue;
    long maxValue;
    String metadata;
}
