package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Upload struct {
	UploadID         uuid.UUID `gorm:"primaryKey"`
	UserID           uuid.UUID `gorm:"not null"`
	AssignmentFileID uuid.UUID `gorm:"not null"`
	CreatedAt        time.Time
	UpdatedAt        time.Time
	DeletedAt        gorm.DeletedAt `gorm:"index"`
}

func (upload *Upload) BeforeCreate(tx *gorm.DB) (err error) {
	if upload.UploadID == uuid.Nil {
		upload.UploadID = uuid.New()
	}
	return
}
