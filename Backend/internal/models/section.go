package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Section struct {
	SectionID          uuid.UUID           `gorm:"primaryKey" json:"section_id"`
	CourseID           uuid.UUID           `gorm:"not null" json:"course_id"`
	EnrollmentLists    []EnrollmentList    `gorm:"foreignKey:SectionID"`
	AssignmentSections []AssignmentSection `gorm:"foreignKey:SectionID"`
	SectionName        string              `gorm:"type:varchar(50);not null" json:"section_name"`
	CreatedAt          time.Time
	UpdatedAt          time.Time
	DeletedAt          gorm.DeletedAt `gorm:"index"`
}

func (section *Section) BeforeCreate(tx *gorm.DB) (err error) {
	if section.SectionID == uuid.Nil {
		section.SectionID = uuid.New()
	}
	return
}
