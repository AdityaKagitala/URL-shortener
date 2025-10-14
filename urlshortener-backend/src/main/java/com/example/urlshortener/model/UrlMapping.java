package com.example.urlshortener.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "url_mappings", indexes = {
        @Index(name = "idx_shortcode", columnList = "shortCode", unique = true)
})
public class UrlMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 2000)
    private String originalUrl;

    @Column(nullable = false, unique = true, length = 50)
    private String shortCode;

    @Column(nullable = false)
    private Instant createdAt;

    @Column(nullable = false)
    private Long clickCount = 0L;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public UrlMapping(String originalUrl, String shortCode, Instant createdAt, User user) {
        this.originalUrl = originalUrl;
        this.shortCode = shortCode;
        this.createdAt = createdAt;
        this.user = user;
    }

    public void incrementClickCount() { this.clickCount = this.clickCount + 1; }
}
