package com.example.idlegame.service.game.chest;

import com.example.idlegame.domain.chest.ChestConfig;
import com.example.idlegame.dto.chest.ChestDefinitionDto;
import com.example.idlegame.dto.chest.OpenChestResponse;
import com.example.idlegame.dto.reward.RewardResultDto;
import com.example.idlegame.entity.Player;
import com.example.idlegame.repository.PlayerRepository;
import com.example.idlegame.service.game.reward.RewardService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Handles chest listings and opening flow.
 */
@Service
public class ChestService {
    private final Map<String, ChestConfig> chestRegistry;
    private final RewardService rewardService;
    private final PlayerRepository playerRepository;

    public ChestService(List<ChestConfig> chestConfigs, RewardService rewardService, PlayerRepository playerRepository) {
        this.chestRegistry = chestConfigs.stream().collect(Collectors.toMap(ChestConfig::getType, Function.identity()));
        this.rewardService = rewardService;
        this.playerRepository = playerRepository;
    }

    /**
     * Lists available chest definitions.
     */
    public List<ChestDefinitionDto> listChests() {
        return chestRegistry.values().stream()
                .map(chest -> ChestDefinitionDto.builder()
                        .chestType(chest.getType())
                        .title(chest.getTitle())
                        .description(chest.getDescription())
                        .build())
                .toList();
    }

    /**
     * Opens chest and applies all configured rewards.
     */
    @Transactional
    public OpenChestResponse openChest(Long playerId, String chestType) {
        Player player = playerRepository.findById(playerId).orElseThrow(() -> new EntityNotFoundException("Player not found"));
        ChestConfig config = chestRegistry.get(chestType);
        if (config == null) {
            throw new IllegalArgumentException("Unknown chest type: " + chestType);
        }
        List<RewardResultDto> rewards = config.getRewards().stream()
                .map(reward -> rewardService.applyReward(player, reward))
                .map(applied -> RewardResultDto.builder().type(applied.getType()).description(applied.getDescription()).build())
                .toList();
        playerRepository.save(player);
        return OpenChestResponse.builder().chestType(chestType).rewards(rewards).build();
    }
}
