package com.example.urlshortener.service;

import com.example.urlshortener.model.UrlMapping;
import com.example.urlshortener.model.User;
import com.example.urlshortener.repository.UrlRepository;
import com.example.urlshortener.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UrlService {

    private final UrlRepository urlrepository;
    private final ShortCodeGenerator codeGenerator;
    private final UserRepository userRepository;

    private final User user = new User();

    // short code length - you can tweak (6 is common)
    private final int codeLength;
    // maximum attempts when checking collisions
    private static final int MAX_GENERATION_ATTEMPTS = 5;


    public UrlService(UrlRepository urlrepository,
                      ShortCodeGenerator codeGenerator,
                      @Value("${app.shortcode.length:6}") int codeLength, UserRepository userRepository) {
        this.urlrepository = urlrepository;
        this.codeGenerator = codeGenerator;
        this.codeLength = codeLength;
        this.userRepository = userRepository;
    }

    public String extractDomain(String url) {
        try {
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                url = "https://" + url;  // auto-fix missing scheme
            }

            URI uri = new URI(url);
            String host = uri.getHost();

            if (host == null) {
                throw new RuntimeException("Invalid host");
            }

            return uri.getScheme() + "://" + host;

        } catch (Exception e) {
            System.out.println("DOMAIN ERROR: " + e.getMessage());
            return "https://www.google.com";   // fallback to avoid breaking shortening
        }
    }

    public String getFaviconUrl(String url) {
        String domain = extractDomain(url);
        return domain + "/favicon.ico";
    }
    public String getFaviconWithFallback(String url) {
        String domain = extractDomain(url);

        return "https://www.google.com/s2/favicons?domain=" + domain;
    }


    @Transactional
    public UrlMapping createShortUrl(String originalUrl, String customAlias) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // Custom alias
        if (customAlias != null && !customAlias.isBlank()) {

            if (urlrepository.existsByShortCode(customAlias)) {
                throw new RuntimeException("Custom alias already taken!");
            }

            UrlMapping mapping = UrlMapping.builder()
                    .originalUrl(originalUrl)
                    .shortCode(customAlias)
                    .createdAt(Instant.now())
                    .clickCount(0L)
                    .user(user)
                    .faviconUrl(getFaviconUrl(originalUrl))
                    .build();

            return urlrepository.save(mapping);
        }

        // STEP 1 — Save without shortcode so DB generates ID
        UrlMapping tmp = UrlMapping.builder()
                .originalUrl(originalUrl)
                .createdAt(Instant.now())
                .clickCount(0L)
                .user(user)
                .faviconUrl(getFaviconUrl(originalUrl))
                .build();

        tmp = urlrepository.save(tmp);

        // STEP 2 — Encode ID to Base62 with your generator
        String shortCode = codeGenerator.encodeBase62(tmp.getId());

        // STEP 3 — Save again with shortCode
        tmp.setShortCode(shortCode);
        return urlrepository.save(tmp);
    }



    /**
     * Find mapping by shortCode
     */
    @Transactional
    public Optional<UrlMapping> findByShortCode(String shortCode) {
        return urlrepository.findByShortCode(shortCode);
    }

    /**
     * Increment click count (inside transaction)
     */
    @Transactional
    public void incrementClicks(UrlMapping mapping) {
        mapping.incrementClickCount();
        urlrepository.save(mapping);
    }

    public List<UrlMapping> getHistory(){
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