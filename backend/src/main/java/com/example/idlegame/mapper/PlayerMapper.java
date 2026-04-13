package com.example.idlegame.mapper;

import com.example.idlegame.dto.player.PlayerProfileDto;
import com.example.idlegame.entity.Player;
import org.mapstruct.Mapper;

/**
 * Maps player entity to public DTO.
 */
@Mapper(componentModel = "spring")
public interface PlayerMapper {
    /**
     * Converts entity into profile dto.
     *
     * @param player entity.
     * @return dto.
     */
    PlayerProfileDto toProfile(Player player);
}
