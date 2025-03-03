package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SubmissionBox struct {
	SubmissionBoxID       uuid.UUID `gorm:"primaryKey"`
	SubmissionID          uuid.UUID `gorm:"not null" json:"submission_id"`
	SubmissionBoxFileName string    `gorm:"not null" json:"submission_box_file_name"`
	CreatedAt             time.Time
	UpdatedAt             time.Time
	DeletedAt             gorm.DeletedAt `gorm:"index"`
}

func (submissionBox *SubmissionBox) BeforeCreate(tx *gorm.DB) (err error) {
	if submissionBox.SubmissionBoxID == uuid.Nil {
		submissionBox.SubmissionBoxID = uuid.New()
	}
	return
}
