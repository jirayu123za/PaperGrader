package models

import (
	"time"

	"gorm.io/gorm"
)

type Course struct {
	CourseID          string           `gorm:"primaryKey;autoIncrement"`
	CourseName        string           `gorm:"type:varchar(255);not null"`
	CourseDescription string           `gorm:"type:varchar(255)"`
	Term              string           `gorm:"type:varchar(50);not null"`
	Assignments       []Assignment     `gorm:"foreignKey:CourseID"`
	InstructorLists   []InstructorList `gorm:"foreignKey:CourseID"`
	Enrollments       []Enrollment     `gorm:"foreignKey:CourseID"`
	CreatedAt         time.Time
	UpdatedAt         time.Time
	DeletedAt         gorm.DeletedAt `gorm:"index"`
}
