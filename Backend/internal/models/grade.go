package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Grade struct {
	GradeID      uuid.UUID      `gorm:"primaryKey" json:"grade_id"`
	SubmissionID uuid.UUID      `gorm:"not null" json:"submission_id"`
	GradeData    datatypes.JSON `gorm:"type:jsonb;" json:"grade_data"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
	DeletedAt    gorm.DeletedAt `gorm:"index"`
}

func (grade *Grade) BeforeCreate(tx *gorm.DB) (err error) {
	if grade.GradeID == uuid.Nil {
		grade.GradeID = uuid.New()
	}
	return
}
