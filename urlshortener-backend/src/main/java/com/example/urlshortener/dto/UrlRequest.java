package com.example.urlshortener.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

public class UrlRequest {

    @NotBlank(message = "originalUrl is required")
    @Size(max = 2000, message = "URL too long")
    private String originalUrl;

    public UrlRequest() {}

    public UrlRequest(String originalUrl) {
        this.originalUrl = originalUrl;
    }

    public String getOriginalUrl() { return originalUrl; }

    public void setOriginalUrl(String originalUrl) { this.originalUrl = originalUrl; }
}
