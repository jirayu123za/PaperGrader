package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Submission struct {
	SubmissionID       uuid.UUID       `gorm:"primaryKey"`
	SubmittedBy        uuid.UUID       `gorm:"not null" json:"user_id"`
	BelongsTo          uuid.NullUUID   `json:"personal_data_id"`
	AssignmentID       uuid.UUID       `gorm:"not null" json:"assignment_id"`
	SubmissionFileName string          `gorm:"not null" json:"submission_file_name"`
	SubmittedAt        time.Time       `gorm:"not null" json:"submitted_at"`
	SubmissionBox      []SubmissionBox `gorm:"foreignKey:SubmissionID"`
	CreatedAt          time.Time
	UpdatedAt          time.Time
	DeletedAt          gorm.DeletedAt `gorm:"index"`
}

func (submission *Submission) BeforeCreate(tx *gorm.DB) (err error) {
	if submission.SubmissionID == uuid.Nil {
		submission.SubmissionID = uuid.New()
	}
	return
}
