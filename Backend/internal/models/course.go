package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Course struct {
	CourseID        uuid.UUID        `gorm:"primaryKey" json:"course_id"`
	CourseName      string           `gorm:"type:varchar(255);not null" json:"course_name"`
	CourseCode      string           `gorm:"type:varchar(255)" json:"course_code"`
	Term            string           `gorm:"type:varchar(50);not null" json:"term"`
	Assignments     []Assignment     `gorm:"foreignKey:CourseID"`
	InstructorLists []InstructorList `gorm:"foreignKey:CourseID"`
	Enrollments     []Enrollment     `gorm:"foreignKey:CourseID"`
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       gorm.DeletedAt `gorm:"index"`
}

func (course *Course) BeforeCreate(tx *gorm.DB) (err error) {
	if course.CourseID == uuid.Nil {
		course.CourseID = uuid.New()
	}
	return
}
