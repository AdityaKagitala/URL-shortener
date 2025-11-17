package com.example.urlshortener.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Builder;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder

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

    private String faviconUrl;

    //Link Preview
    private String title;
    private String description;
    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

   @OneToMany(mappedBy = "urlMapping", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ViewLink> viewLinks = new ArrayList<>();


    public UrlMapping(String originalUrl, String shortCode, Instant createdAt, User user) {
        this.originalUrl = originalUrl;
        this.shortCode = shortCode;
        this.createdAt = createdAt;
        this.user = user;
    }

    public void incrementClickCount() { this.clickCount = this.clickCount + 1; }
}
