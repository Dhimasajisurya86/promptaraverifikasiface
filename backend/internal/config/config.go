package config

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

// Config holds all application configuration
type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Upload   UploadConfig
	Face     FaceConfig
}

// ServerConfig holds server settings
type ServerConfig struct {
	Port string
}

// DatabaseConfig holds database connection settings
type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

// UploadConfig holds file upload settings
type UploadConfig struct {
	Path string
}

// FaceConfig holds face verification settings
type FaceConfig struct {
	SimilarityThreshold float64
}

// AppConfig is the global configuration instance
var AppConfig *Config

// LoadConfig loads configuration from environment variables
func LoadConfig() (*Config, error) {
	// Load .env file if exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Parse face similarity threshold
	thresholdStr := getEnv("FACE_SIMILARITY_THRESHOLD", "0.6")
	threshold, err := strconv.ParseFloat(thresholdStr, 64)
	if err != nil {
		threshold = 0.6
	}

	config := &Config{
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", "8080"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "postgres"),
			DBName:   getEnv("DB_NAME", "attendance_db"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		Upload: UploadConfig{
			Path: getEnv("UPLOAD_PATH", "./uploads"),
		},
		Face: FaceConfig{
			SimilarityThreshold: threshold,
		},
	}

	AppConfig = config
	return config, nil
}

// GetDSN returns PostgreSQL connection string
func (c *DatabaseConfig) GetDSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.DBName, c.SSLMode,
	)
}

// getEnv reads environment variable or returns default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
