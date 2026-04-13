package com.example.idlegame.repository;

import com.example.idlegame.entity.ActiveBoost;
import com.example.idlegame.entity.Player;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

/**
 * Repository for active boosts.
 */
public interface ActiveBoostRepository extends JpaRepository<ActiveBoost, Long> {
    /**
     * Returns non-expired boosts for player.
     */
    List<ActiveBoost> findByPlayerAndExpiresAtAfter(Player player, Instant now);
}
