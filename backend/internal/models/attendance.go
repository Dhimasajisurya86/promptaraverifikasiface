package models

import (
	"time"
)

// Attendance represents check-in record
type Attendance struct {
	ID              uint      `json:"id" gorm:"primaryKey"`
	UserID          uint      `json:"user_id" gorm:"not null;index"`
	CheckInTime     time.Time `json:"check_in_time" gorm:"not null"`
	FaceImagePath   string    `json:"face_image_path"` // Selfie photo saat check-in
	SimilarityScore float64   `json:"similarity_score"` // Confidence score dari face matching (0.0 - 1.0)
	Status          string    `json:"status" gorm:"type:varchar(20);not null"` // success/failed
	CreatedAt       time.Time `json:"created_at"`
	
	// Relationship
	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// TableName specifies the table name for Attendance model
func (Attendance) TableName() string {
	return "attendances"
}

// AttendanceResponse is the response struct with user info
type AttendanceResponse struct {
	ID              uint         `json:"id"`
	UserID          uint         `json:"user_id"`
	UserName        string       `json:"user_name"`
	CheckInTime     time.Time    `json:"check_in_time"`
	FaceImagePath   string       `json:"face_image_path"`
	SimilarityScore float64      `json:"similarity_score"`
	Status          string       `json:"status"`
	CreatedAt       time.Time    `json:"created_at"`
}

// ToResponse converts Attendance to AttendanceResponse
func (a *Attendance) ToResponse() AttendanceResponse {
	userName := ""
	if a.User.ID != 0 {
		userName = a.User.Name
	}
	
	return AttendanceResponse{
		ID:              a.ID,
		UserID:          a.UserID,
		UserName:        userName,
		CheckInTime:     a.CheckInTime,
		FaceImagePath:   a.FaceImagePath,
		SimilarityScore: a.SimilarityScore,
		Status:          a.Status,
		CreatedAt:       a.CreatedAt,
	}
}

// Status constants
const (
	AttendanceStatusSuccess = "success"
	AttendanceStatusFailed  = "failed"
)
