package com.example.JustEat.service.Impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.JustEat.exception.BadRequestException;
import com.example.JustEat.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @Override
    public Map<String, String> uploadImage(MultipartFile file, String folder) {
        validateFile(file);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "image",
                            "quality", "auto"
                    )
            );

            Map<String, String> result = new HashMap<>();
            result.put("url", (String) uploadResult.get("secure_url"));
            result.put("publicId", (String) uploadResult.get("public_id"));

            log.info("Image uploaded successfully: {}", result.get("publicId"));
            return result;

        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary", e);
            throw new BadRequestException("Failed to upload image: " + e.getMessage());
        }
    }

    @Override
    public void deleteImage(String publicId) {
        if (publicId == null || publicId.trim().isEmpty()) {
            return;
        }

        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Image deleted successfully: {}", publicId);
        } catch (IOException e) {
            log.error("Failed to delete image from Cloudinary: {}", publicId, e);
            // Don't throw exception on delete failure - log and continue
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File cannot be empty");
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("File size exceeds maximum limit of 5MB");
        }

        // Check content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException(
                    "Invalid file type. Allowed types: JPEG, PNG, WEBP, GIF"
            );
        }
    }
}