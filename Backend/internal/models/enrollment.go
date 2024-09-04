package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Enrollment struct {
	EnrollmentID int       `gorm:"primaryKey;autoIncrement"`
	UserID       uuid.UUID `gorm:"not null"`
	CourseID     string    `gorm:"not null"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
	DeletedAt    gorm.DeletedAt `gorm:"index"`
}
