package com.example.idlegame.dto.boost;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;

/**
 * Active boost view model.
 */
@Value
@Builder
public class BoostDto {
    String type;
    double multiplier;
    Instant expiresAt;
}
