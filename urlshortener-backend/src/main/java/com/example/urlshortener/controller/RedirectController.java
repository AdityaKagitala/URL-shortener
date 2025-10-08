package com.example.urlshortener.controller;

import com.example.urlshortener.model.UrlMapping;
import com.example.urlshortener.service.UrlService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@Controller
public class RedirectController {

    private final UrlService urlService;

    public RedirectController(UrlService urlService) {
        this.urlService = urlService;
    }

    @GetMapping("/{shortCode}")
    public ResponseEntity<Object> redirect(@PathVariable String shortCode) {
        return urlService.findByShortCode(shortCode)
                .map(mapping -> {

                    urlService.incrementClicks(mapping);

                    // redirect (302) to original URL
                    HttpHeaders headers = new HttpHeaders();
                    headers.setLocation(URI.create(mapping.getOriginalUrl()));
                    return ResponseEntity.status(302).headers(headers).build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

}