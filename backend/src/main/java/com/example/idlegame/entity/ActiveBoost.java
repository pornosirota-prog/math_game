package com.example.idlegame.entity;

import com.example.idlegame.entity.enums.BoostType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * Active timed boost for a player.
 */
@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "active_boosts")
public class ActiveBoost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Player player;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BoostType type;

    @Column(nullable = false)
    private double multiplier;

    @Column(nullable = false)
    private Instant expiresAt;
}
