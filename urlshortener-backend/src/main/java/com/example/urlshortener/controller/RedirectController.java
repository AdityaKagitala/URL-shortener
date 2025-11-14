package com.example.urlshortener.controller;

import com.example.urlshortener.dto.ViewLinkAnalyticsDTO;
import com.example.urlshortener.model.UrlMapping;
import com.example.urlshortener.model.ViewLink;
import com.example.urlshortener.repository.ViewLinkRepository;
import com.example.urlshortener.service.UrlService;
import com.example.urlshortener.service.ViewLinkService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@Controller
public class RedirectController {

    private final UrlService urlService;
    private final ViewLinkRepository viewLinkRepository;
    private final ViewLinkService viewLinkService;

    public RedirectController(UrlService urlService,
                              ViewLinkRepository viewLinkRepository,
                              ViewLinkService viewLinkService) {
        this.urlService = urlService;
        this.viewLinkRepository = viewLinkRepository;
        this.viewLinkService = viewLinkService;
    }
    @GetMapping("/{shortCode}")
    public ResponseEntity<Object> redirect(@PathVariable String shortCode, HttpServletRequest request) {


        UrlMapping mapping = urlService.findByShortCode(shortCode)
                .orElseThrow(() -> new RuntimeException("Not Found"));

        String originalUrl = mapping.getOriginalUrl();
        if (originalUrl == null) {
            return ResponseEntity.notFound().build();
        }
        // Device detection
        String userAgent = request.getHeader("User-Agent").toLowerCase();
        String deviceType = userAgent.contains("mobi") ? "mobile" : "desktop";

        // Browser detection
        String browser = getBrowser(userAgent);

        // Referrer
        String referrer = request.getHeader("Referer");
        String platform = getReferringPlatform(referrer);


        //Save click info
        viewLinkService.saveClickData(shortCode,deviceType,referrer,platform,browser);


        // Total ClickCount
        urlService.incrementClicks(mapping);

        // redirect (302) to original URL
        HttpHeaders headers = new HttpHeaders();
        headers.add("Location",originalUrl);

        return new ResponseEntity<>(headers,HttpStatus.FOUND);

    }

    private String getReferringPlatform(String referrer) {
        if (referrer == null || referrer.isEmpty()) return "Direct";

        referrer = referrer.toLowerCase();

        if (referrer.contains("facebook.com")) return "Facebook";
        if (referrer.contains("twitter.com")) return "Twitter";
        if (referrer.contains("t.me") || referrer.contains("telegram.me")) return "Telegram";
        if (referrer.contains("youtube.com") || referrer.contains("youtu.be")) return "YouTube";
        if (referrer.contains("linkedin.com")) return "LinkedIn";
        if (referrer.contains("instagram.com")) return "Instagram";

        // Fallback: extract domain from URL
        try {
            java.net.URI uri = new java.net.URI(referrer);
            String host = uri.getHost();
            if (host == null) return "Unknown";
            if (host.startsWith("www.")) host = host.substring(4);
            return host;
        } catch (Exception e) {
            return "Unknown";
        }
    }

        private String getBrowser(String userAgent) {
            if (userAgent.contains("chrome") && !userAgent.contains("edge") && !userAgent.contains("opr")) {
                return "Chrome";
            } else if (userAgent.contains("firefox")) {
                return "Firefox";
            } else if (userAgent.contains("safari") && !userAgent.contains("chrome")) {
                return "Safari";
            } else if (userAgent.contains("edge")) {
                return "Edge";
            } else if (userAgent.contains("opr") || userAgent.contains("opera")) {
                return "Opera";
            }
            return "Unknown";
        }


  @GetMapping("/viewLink/{shortCode}")
    public ResponseEntity<List<ViewLinkAnalyticsDTO>> viewLinkDetails(@PathVariable String shortCode) {
        Optional<UrlMapping> mappingOpt = urlService.findByShortCode(shortCode);

      if (mappingOpt.isEmpty()) {
          return ResponseEntity.notFound().build();
      }


      UrlMapping mapping = mappingOpt.get();
      List<ViewLink> viewLinks = viewLinkRepository.findByUrlMapping(mapping);

      List<ViewLinkAnalyticsDTO> dtoList = viewLinks.stream().map(viewLink -> {
          ViewLinkAnalyticsDTO dto = new ViewLinkAnalyticsDTO();
          dto.setClickCount(mapping.getClickCount()); // total clicks for URL
          dto.setOriginalUrl(mapping.getOriginalUrl());
          dto.setShortCode(mapping.getShortCode());
          dto.setDeviceType(viewLink.getDeviceType());
          dto.setCountry(viewLink.getCountry());
          dto.setRegion(viewLink.getRegion());
          dto.setReferrer(viewLink.getReferrer());
          dto.setClickedAt(viewLink.getClickedAt());
          dto.setPlatform(viewLink.getPlatform());
          dto.setBrowser(viewLink.getBrowser());
          return dto;
      }).toList();

      return ResponseEntity.ok(dtoList);

  }

}
