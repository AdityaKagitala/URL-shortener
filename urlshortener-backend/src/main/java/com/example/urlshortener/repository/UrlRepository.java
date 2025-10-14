package com.example.urlshortener.repository;

import com.example.urlshortener.model.UrlMapping;
import com.example.urlshortener.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UrlRepository extends JpaRepository<UrlMapping, Long> {
    Optional<UrlMapping> findByShortCode(String shortCode);
    boolean existsByShortCode(String shortCode);
    List<UrlMapping> findAllByuser(User user);
}
