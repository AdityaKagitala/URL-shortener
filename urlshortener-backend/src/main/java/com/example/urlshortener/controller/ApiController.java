package com.example.urlshortener.controller;

import com.example.urlshortener.dto.UrlHistoryResponse;
import com.example.urlshortener.dto.UrlRequest;
import com.example.urlshortener.dto.UrlResponse;
import com.example.urlshortener.dto.StatsResponse;
import com.example.urlshortener.model.UrlMapping;
import com.example.urlshortener.service.UrlService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000/")
@RestController
@RequestMapping("/api")
public class ApiController {

    private final UrlService urlService;
    private final String appBaseUrl;

    public ApiController(UrlService urlService,@Value("${app.base.url:http://localhost:8080}") String appBaseUrl) {
        this.urlService = urlService;
        this.appBaseUrl = appBaseUrl;
    }

    @PostMapping("/shorten")
    public ResponseEntity<UrlResponse> shorten(@Valid @RequestBody UrlRequest req) {

        UrlMapping mapping = urlService.createShortUrl(req.getOriginalUrl());

        String shortUrl = appBaseUrl.endsWith("/") ? appBaseUrl + mapping.getShortCode()
                                                   : appBaseUrl + "/" + mapping.getShortCode();

        UrlResponse resp = new UrlResponse(mapping.getOriginalUrl(),
                                            shortUrl,
                                            mapping.getShortCode());
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @GetMapping("/stats/{shortCode}")
    public ResponseEntity<StatsResponse> stats(@PathVariable String shortCode) {
        return urlService.findByShortCode(shortCode)
                         .map(m -> { StatsResponse s = new StatsResponse(m.getShortCode(), m.getOriginalUrl(),
                                 m.getClickCount(), m.getCreatedAt());
                          return ResponseEntity.ok(s);
                          }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/history")
    public ResponseEntity<List<UrlHistoryResponse>> getHistory() {
        List<UrlMapping> mappings = urlService.getHistory();

        List<UrlHistoryResponse> responseList = mappings.stream().map (mapping -> {
                    String shortUrl = appBaseUrl.endsWith("/") ? appBaseUrl + mapping.getShortCode()
                                                               : appBaseUrl + "/" + mapping.getShortCode();

                    return new UrlHistoryResponse (mapping.getOriginalUrl(), shortUrl, mapping.getCreatedAt(), mapping.getShortCode());
                    }).toList();
        return ResponseEntity.ok(responseList);
    }

    @DeleteMapping("/delete/{shortCode}")
    public ResponseEntity<Void> deleteUrl(@PathVariable String shortCode) {
        boolean deleted = urlService.deleteByShortCode(shortCode);
        return deleted ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }



}