package com.example.idlegame.domain.reward;

import lombok.Builder;
import lombok.Value;

/**
 * Result of reward application.
 */
@Value
@Builder
public class AppliedReward {
    String type;
    String description;
}
