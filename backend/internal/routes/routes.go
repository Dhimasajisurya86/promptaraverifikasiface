package routes

import (
	"attendance-system/internal/handlers"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

// SetupRoutes configures all application routes
func SetupRoutes(app *fiber.App) {
	// Middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	// Initialize handlers
	healthHandler := handlers.NewHealthHandler()
	userHandler := handlers.NewUserHandler()
	attendanceHandler := handlers.NewAttendanceHandler()

	// API routes
	api := app.Group("/api")

	// Health check
	api.Get("/health", healthHandler.HealthCheck)

	// Employee routes
	employees := api.Group("/employees")
	employees.Post("/register", userHandler.RegisterEmployee)
	employees.Get("/", userHandler.GetEmployees)
	employees.Get("/:id", userHandler.GetEmployee)

	// Attendance routes
	attendance := api.Group("/attendance")
	attendance.Post("/checkin", attendanceHandler.CheckIn)
	attendance.Get("/", attendanceHandler.GetAttendances)
	attendance.Get("/today/:user_id", attendanceHandler.GetTodayAttendance)

	// Serve static files (uploaded images)
	app.Static("/uploads", "./uploads")

	// 404 handler
	app.Use(func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  "error",
			"message": "Route not found",
		})
	})
}
