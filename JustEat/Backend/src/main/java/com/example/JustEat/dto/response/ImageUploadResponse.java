package com.example.JustEat.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class ImageUploadResponse {
    private String url;
    private String publicId;
    private String message;
}