package com.example.idlegame.controller;

import com.example.idlegame.dto.chest.ChestDefinitionDto;
import com.example.idlegame.dto.chest.OpenChestRequest;
import com.example.idlegame.dto.chest.OpenChestResponse;
import com.example.idlegame.service.game.chest.ChestService;
import com.example.idlegame.service.player.CurrentPlayerService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Chest endpoints.
 */
@RestController
@RequestMapping("/api/chest")
public class ChestController {
    private final ChestService chestService;
    private final CurrentPlayerService currentPlayerService;

    public ChestController(ChestService chestService, CurrentPlayerService currentPlayerService) {
        this.chestService = chestService;
        this.currentPlayerService = currentPlayerService;
    }

    /**
     * Lists available chest types.
     */
    @GetMapping("/list")
    public List<ChestDefinitionDto> list() {
        return chestService.listChests();
    }

    /**
     * Opens selected chest type.
     */
    @PostMapping("/open")
    public OpenChestResponse open(@Valid @RequestBody OpenChestRequest request) {
        return chestService.openChest(currentPlayerService.getCurrentPlayer().getId(), request.getChestType());
    }
}
