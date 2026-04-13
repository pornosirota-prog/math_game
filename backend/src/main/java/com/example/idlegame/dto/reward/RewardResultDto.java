package com.example.idlegame.dto.reward;

import lombok.Builder;
import lombok.Value;

/**
 * Applied reward result item.
 */
@Value
@Builder
public class RewardResultDto {
    String type;
    String description;
}
