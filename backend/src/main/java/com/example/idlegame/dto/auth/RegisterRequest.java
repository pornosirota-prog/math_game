package com.example.idlegame.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request DTO for local registration.
 */
@Data
public class RegisterRequest {
    @Email
    private String email;
    @NotBlank
    private String password;
    @NotBlank
    private String displayName;
}
