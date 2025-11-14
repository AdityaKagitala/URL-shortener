package com.example.urlshortener.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class UrlResponse {
    private String originalUrl;
    private String shortUrl;
    private String shortCode;
    private String faviconUrl;

    public UrlResponse() {}

    public UrlResponse(String originalUrl, String shortUrl, String shortCode,String faviconUrl) {
        this.originalUrl = originalUrl;
        this.shortUrl = shortUrl;
        this.shortCode = shortCode;
        this.faviconUrl = faviconUrl;
    }

}
