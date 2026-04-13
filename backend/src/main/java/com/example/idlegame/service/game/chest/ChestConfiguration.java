package com.example.idlegame.service.game.chest;

import com.example.idlegame.domain.chest.ChestConfig;
import com.example.idlegame.domain.reward.RewardConfig;
import com.example.idlegame.entity.enums.RewardType;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * In-memory MVP chest config registry.
 */
@Configuration
public class ChestConfiguration {
    /**
     * Provides base chest configs. Can be replaced by DB/content files later.
     */
    @Bean
    public List<ChestConfig> chestConfigs() {
        return List.of(
                ChestConfig.builder()
                        .type("WOODEN")
                        .title("Wooden Chest")
                        .description("Common starter rewards")
                        .rewards(List.of(
                                RewardConfig.builder().rewardType(RewardType.COINS).minValue(10).maxValue(30).build(),
                                RewardConfig.builder().rewardType(RewardType.EXPERIENCE).minValue(10).maxValue(20).build()))
                        .build(),
                ChestConfig.builder()
                        .type("SILVER")
                        .title("Silver Chest")
                        .description("Better rewards and possible boost")
                        .rewards(List.of(
                                RewardConfig.builder().rewardType(RewardType.COINS).minValue(30).maxValue(70).build(),
                                RewardConfig.builder().rewardType(RewardType.EXPERIENCE).minValue(20).maxValue(45).build(),
                                RewardConfig.builder().rewardType(RewardType.TEMP_BOOST).minValue(1).maxValue(120).build()))
                        .build());
    }
}
