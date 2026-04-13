package com.example.idlegame.dto.chest;

import lombok.Builder;
import lombok.Value;

/**
 * Public chest metadata.
 */
@Value
@Builder
public class ChestDefinitionDto {
    String chestType;
    String title;
    String description;
}
