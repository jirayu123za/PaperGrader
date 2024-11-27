package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EnrollmentList struct {
	EnrollmentListID uuid.UUID  `gorm:"primaryKey"`
	CourseID         uuid.UUID  `gorm:"not null"`
	SectionID        *uuid.UUID `gorm:"null"`
	PersonalDataID   uuid.UUID  `gorm:"not null"`
	CreatedAt        time.Time
	UpdatedAt        time.Time
	DeletedAt        gorm.DeletedAt `gorm:"index"`
}

func (enrollmentList *EnrollmentList) BeforeCreate(tx *gorm.DB) (err error) {
	if enrollmentList.EnrollmentListID == uuid.Nil {
		enrollmentList.EnrollmentListID = uuid.New()
	}
	return
}
