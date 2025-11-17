package com.example.urlshortener.service;

import org.springframework.stereotype.Component;
import java.security.SecureRandom;

@Component
public class ShortCodeGenerator {

    private static final String BASE62 = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    public String encodeBase62(long id) {
        StringBuilder sb = new StringBuilder();

        if (id == 0) return "0";

        while (id > 0) {
            int remainder = (int) (id % 62);
            sb.append(BASE62.charAt(remainder));
            id /= 62;
        }

        return sb.reverse().toString();
    }
}