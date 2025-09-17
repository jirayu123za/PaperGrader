package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AssignmentSection struct {
	AssignmentSectionID uuid.UUID  `gorm:"primaryKey" json:"assignment_section_id"`
	AssignmentID        uuid.UUID  `gorm:"not null" json:"assignment_id"`
	SectionID           uuid.UUID  `gorm:"not null" json:"section_id"`
	PublishedGrade      bool       `gorm:"type:boolean;not null;default:false" json:"published_grade"`
	PublishedAssignment bool       `gorm:"type:boolean;not null;default:false" json:"published_assignment"`
	ReleaseDate         *time.Time `gorm:"type:timestamptz" json:"release_date"`
	DueDate             *time.Time `gorm:"type:timestamptz" json:"due_date"`
	CutOffDate          *time.Time `gorm:"type:timestamptz" json:"cut_off_date"`
	CreatedAt           time.Time
	UpdatedAt           time.Time
	DeletedAt           gorm.DeletedAt `gorm:"index"`
}

func (assignmentSection *AssignmentSection) BeforeCreate(tx *gorm.DB) (err error) {
	if assignmentSection.AssignmentSectionID == uuid.Nil {
		assignmentSection.AssignmentSectionID = uuid.New()
	}
	return
}
