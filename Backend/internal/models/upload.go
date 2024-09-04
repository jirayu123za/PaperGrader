package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Upload struct {
	UploadID         string    `gorm:"primaryKey;autoIncrement"`
	UserID           uuid.UUID `gorm:"not null"`
	AssignmentFileID string    `gorm:"not null"`
	CreatedAt        time.Time
	UpdatedAt        time.Time
	DeletedAt        gorm.DeletedAt `gorm:"index"`
}
