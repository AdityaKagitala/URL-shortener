package com.example.urlshortener.dto;

import lombok.Data;

import java.util.Map;


@Data
public class ViewLinkAnalyticsDTO {

    private Long clickCount;
    private Map<String, Integer> platformStats;
}
