package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Question struct {
	QuestionID   uuid.UUID              `gorm:"primaryKey" json:"question_id"`
	QuestionData map[string]interface{} `gorm:"type:jsonb;not null" json:"question_data"`
	CreatedAt    time.Time
	UpdatedAt    time.Time
	DeletedAt    gorm.DeletedAt `gorm:"index"`
}

func (question *Question) BeforeCreate(tx *gorm.DB) (err error) {
	if question.QuestionID == uuid.Nil {
		question.QuestionID = uuid.New()
	}
	return
}
