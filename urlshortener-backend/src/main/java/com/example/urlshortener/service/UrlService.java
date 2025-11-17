package com.example.urlshortener.service;

import com.example.urlshortener.dto.UrlPreview;
import com.example.urlshortener.model.UrlMapping;
import com.example.urlshortener.model.User;
import com.example.urlshortener.repository.UrlRepository;
import com.example.urlshortener.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UrlService {

    private final UrlRepository urlrepository;
    private final ShortCodeGenerator codeGenerator;
    private final UserRepository userRepository;

    @Value("${app.shortcode.length:6}")
    private int codeLength;

    private static final int MAX_GENERATION_ATTEMPTS = 5;

    // ----------------- LINK PREVIEW EXTRACTOR -----------------
    public UrlPreview fetchPreviewMetadata(String url) {
        try {
            Document doc = Jsoup.connect(url).timeout(5000).get();

            String title = doc.select("meta[property=og:title]").attr("content");
            if (title.isEmpty()) title = doc.title();

            String description = doc.select("meta[property=og:description]").attr("content");
            if (description.isEmpty())
                description = doc.select("meta[name=description]").attr("content");

            String image = doc.select("meta[property=og:image]").attr("content");

            String domain = extractDomain(url);

            return new UrlPreview(
                    title != null ? title : "No title",
                    description != null ? description : "No description",
                    image,
                    domain + "/favicon.ico"
            );

        } catch (Exception e) {
            return new UrlPreview(
                    "Preview Not Available",
                    "No description found",
                    null,
                    "https://www.google.com/s2/favicons?domain=" + url
            );
        }
    }


    // ----------------- SHORT URL CREATION -----------------
    @Transactional
    public UrlMapping createShortUrl(String originalUrl, String customAlias) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // ⭐ CUSTOM ALIAS ----------------------------------
        if (customAlias != null && !customAlias.isBlank()) {
            String alias = customAlias.trim();
            if (urlrepository.existsByShortCode(alias)) {
                throw new RuntimeException("Custom alias already taken!");
            }

            // Fetch preview metadata
            UrlPreview preview = fetchPreviewMetadata(originalUrl);

            UrlMapping mapping = UrlMapping.builder()
                    .originalUrl(originalUrl)
                    .shortCode(alias)
                    .createdAt(Instant.now())
                    .clickCount(0L)
                    .user(user)
                    .faviconUrl(getFaviconUrl(originalUrl))
                    .title(preview.getTitle())
                    .description(preview.getDescription())
                    .imageUrl(preview.getImage())
                    .build();

            return urlrepository.save(mapping);
        }

        // ⭐ AUTO-GENERATED SHORT CODE -----------------------
        int maxAttempts = 5;
        for (int attempt = 0; attempt < maxAttempts; attempt++) {

            String code = codeGenerator.random(codeLength);

            // Fetch preview metadata
            UrlPreview preview = fetchPreviewMetadata(originalUrl);

            UrlMapping mapping = UrlMapping.builder()
                    .originalUrl(originalUrl)
                    .shortCode(code)
                    .createdAt(Instant.now())
                    .clickCount(0L)
                    .user(user)
                    .faviconUrl(getFaviconUrl(originalUrl))
                    .title(preview.getTitle())
                    .description(preview.getDescription())
                    .imageUrl(preview.getImage())
                    .build();
            try {
                return urlrepository.save(mapping);

            } catch (org.springframework.dao.DataIntegrityViolationException ex) {
                // collision → retry with new code
            }
        }

        throw new RuntimeException("Failed to generate unique shortcode after " + maxAttempts + " attempts");
    }


    // ----------------- DOMAIN & FAVICON -----------------
    public String extractDomain(String url) {
        try {
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                url = "https://" + url;
            }
            URI uri = new URI(url);
            String host = uri.getHost();
            if (host == null) throw new RuntimeException("Invalid host");
            return uri.getScheme() + "://" + host;
        } catch (Exception e) {
            System.out.println("DOMAIN ERROR: " + e.getMessage());
            return "https://www.google.com";
        }
    }

    public String getFaviconUrl(String url) {
        return extractDomain(url) + "/favicon.ico";
    }

    public String getFaviconWithFallback(String url) {
        return "https://www.google.com/s2/favicons?domain=" + extractDomain(url);
    }


    // ----------------- OTHER SERVICES -----------------
    @Transactional
    public Optional<UrlMapping> findByShortCode(String shortCode) {
        return urlrepository.findByShortCode(shortCode);
    }

    @Transactional
    public void incrementClicks(UrlMapping mapping) {
        mapping.incrementClickCount();
        urlrepository.save(mapping);
    }

    public List<UrlMapping> getHistory() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        return urlrepository.findAllByuser(user);
    }

    public boolean deleteByShortCode(String shortCode) {
        Optional<UrlMapping> mapping = urlrepository.findByShortCode(shortCode);
        if (mapping.isPresent()) {
            urlrepository.delete(mapping.get());
            return true;
        }
        return false;
    }
}