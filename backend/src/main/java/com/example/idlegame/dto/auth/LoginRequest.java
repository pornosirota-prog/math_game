package com.example.idlegame.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request DTO for local login.
 */
@Data
public class LoginRequest {
    @Email
    private String email;
    @NotBlank
    private String password;
}
