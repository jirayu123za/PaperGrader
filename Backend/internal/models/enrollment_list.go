package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type EnrollmentList struct {
	EnrollmentListID uuid.UUID `gorm:"primaryKey"`
	CourseID         uuid.UUID `gorm:"not null"`
	SectionID        uuid.UUID `gorm:"not null"`
	StudentCode      string    `gorm:"type:varchar(50)" json:"student_code"`
	FirstName        string    `gorm:"type:varchar(50)" json:"first_name"`
	LastName         string    `gorm:"type:varchar(50)" json:"last_name"`
	Email            string    `gorm:"type:varchar(50); not null" json:"email"`
	RoleType         string    `gorm:"type:varchar(50); not null" json:"role_type"`
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
