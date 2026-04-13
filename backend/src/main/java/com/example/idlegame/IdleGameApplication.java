package com.example.idlegame;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for Idle Incremental Game backend.
 */
@SpringBootApplication
public class IdleGameApplication {

    /**
     * Bootstraps Spring Boot application.
     *
     * @param args startup arguments.
     */
    public static void main(String[] args) {
        SpringApplication.run(IdleGameApplication.class, args);
    }
}
