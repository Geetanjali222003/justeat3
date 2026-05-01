package com.example.JustEat.service;

import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

public interface CloudinaryService {

    /**     * Upload image to Cloudinary     * @param file the image file     * @param folder folder name (e.g., "restaurants", "menu-items")     * @return Map containing "url" and "publicId"     */
    Map<String, String> uploadImage(MultipartFile file, String folder);

    /**     * Delete image from Cloudinary by publicId     * @param publicId the Cloudinary public ID     */
    void deleteImage(String publicId);
}