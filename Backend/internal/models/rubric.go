package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Rubric struct {
	RubricID     uuid.UUID              `gorm:"primaryKey" json:"rubric_id"`
	AssignmentID uuid.UUID              `gorm:"not null" json:"assignment_id"`
	RubricData   map[string]interface{} `gorm:"type:jsonb;not null" json:"rubric_data"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
	DeletedAt    gorm.DeletedAt `gorm:"index"`
}

func (rubric *Rubric) BeforeCreate(tx *gorm.DB) (err error) {
	if rubric.RubricID == uuid.Nil {
		rubric.RubricID = uuid.New()
	}
	return
}
