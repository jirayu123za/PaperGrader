package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type University struct {
	UniversityID   uuid.UUID `gorm:"primaryKey" json:"university_id"`
	UniversityName string    `gorm:"type:varchar(255)" json:"university_name"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
	DeletedAt      gorm.DeletedAt `gorm:"index"`
}

func (university *University) BeforeCreate(tx *gorm.DB) (err error) {
	if university.UniversityID == uuid.Nil {
		university.UniversityID = uuid.New()
	}
	return
}
