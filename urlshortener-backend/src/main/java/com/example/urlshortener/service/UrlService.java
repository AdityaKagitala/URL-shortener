package com.example.urlshortener.service;

import com.example.urlshortener.model.UrlMapping;
import com.example.urlshortener.repository.UrlRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UrlService {

    private final UrlRepository urlrepository;
    private final ShortCodeGenerator codeGenerator;

    // short code length - you can tweak (6 is common)
    private final int codeLength;

    // maximum attempts when checking collisions
    private static final int MAX_GENERATION_ATTEMPTS = 5;

    public UrlService(UrlRepository urlrepository,
                      ShortCodeGenerator codeGenerator,
                      @Value("${app.shortcode.length:6}") int codeLength) {
        this.urlrepository = urlrepository;
        this.codeGenerator = codeGenerator;
        this.codeLength = codeLength;
    }

    /**
     * Create (or reuse) a short code for the given original URL.
     * This implementation always creates a new mapping. You could extend to
     * return existing mapping for the same originalUrl.
     */
    public UrlMapping createShortUrl(String originalUrl) {
        // generate code and ensure no collision
        for (int attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
            String code = codeGenerator.generate(codeLength);
            if (!urlrepository.existsByShortCode(code)) {
                UrlMapping mapping = new UrlMapping(originalUrl, code, Instant.now());
                return urlrepository.save(mapping);
            }
        }
        // if we reach here, throw runtime; in real app choose larger code length
        throw new RuntimeException("Failed to generate unique short code. Try again.");
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
        return urlrepository.findAll();
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