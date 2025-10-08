package com.example.urlshortener.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class UrlResponse {
    private String originalUrl;
    private String shortUrl;
    private String shortCode;

    public UrlResponse() {}

    public UrlResponse(String originalUrl, String shortUrl, String shortCode) {
        this.originalUrl = originalUrl;
        this.shortUrl = shortUrl;
        this.shortCode = shortCode;
    }

}
