package com.example.urlshortener.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Setter
@Getter
public class UrlRequest {

    @NotBlank(message = "originalUrl is required")
    @Size(max = 2000, message = "URL too long")
    private String originalUrl;
    private String customAlias;

}
