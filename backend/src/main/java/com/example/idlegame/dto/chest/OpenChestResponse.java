package com.example.idlegame.dto.chest;

import com.example.idlegame.dto.reward.RewardResultDto;
import lombok.Builder;
import lombok.Value;

import java.util.List;

/**
 * Chest open result with applied rewards.
 */
@Value
@Builder
public class OpenChestResponse {
    String chestType;
    List<RewardResultDto> rewards;
}
