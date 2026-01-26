package utils

import (
	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
)

// SaveUploadedFile saves uploaded file to disk dengan unique filename
func SaveUploadedFile(file *multipart.FileHeader, uploadDir string) (string, error) {
	// Validate file extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
		return "", fmt.Errorf("invalid file type. Only JPG, JPEG, and PNG are allowed")
	}

	// Create upload directory if not exists
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		return "", fmt.Errorf("failed to create upload directory: %w", err)
	}

	// Generate unique filename: timestamp_uuid.ext
	timestamp := time.Now().Format("20060102_150405")
	uniqueID := uuid.New().String()[:8]
	filename := fmt.Sprintf("%s_%s%s", timestamp, uniqueID, ext)
	
	filepath := filepath.Join(uploadDir, filename)

	// Open uploaded file
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer src.Close()

	// Create destination file
	dst, err := os.Create(filepath)
	if err != nil {
		return "", fmt.Errorf("failed to create destination file: %w", err)
	}
	defer dst.Close()

	// Copy file content
	if _, err := dst.ReadFrom(src); err != nil {
		return "", fmt.Errorf("failed to save file: %w", err)
	}

	return filepath, nil
}

// DeleteFile deletes file from disk
func DeleteFile(filepath string) error {
	if err := os.Remove(filepath); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("failed to delete file: %w", err)
	}
	return nil
}

// FileExists checks if file exists
func FileExists(filepath string) bool {
	_, err := os.Stat(filepath)
	return !os.IsNotExist(err)
}
