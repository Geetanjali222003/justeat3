package com.example.JustEat.service;

import com.example.JustEat.dto.request.PreferenceRequest;
import com.example.JustEat.dto.response.MenuItemResponse;
import com.example.JustEat.dto.response.PreferenceResponse;
import com.example.JustEat.dto.response.RecommendationResponse;

import java.util.List;
import java.util.UUID;

public interface PreferenceService {
    PreferenceResponse savePreferences(PreferenceRequest request);
    PreferenceResponse getPreferences(UUID userId);
    RecommendationResponse getRecommendations(UUID userId);
    List<MenuItemResponse> getSpecialsAndDeals();
}

