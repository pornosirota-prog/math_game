package com.example.idlegame.dto.chest;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request payload for chest opening.
 */
@Data
public class OpenChestRequest {
    @NotBlank
    private String chestType;
}
