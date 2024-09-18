package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AssignmentFile struct {
	AssignmentFileID   uuid.UUID `gorm:"primaryKey"`
	AssignmentID       uuid.UUID `gorm:"not null"`
	AssignmentFileName string    `gorm:"type:varchar(255);not null"`
	CreatedAt          time.Time
	UpdatedAt          time.Time
	DeletedAt          gorm.DeletedAt `gorm:"index"`
	Uploads            []Upload       `gorm:"foreignKey:AssignmentFileID"`
}

func (assignmentFile *AssignmentFile) BeforeCreate(tx *gorm.DB) (err error) {
	if assignmentFile.AssignmentFileID == uuid.Nil {
		assignmentFile.AssignmentFileID = uuid.New()
	}
	return
}
