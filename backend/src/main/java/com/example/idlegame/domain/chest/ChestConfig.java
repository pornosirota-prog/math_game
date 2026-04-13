package com.example.idlegame.domain.chest;

import com.example.idlegame.domain.reward.RewardConfig;
import lombok.Builder;
import lombok.Value;

import java.util.List;

/**
 * Declarative chest config.
 */
@Value
@Builder
public class ChestConfig {
    String type;
    String title;
    String description;
    List<RewardConfig> rewards;
}
