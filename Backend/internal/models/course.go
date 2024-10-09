package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Course struct {
	CourseID          uuid.UUID        `gorm:"primaryKey" json:"course_id"`
	CourseName        string           `gorm:"type:varchar(255);not null" json:"course_name"`
	CourseDescription string           `gorm:"type:varchar(255)" json:"course_description"`
	CourseCode        string           `gorm:"type:varchar(255)" json:"course_code"`
	Semester          string           `gorm:"type:varchar(50);not null" json:"semester"`
	AcademicYear      string           `gorm:"type:varchar(50);not null" json:"academic_year"`
	EntryCode         bool             `gorm:"type:boolean;not null" json:"entry_code"`
	Assignments       []Assignment     `gorm:"foreignKey:CourseID"`
	InstructorLists   []InstructorList `gorm:"foreignKey:CourseID"`
	Enrollments       []Enrollment     `gorm:"foreignKey:CourseID"`
	CreatedAt         time.Time
	UpdatedAt         time.Time
	DeletedAt         gorm.DeletedAt `gorm:"index"`
}

func (course *Course) BeforeCreate(tx *gorm.DB) (err error) {
	if course.CourseID == uuid.Nil {
		course.CourseID = uuid.New()
	}
	return
}
