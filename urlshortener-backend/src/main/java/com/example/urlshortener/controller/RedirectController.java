package com.example.urlshortener.controller;

import com.example.urlshortener.dto.ViewLinkAnalyticsDTO;
import com.example.urlshortener.model.UrlMapping;
import com.example.urlshortener.model.ViewLink;
import com.example.urlshortener.repository.ViewLinkRepository;
import com.example.urlshortener.service.UrlService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Controller
public class RedirectController {

    private final UrlService urlService;
    private final ViewLinkRepository viewLinkRepository;

    public RedirectController(UrlService urlService, ViewLinkRepository viewLinkRepository) {
        this.urlService = urlService;
        this.viewLinkRepository = viewLinkRepository;
    }

    @GetMapping("/{shortCode}")
    public ResponseEntity<Object> redirect(@PathVariable String shortCode, HttpServletRequest request) {

        /* String referer = request.getHeader("referer"); */
        String userAgent = request.getHeader("User-Agent");

        UrlMapping mapping = urlService.findByShortCode(shortCode).orElseThrow(() -> new RuntimeException("Not Found"));

        // Detect platform
        String platform = "Unknown";
        if (userAgent != null) {
            String ua = userAgent.toLowerCase();
            if (ua.contains("facebook")) platform = "Facebook";
            else if (ua.contains("twitter")) platform = "Twitter";
            else if (ua.contains("instagram")) platform = "Instagram";
            else if (ua.contains("whatsapp")) platform = "WhatsApp";
            else if (ua.contains("linkedin")) platform = "LinkedIn";
            else platform = "Other";
        }

        ViewLink viewLink = new ViewLink();
        viewLink.setUrlMapping(mapping);
        viewLink.setPlatform(platform);
        viewLinkRepository.save(viewLink);

        urlService.incrementClicks(mapping);

        // redirect (302) to original URL
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(mapping.getOriginalUrl()));

        return ResponseEntity.status(302).headers(headers).build();
    }

    @GetMapping("/viewLink/{shortCode}")
    public ResponseEntity<ViewLinkAnalyticsDTO> viewLinkDetails(@PathVariable String shortCode) {
        Optional<UrlMapping> mapping = urlService.findByShortCode(shortCode);

        List<ViewLink> viewLink = viewLinkRepository.findByUrlMapping(mapping);

        Map<String, Integer> platformStats = viewLink.stream()
                .collect(Collectors.groupingBy(
                        ViewLink::getPlatform,
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));

        ViewLinkAnalyticsDTO dto = new ViewLinkAnalyticsDTO();
        dto.setClickCount(mapping.get().getClickCount());
        dto.setPlatformStats(platformStats);

        return ResponseEntity.ok(dto);
    }

}
