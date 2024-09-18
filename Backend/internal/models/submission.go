package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Submission struct {
	SubmissionID     uuid.UUID `gorm:"primaryKey"`
	UserID           uuid.UUID `gorm:"not null"`
	AssignmentID     uuid.UUID `gorm:"not null"`
	SubmissionFileID uuid.UUID `gorm:"not null"`
	SubmittedAt      time.Time `gorm:"not null"`
	CreatedAt        time.Time
	UpdatedAt        time.Time
	DeletedAt        gorm.DeletedAt `gorm:"index"`
}

func (submission *Submission) BeforeCreate(tx *gorm.DB) (err error) {
	if submission.SubmissionID == uuid.Nil {
		submission.SubmissionID = uuid.New()
	}
	return
}
