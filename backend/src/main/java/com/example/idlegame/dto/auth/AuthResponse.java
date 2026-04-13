package com.example.idlegame.dto.auth;

import lombok.Builder;
import lombok.Value;

/**
 * JWT response payload.
 */
@Value
@Builder
public class AuthResponse {
    String token;
}
