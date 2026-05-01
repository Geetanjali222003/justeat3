package com.example.JustEat.controller;

import com.example.JustEat.dto.response.ImageUploadResponse;
import com.example.JustEat.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
@Slf4j
public class ImageUploadController {

    private final CloudinaryService cloudinaryService;

    /**
     * Upload restaurant image (OWNER only)
     */
    @PostMapping(value = "/restaurants", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ImageUploadResponse> uploadRestaurantImage(
            @RequestParam("file") MultipartFile file) {

        log.info("Uploading restaurant image: {}", file.getOriginalFilename());

        Map<String, String> result = cloudinaryService.uploadImage(file, "justeat/restaurants");

        ImageUploadResponse response = ImageUploadResponse.builder()
                .url(result.get("url"))
                .publicId(result.get("publicId"))
                .message("Restaurant image uploaded successfully")
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * Upload menu item image (OWNER only)
     */
    @PostMapping(value = "/menu-items", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ImageUploadResponse> uploadMenuItemImage(
            @RequestParam("file") MultipartFile file) {

        log.info("Uploading menu item image: {}", file.getOriginalFilename());

        Map<String, String> result = cloudinaryService.uploadImage(file, "justeat/menu-items");

        ImageUploadResponse response = ImageUploadResponse.builder()
                .url(result.get("url"))
                .publicId(result.get("publicId"))
                .message("Menu item image uploaded successfully")
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * Delete image (OWNER only)
     */
    @DeleteMapping("/{publicId}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<String> deleteImage(@PathVariable String publicId) {
        log.info("Deleting image: {}", publicId);

        // Public ID comes with forward slashes replaced by colons in path variable
        // e.g., justeat:restaurants:abc123 -> justeat/restaurants/abc123
        String actualPublicId = publicId.replace(":", "/");

        cloudinaryService.deleteImage(actualPublicId);

        return ResponseEntity.ok("Image deleted successfully");
    }
}