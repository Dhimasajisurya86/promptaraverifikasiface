package main

import (
	"attendance-system/internal/config"
	"attendance-system/internal/routes"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/gofiber/fiber/v2"
)

func main() {
	// ASCII Art Banner
	printBanner()

	// Load configuration
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("❌ Failed to load configuration: %v", err)
	}
	log.Println("✅ Configuration loaded")

	// Initialize database
	_, err = config.InitDatabase(&cfg.Database)
	if err != nil {
		log.Fatalf("❌ Failed to initialize database: %v", err)
	}

	// Create upload directory
	if err := os.MkdirAll(cfg.Upload.Path, os.ModePerm); err != nil {
		log.Fatalf("❌ Failed to create upload directory: %v", err)
	}
	log.Printf("✅ Upload directory ready: %s", cfg.Upload.Path)

	// Initialize Fiber app
	app := fiber.New(fiber.Config{
		AppName:      "Attendance System API",
		ServerHeader: "Fiber",
		ErrorHandler: customErrorHandler,
	})

	// Setup routes
	routes.SetupRoutes(app)
	log.Println("✅ Routes configured")

	// Server address
	addr := fmt.Sprintf(":%s", cfg.Server.Port)

	// Graceful shutdown
	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
		<-sigChan

		log.Println("\n🛑 Shutting down server...")
		if err := app.Shutdown(); err != nil {
			log.Printf("❌ Error during shutdown: %v", err)
		}
	}()

	// Start server
	log.Printf("🚀 Server starting on http://localhost%s", addr)
	log.Printf("📡 Health check: http://localhost%s/api/health", addr)
	log.Printf("📚 API Documentation:")
	log.Printf("   - POST /api/employees/register (Register employee)")
	log.Printf("   - GET  /api/employees (Get all employees)")
	log.Printf("   - POST /api/attendance/checkin (Check-in with face verification)")
	log.Printf("   - GET  /api/attendance (Get attendance history)")
	
	if err := app.Listen(addr); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}

// customErrorHandler handles Fiber errors
func customErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError

	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
	}

	return c.Status(code).JSON(fiber.Map{
		"status":  "error",
		"message": err.Error(),
	})
}

// printBanner prints ASCII art banner
func printBanner() {
	banner := `
╔═══════════════════════════════════════════════╗
║   FACE VERIFICATION ATTENDANCE SYSTEM         ║
║   Backend Server - Golang + Fiber            ║
╚═══════════════════════════════════════════════╝
`
	fmt.Println(banner)
}
