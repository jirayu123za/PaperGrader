package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PersonalData struct {
	PersonalDataID uuid.UUID        `gorm:"primaryKey"`
	StudentCode    *string          `gorm:"type:varchar(50)" json:"student_code"`
	FirstName      string           `gorm:"type:varchar(50)" json:"first_name"`
	LastName       string           `gorm:"type:varchar(50)" json:"last_name"`
	Email          string           `gorm:"type:varchar(50); not null" json:"email"`
	RoleType       string           `gorm:"type:varchar(50); not null" json:"role_type"`
	EnrollmentList []EnrollmentList `gorm:"foreignKey:PersonalDataID"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
	DeletedAt      gorm.DeletedAt `gorm:"index"`
}

func (personalData *PersonalData) BeforeCreate(tx *gorm.DB) (err error) {
	if personalData.PersonalDataID == uuid.Nil {
		personalData.PersonalDataID = uuid.New()
	}
	return
}
