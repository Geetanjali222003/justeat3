package com.example.JustEat.service;

import com.example.JustEat.dto.request.RatingRequest;
import com.example.JustEat.dto.response.MostOrderedItemResponse;

import java.util.List;

public interface RatingService {
    String saveRating(RatingRequest request);
    List<MostOrderedItemResponse> getMostOrderedItems();
}

