package com.example.idlegame.service.game.boost;

import com.example.idlegame.domain.boost.BoostEffect;
import com.example.idlegame.dto.boost.BoostDto;
import com.example.idlegame.entity.ActiveBoost;
import com.example.idlegame.entity.Player;
import com.example.idlegame.entity.enums.BoostType;
import com.example.idlegame.repository.ActiveBoostRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Manages timed boosts and their effects.
 */
@Service
public class BoostService {
    private final ActiveBoostRepository activeBoostRepository;
    private final Map<BoostType, BoostEffect> effectRegistry;

    public BoostService(ActiveBoostRepository activeBoostRepository, List<BoostEffect> effects) {
        this.activeBoostRepository = activeBoostRepository;
        this.effectRegistry = effects.stream().collect(Collectors.toMap(BoostEffect::getType, Function.identity()));
    }

    /**
     * Returns active non-expired boosts.
     */
    public List<BoostDto> getActiveBoosts(Player player) {
        return activeBoostRepository.findByPlayerAndExpiresAtAfter(player, Instant.now()).stream()
                .map(boost -> BoostDto.builder()
                        .type(boost.getType().name())
                        .multiplier(boost.getMultiplier())
                        .expiresAt(boost.getExpiresAt())
                        .build())
                .toList();
    }

    /**
     * Applies relevant coin multipliers for a player.
     */
    public long applyCoinBoost(Player player, long baseCoins) {
        long result = baseCoins;
        for (ActiveBoost boost : activeBoostRepository.findByPlayerAndExpiresAtAfter(player, Instant.now())) {
            if (boost.getType() == BoostType.COIN_MULTIPLIER) {
                result = effectRegistry.get(boost.getType()).apply(result, boost.getMultiplier());
            }
        }
        return result;
    }

    /**
     * Activates temporary coin boost.
     */
    public void addCoinMultiplierBoost(Player player, double multiplier, long durationSeconds) {
        activeBoostRepository.save(ActiveBoost.builder()
                .player(player)
                .type(BoostType.COIN_MULTIPLIER)
                .multiplier(multiplier)
                .expiresAt(Instant.now().plusSeconds(durationSeconds))
                .build());
    }
}
