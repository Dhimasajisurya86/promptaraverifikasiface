package services

import (
	"encoding/json"
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"math"
	"os"

	"github.com/corona10/goimagehash"
)

// FaceService handles face verification operations
type FaceService struct{}

// NewFaceService creates a new FaceService instance
func NewFaceService() *FaceService {
	return &FaceService{}
}

// FaceDescriptor represents face embedding data
// Dalam implementasi sederhana ini, kita gunakan perceptual hash
type FaceDescriptor struct {
	PHash uint64 `json:"phash"` // Perceptual hash
	AHash uint64 `json:"ahash"` // Average hash
	DHash uint64 `json:"dhash"` // Difference hash
}

// ExtractFaceDescriptor extracts face features from image
// CATATAN: Ini adalah implementasi SEDERHANA menggunakan image hashing
// Untuk production, gunakan face recognition API seperti:
// - AWS Rekognition
// - Face++ API
// - Azure Face API
// - Atau microservice Python dengan face_recognition library
func (fs *FaceService) ExtractFaceDescriptor(imagePath string) (string, error) {
	// Buka file gambar
	file, err := os.Open(imagePath)
	if err != nil {
		return "", fmt.Errorf("failed to open image: %w", err)
	}
	defer file.Close()

	// Decode image
	img, _, err := image.Decode(file)
	if err != nil {
		return "", fmt.Errorf("failed to decode image: %w", err)
	}

	// Generate multiple hash untuk akurasi lebih baik
	pHash, err := goimagehash.PerceptionHash(img)
	if err != nil {
		return "", fmt.Errorf("failed to generate perceptual hash: %w", err)
	}

	aHash, err := goimagehash.AverageHash(img)
	if err != nil {
		return "", fmt.Errorf("failed to generate average hash: %w", err)
	}

	dHash, err := goimagehash.DifferenceHash(img)
	if err != nil {
		return "", fmt.Errorf("failed to generate difference hash: %w", err)
	}

	// Buat descriptor object
	descriptor := FaceDescriptor{
		PHash: pHash.GetHash(),
		AHash: aHash.GetHash(),
		DHash: dHash.GetHash(),
	}

	// Convert ke JSON string
	descriptorJSON, err := json.Marshal(descriptor)
	if err != nil {
		return "", fmt.Errorf("failed to marshal descriptor: %w", err)
	}

	return string(descriptorJSON), nil
}

// CompareFaces membandingkan dua face descriptor dan return similarity score
// Score: 0.0 (completely different) - 1.0 (identical)
func (fs *FaceService) CompareFaces(descriptor1JSON, descriptor2JSON string) (float64, error) {
	// Parse descriptor 1
	var desc1 FaceDescriptor
	if err := json.Unmarshal([]byte(descriptor1JSON), &desc1); err != nil {
		return 0, fmt.Errorf("failed to parse descriptor 1: %w", err)
	}

	// Parse descriptor 2
	var desc2 FaceDescriptor
	if err := json.Unmarshal([]byte(descriptor2JSON), &desc2); err != nil {
		return 0, fmt.Errorf("failed to parse descriptor 2: %w", err)
	}

	// Hitung hamming distance untuk setiap hash
	pHashDistance := hammingDistance(desc1.PHash, desc2.PHash)
	aHashDistance := hammingDistance(desc1.AHash, desc2.AHash)
	dHashDistance := hammingDistance(desc1.DHash, desc2.DHash)

	// Average distance (max 64 bits per hash)
	avgDistance := float64(pHashDistance+aHashDistance+dHashDistance) / 3.0

	// Convert ke similarity score (0-1)
	// Hamming distance 0 = identical, 64 = completely different
	// Kita normalize dan invert: similarity = 1 - (distance / 64)
	similarity := 1.0 - (avgDistance / 64.0)

	// Ensure similarity dalam range [0, 1]
	similarity = math.Max(0, math.Min(1, similarity))

	return similarity, nil
}

// VerifyFace verifies if uploaded face matches reference descriptor
func (fs *FaceService) VerifyFace(uploadedImagePath, referenceDescriptorJSON string, threshold float64) (bool, float64, error) {
	// Extract descriptor dari uploaded image
	uploadedDescriptor, err := fs.ExtractFaceDescriptor(uploadedImagePath)
	if err != nil {
		return false, 0, fmt.Errorf("failed to extract face descriptor: %w", err)
	}

	// Compare dengan reference descriptor
	similarity, err := fs.CompareFaces(uploadedDescriptor, referenceDescriptorJSON)
	if err != nil {
		return false, 0, fmt.Errorf("failed to compare faces: %w", err)
	}

	// Check if similarity meets threshold
	isMatch := similarity >= threshold

	return isMatch, similarity, nil
}

// hammingDistance calculates hamming distance between two uint64 values
func hammingDistance(hash1, hash2 uint64) int {
	// XOR untuk find different bits
	diff := hash1 ^ hash2

	// Count set bits
	count := 0
	for diff != 0 {
		count++
		diff &= diff - 1 // Clear least significant bit
	}

	return count
}

/*
PENJELASAN ALGORITMA:

1. IMAGE HASHING:
   - Menggunakan 3 jenis hash: Perceptual, Average, dan Difference Hash
   - Setiap hash menghasilkan 64-bit fingerprint dari gambar
   - Hash ini robust terhadap minor changes (resize, compression, brightness)

2. HAMMING DISTANCE:
   - Mengukur berapa banyak bit yang berbeda antara 2 hash
   - Distance 0 = identik, 64 = completely different

3. SIMILARITY SCORE:
   - Convert distance ke similarity: 1 - (distance/64)
   - Range 0.0 (beda) sampai 1.0 (sama)

KELEBIHAN PENDEKATAN INI:
✅ Pure Go, tidak perlu external dependencies berat
✅ Cepat dan ringan
✅ Cocok untuk demo/prototype
✅ Mudah di-upgrade ke API eksternal

KEKURANGAN:
❌ Bukan real face recognition (hanya image similarity)
❌ Tidak detect face landmarks
❌ Kurang akurat dibanding deep learning models
❌ Rentan terhadap pose/lighting changes

UPGRADE PATH (Production):
Ganti fungsi ExtractFaceDescriptor dan CompareFaces dengan:
1. Call ke Face++ API / AWS Rekognition
2. Atau call ke Python microservice dengan face_recognition library
3. Return actual face embeddings (128-d atau 512-d vector)
4. Hitung Euclidean distance dari embeddings
*/
