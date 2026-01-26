package models

import (
	"time"
)

// User represents employee data in the system
type User struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	Name            string    `json:"name" gorm:"not null"`
	Email           string    `json:"email" gorm:"uniqueIndex;not null"`
	Phone           string    `json:"phone"`
	FaceImagePath   string    `json:"face_image_path" gorm:"not null"` // Path to reference face photo
	FaceDescriptor  string    `json:"-" gorm:"type:text"`              // JSON string storing face embedding/hash
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
	
	// Relationship: One user has many attendance records
	Attendances []Attendance `json:"attendances,omitempty" gorm:"foreignKey:UserID"`
}

// TableName specifies the table name for User model
func (User) TableName() string {
	return "users"
}

// UserResponse is the response struct without sensitive data
type UserResponse struct {
	ID            uint      `json:"id"`
	Name          string    `json:"name"`
	Email         string    `json:"email"`
	Phone         string    `json:"phone"`
	FaceImagePath string    `json:"face_image_path"`
	CreatedAt     time.Time `json:"created_at"`
}

// ToResponse converts User to UserResponse
func (u *User) ToResponse() UserResponse {
	return UserResponse{
		ID:            u.ID,
		Name:          u.Name,
		Email:         u.Email,
		Phone:         u.Phone,
		FaceImagePath: u.FaceImagePath,
		CreatedAt:     u.CreatedAt,
	}
}
