package com.example.idlegame.service.player;

import com.example.idlegame.entity.Player;
import com.example.idlegame.repository.PlayerRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Resolves current authenticated player.
 */
@Service
public class CurrentPlayerService {
    private final PlayerRepository playerRepository;

    public CurrentPlayerService(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }

    /**
     * Fetches current authenticated player from security context.
     */
    public Player getCurrentPlayer() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new EntityNotFoundException("No authenticated user");
        }
        return playerRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new EntityNotFoundException("Player not found for email: " + auth.getName()));
    }
}
