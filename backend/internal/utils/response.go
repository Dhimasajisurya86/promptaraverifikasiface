package utils

import "github.com/gofiber/fiber/v2"

// APIResponse is the standard response structure
type APIResponse struct {
	Status  string      `json:"status"`  // "success" or "error"
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// SuccessResponse sends success response
func SuccessResponse(c *fiber.Ctx, message string, data interface{}) error {
	return c.Status(fiber.StatusOK).JSON(APIResponse{
		Status:  "success",
		Message: message,
		Data:    data,
	})
}

// CreatedResponse sends created response (201)
func CreatedResponse(c *fiber.Ctx, message string, data interface{}) error {
	return c.Status(fiber.StatusCreated).JSON(APIResponse{
		Status:  "success",
		Message: message,
		Data:    data,
	})
}

// ErrorResponse sends error response
func ErrorResponse(c *fiber.Ctx, statusCode int, message string) error {
	return c.Status(statusCode).JSON(APIResponse{
		Status:  "error",
		Message: message,
	})
}

// BadRequestResponse sends bad request error (400)
func BadRequestResponse(c *fiber.Ctx, message string) error {
	return ErrorResponse(c, fiber.StatusBadRequest, message)
}

// NotFoundResponse sends not found error (404)
func NotFoundResponse(c *fiber.Ctx, message string) error {
	return ErrorResponse(c, fiber.StatusNotFound, message)
}

// InternalServerErrorResponse sends internal server error (500)
func InternalServerErrorResponse(c *fiber.Ctx, message string) error {
	return ErrorResponse(c, fiber.StatusInternalServerError, message)
}
