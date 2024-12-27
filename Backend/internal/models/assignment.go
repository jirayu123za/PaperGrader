package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Assignment struct {
	AssignmentID          uuid.UUID           `gorm:"primaryKey"`
	CourseID              uuid.UUID           `gorm:"not null" json:"course_id"`
	AssignmentName        string              `gorm:"type:varchar(255);not null" json:"assignment_name"`
	AssignmentDescription string              `gorm:"type:varchar(255)" json:"assignment_description"`
	SubmissBy             string              `gorm:"type:varchar(50);not null" json:"submiss_by"`
	GradingType           string              `gorm:"type:varchar(50);not null;default:'negative'" json:"grading_type"`
	LateSubmiss           bool                `gorm:"type:boolean;not null" json:"late_submiss"`
	GroupSubmiss          bool                `gorm:"type:boolean;not null" json:"group_submiss"`
	Published             bool                `gorm:"type:boolean;not null" json:"published"`
	Regrades              bool                `gorm:"type:boolean;not null" json:"regrades"`
	AssignmentFiles       []AssignmentFile    `gorm:"foreignKey:AssignmentID"`
	Submissions           []Submission        `gorm:"foreignKey:AssignmentID"`
	AssignmentSections    []AssignmentSection `gorm:"foreignKey:AssignmentID"`
	BoundingBoxes         []BoundingBox       `gorm:"foreignKey:AssignmentID"`
	CreatedAt             time.Time
	UpdatedAt             time.Time
	DeletedAt             gorm.DeletedAt `gorm:"index"`
}

func (assignment *Assignment) BeforeCreate(tx *gorm.DB) (err error) {
	if assignment.AssignmentID == uuid.Nil {
		assignment.AssignmentID = uuid.New()
	}
	return
}
