package handlers

import (
	"attendance-system/internal/config"
	"attendance-system/internal/models"
	"attendance-system/internal/services"
	"attendance-system/internal/utils"
	"log"

	"github.com/gofiber/fiber/v2"
)

// UserHandler handles user-related requests
type UserHandler struct {
	faceService *services.FaceService
}

// NewUserHandler creates a new UserHandler
func NewUserHandler() *UserHandler {
	return &UserHandler{
		faceService: services.NewFaceService(),
	}
}

// RegisterEmployee handles employee registration
// POST /api/employees/register
// Form data: name, email, phone, face_image (file)
func (h *UserHandler) RegisterEmployee(c *fiber.Ctx) error {
	// Parse form data
	name := c.FormValue("name")
	email := c.FormValue("email")
	phone := c.FormValue("phone")

	// Validate required fields
	if name == "" || email == "" {
		return utils.BadRequestResponse(c, "Name and email are required")
	}

	// Get uploaded file
	faceImage, err := c.FormFile("face_image")
	if err != nil {
		return utils.BadRequestResponse(c, "Face image is required")
	}

	// Save uploaded file
	imagePath, err := utils.SaveUploadedFile(faceImage, config.AppConfig.Upload.Path)
	if err != nil {
		log.Printf("Error saving file: %v", err)
		return utils.InternalServerErrorResponse(c, "Failed to save face image")
	}

	// Extract face descriptor
	faceDescriptor, err := h.faceService.ExtractFaceDescriptor(imagePath)
	if err != nil {
		// Cleanup uploaded file jika gagal extract
		utils.DeleteFile(imagePath)
		log.Printf("Error extracting face descriptor: %v", err)
		return utils.InternalServerErrorResponse(c, "Failed to process face image")
	}

	// Create user record
	user := models.User{
		Name:           name,
		Email:          email,
		Phone:          phone,
		FaceImagePath:  imagePath,
		FaceDescriptor: faceDescriptor,
	}

	// Save to database
	db := config.GetDB()
	if err := db.Create(&user).Error; err != nil {
		// Cleanup uploaded file jika gagal save
		utils.DeleteFile(imagePath)
		log.Printf("Error creating user: %v", err)
		return utils.InternalServerErrorResponse(c, "Failed to register employee")
	}

	log.Printf("✅ Employee registered: %s (ID: %d)", user.Name, user.ID)

	return utils.CreatedResponse(c, "Employee registered successfully", user.ToResponse())
}

// GetEmployees returns list of all employees
// GET /api/employees
func (h *UserHandler) GetEmployees(c *fiber.Ctx) error {
	var users []models.User
	db := config.GetDB()

	if err := db.Find(&users).Error; err != nil {
		log.Printf("Error fetching employees: %v", err)
		return utils.InternalServerErrorResponse(c, "Failed to fetch employees")
	}

	// Convert to response format
	responses := make([]models.UserResponse, len(users))
	for i, user := range users {
		responses[i] = user.ToResponse()
	}

	return utils.SuccessResponse(c, "Employees fetched successfully", responses)
}

// GetEmployee returns single employee by ID
// GET /api/employees/:id
func (h *UserHandler) GetEmployee(c *fiber.Ctx) error {
	id := c.Params("id")

	var user models.User
	db := config.GetDB()

	if err := db.First(&user, id).Error; err != nil {
		return utils.NotFoundResponse(c, "Employee not found")
	}

	return utils.SuccessResponse(c, "Employee fetched successfully", user.ToResponse())
}
