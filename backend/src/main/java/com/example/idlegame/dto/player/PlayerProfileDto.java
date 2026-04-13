package com.example.idlegame.dto.player;

import lombok.Data;

import java.time.Instant;

/**
 * Exposed player profile data.
 */
@Data
public class PlayerProfileDto {
    private String email;
    private String displayName;
    private int level;
    private long experience;
    private long coins;
    private int energy;
    private Instant createdAt;
    private Instant updatedAt;
}
