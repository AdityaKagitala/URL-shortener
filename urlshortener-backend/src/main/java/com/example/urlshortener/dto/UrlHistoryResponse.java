package com.example.urlshortener.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class UrlHistoryResponse {
    private String originalUrl;
    private String shortUrl;
    private Instant createdAt;
    private String shortCode;
    private String faviconUrl;


    public UrlHistoryResponse() {}

    public UrlHistoryResponse(String originalUrl, String shortUrl, Instant createdAt,String shortCode,String faviconUrl) {
        this.originalUrl = originalUrl;
        this.shortUrl = shortUrl;
        this.createdAt = createdAt;
        this.shortCode = shortCode;
        this.faviconUrl = faviconUrl;
    }
}
