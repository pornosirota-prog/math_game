package com.example.idlegame.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Centralized frontend/backend absolute URLs used in auth redirects and CORS.
 */
@Component
@ConfigurationProperties(prefix = "app.urls")
public class AppUrlProperties {
    private String frontendBaseUrl;
    private String backendBaseUrl;

    public String getFrontendBaseUrl() {
        return frontendBaseUrl;
    }

    public void setFrontendBaseUrl(String frontendBaseUrl) {
        this.frontendBaseUrl = normalize(frontendBaseUrl);
    }

    public String getBackendBaseUrl() {
        return backendBaseUrl;
    }

    public void setBackendBaseUrl(String backendBaseUrl) {
        this.backendBaseUrl = normalize(backendBaseUrl);
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }
        return value.replaceAll("/+$", "").trim();
    }
}
