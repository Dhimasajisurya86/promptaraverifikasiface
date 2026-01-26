package handlers

import (
	"attendance-system/internal/config"
	"attendance-system/internal/models"
	"attendance-system/internal/services"
	"attendance-system/internal/utils"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
)

// AttendanceHandler handles attendance-related requests
type AttendanceHandler struct {
	faceService *services.FaceService
}

// NewAttendanceHandler creates a new AttendanceHandler
func NewAttendanceHandler() *AttendanceHandler {
	return &AttendanceHandler{
		faceService: services.NewFaceService(),
	}
}

// CheckIn handles employee check-in dengan face verification
// POST /api/attendance/checkin
// Form data: user_id, selfie_image (file)
func (h *AttendanceHandler) CheckIn(c *fiber.Ctx) error {
	// Parse user_id
	userID := c.FormValue("user_id")
	if userID == "" {
		return utils.BadRequestResponse(c, "User ID is required")
	}

	// Get uploaded selfie
	selfieImage, err := c.FormFile("selfie_image")
	if err != nil {
		return utils.BadRequestResponse(c, "Selfie image is required")
	}

	// Get user dari database
	db := config.GetDB()
	var user models.User
	if err := db.First(&user, userID).Error; err != nil {
		return utils.NotFoundResponse(c, "Employee not found")
	}

	// Save selfie image
	selfiePath, err := utils.SaveUploadedFile(selfieImage, config.AppConfig.Upload.Path)
	if err != nil {
		log.Printf("Error saving selfie: %v", err)
		return utils.InternalServerErrorResponse(c, "Failed to save selfie image")
	}

	// Verify face
	threshold := config.AppConfig.Face.SimilarityThreshold
	isMatch, similarity, err := h.faceService.VerifyFace(selfiePath, user.FaceDescriptor, threshold)
	if err != nil {
		log.Printf("Error verifying face: %v", err)
		return utils.InternalServerErrorResponse(c, "Failed to verify face")
	}

	// Determine status
	status := models.AttendanceStatusFailed
	if isMatch {
		status = models.AttendanceStatusSuccess
	}

	// Create attendance record
	attendance := models.Attendance{
		UserID:          user.ID,
		CheckInTime:     time.Now(),
		FaceImagePath:   selfiePath,
		SimilarityScore: similarity,
		Status:          status,
	}

	if err := db.Create(&attendance).Error; err != nil {
		log.Printf("Error creating attendance: %v", err)
		return utils.InternalServerErrorResponse(c, "Failed to record attendance")
	}

	// Load user relation untuk response
	db.Model(&attendance).Association("User").Find(&attendance.User)

	log.Printf("✅ Check-in: %s (ID: %d) - Status: %s, Similarity: %.2f%%",
		user.Name, user.ID, status, similarity*100)

	// Return response dengan verification result
	responseData := map[string]interface{}{
		"attendance":        attendance.ToResponse(),
		"verification":      isMatch,
		"similarity_score":  similarity,
		"threshold":         threshold,
		"message":           h.getVerificationMessage(isMatch, similarity),
	}

	return utils.CreatedResponse(c, "Check-in processed", responseData)
}

// GetAttendances returns attendance history
// GET /api/attendance
// Query params: user_id (optional), limit (optional)
func (h *AttendanceHandler) GetAttendances(c *fiber.Ctx) error {
	db := config.GetDB()
	query := db.Preload("User")

	// Filter by user_id jika ada
	if userID := c.Query("user_id"); userID != "" {
		query = query.Where("user_id = ?", userID)
	}

	// Limit results
	limit := c.QueryInt("limit", 50)
	query = query.Limit(limit)

	// Order by latest
	query = query.Order("check_in_time DESC")

	var attendances []models.Attendance
	if err := query.Find(&attendances).Error; err != nil {
		log.Printf("Error fetching attendances: %v", err)
		return utils.InternalServerErrorResponse(c, "Failed to fetch attendance records")
	}

	// Convert to response format
	responses := make([]models.AttendanceResponse, len(attendances))
	for i, attendance := range attendances {
		responses[i] = attendance.ToResponse()
	}

	return utils.SuccessResponse(c, "Attendance records fetched successfully", responses)
}

// GetTodayAttendance returns today's attendance for a user
// GET /api/attendance/today/:user_id
func (h *AttendanceHandler) GetTodayAttendance(c *fiber.Ctx) error {
	userID := c.Params("user_id")

	db := config.GetDB()
	
	// Get today's start time (00:00:00)
	now := time.Now()
	startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	var attendance models.Attendance
	err := db.Preload("User").
		Where("user_id = ? AND check_in_time >= ?", userID, startOfDay).
		Where("status = ?", models.AttendanceStatusSuccess).
		Order("check_in_time DESC").
		First(&attendance).Error

	if err != nil {
		return utils.NotFoundResponse(c, "No attendance record found for today")
	}

	return utils.SuccessResponse(c, "Today's attendance fetched successfully", attendance.ToResponse())
}

// getVerificationMessage returns user-friendly message based on verification result
func (h *AttendanceHandler) getVerificationMessage(isMatch bool, similarity float64) string {
	if isMatch {
		return "✅ Face verified successfully! Check-in recorded."
	}
	return "❌ Face verification failed. Similarity score too low."
}
