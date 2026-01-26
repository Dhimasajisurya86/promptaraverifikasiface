package handlers

import (
	"attendance-system/internal/config"
	"time"

	"github.com/gofiber/fiber/v2"
)

// HealthHandler handles health check
type HealthHandler struct{}

// NewHealthHandler creates a new HealthHandler
func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

// HealthCheck returns server health status
// GET /api/health
func (h *HealthHandler) HealthCheck(c *fiber.Ctx) error {
	// Check database connection
	db := config.GetDB()
	sqlDB, err := db.DB()
	if err != nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"status":    "error",
			"message":   "Database connection unavailable",
			"timestamp": time.Now(),
		})
	}

	if err := sqlDB.Ping(); err != nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"status":    "error",
			"message":   "Database ping failed",
			"timestamp": time.Now(),
		})
	}

	return c.JSON(fiber.Map{
		"status":    "healthy",
		"message":   "Server is running",
		"database":  "connected",
		"timestamp": time.Now(),
	})
}
