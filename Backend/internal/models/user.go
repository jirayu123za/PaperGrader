package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	UserID     uuid.UUID `gorm:"primaryKey" json:"user_id"`
	GoogleID   string    `gorm:"unique;not null" json:"google_id"`
	GroupID    uint      `gorm:"not null" json:"group_id"`
	FirstName  string    `gorm:"type:varchar(50)" json:"first_name"`
	LastName   string    `gorm:"type:varchar(50)" json:"last_name"`
	Email      string    `gorm:"type:varchar(50);not null" json:"email"`
	BirthDate  time.Time `gorm:"type:date" json:"birth_date"`
	StudentID  string    `gorm:"type:varchar(50)" json:"student_id"`
	University string    `gorm:"type:varchar(50)" json:"university"`
	//ProfileImageURL string    `gorm:"type:varchar(255)" json:"profile_image_url"`
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       gorm.DeletedAt   `gorm:"index"`
	Enrollments     []Enrollment     `gorm:"foreignKey:UserID"`
	InstructorLists []InstructorList `gorm:"foreignKey:UserID"`
	Submissions     []Submission     `gorm:"foreignKey:UserID"`
	Uploads         []Upload         `gorm:"foreignKey:UserID"`
}

func (user *User) BeforeCreate(tx *gorm.DB) (err error) {
	if user.UserID == uuid.Nil {
		user.UserID = uuid.New()
	}
	return
}

// UnmarshalJSON to handle the birth_date in "yyyy-mm-dd" format
func (user *User) UnmarshalJSON(data []byte) error {
	type Alias User
	aux := &struct {
		BirthDate string `json:"birth_date"`
		*Alias
	}{
		Alias: (*Alias)(user),
	}

	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}

	// Parse BirthDate in "yyyy-mm-dd" format
	parsedDate, err := time.Parse("2006-01-02", aux.BirthDate)
	if err != nil {
		return err
	}
	user.BirthDate = parsedDate

	return nil
}
