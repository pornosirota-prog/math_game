package com.example.idlegame.repository;

import com.example.idlegame.entity.Player;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Player persistence operations.
 */
public interface PlayerRepository extends JpaRepository<Player, Long> {
    /**
     * Finds player by email.
     *
     * @param email unique email.
     * @return optional player.
     */
    Optional<Player> findByEmail(String email);
}
