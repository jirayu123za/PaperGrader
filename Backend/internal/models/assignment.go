package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Assignment struct {
	AssignmentID          uuid.UUID        `gorm:"primaryKey"`
	CourseID              uuid.UUID        `gorm:"not null" json:"course_id"`
	AssignmentName        string           `gorm:"type:varchar(255);not null" json:"assignment_name"`
	AssignmentDescription string           `gorm:"type:varchar(255)" json:"assignment_description"`
	SubmissBy             string           `gorm:"type:varchar(50);not null" json:"submiss_by"`
	LateSubmiss           bool             `gorm:"type:boolean;not null" json:"late_submiss"`
	GroupSubmiss          bool             `gorm:"type:boolean;not null" json:"group_submiss"`
	ReleaseDate           time.Time        `gorm:"type:date;not null" json:"release_date"`
	DueDate               time.Time        `gorm:"type:date;not null" json:"due_date"`
	CutOffDate            *time.Time       `gorm:"type:date" json:"cut_off_date"`
	AssignmentFiles       []AssignmentFile `gorm:"foreignKey:AssignmentID"`
	Submissions           []Submission     `gorm:"foreignKey:AssignmentID"`
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

// UnmarshalJSON to handle the date fields in "dd-mm-yyyy" format
func (assignment *Assignment) UnmarshalJSON(data []byte) error {
	type Alias Assignment
	aux := &struct {
		ReleaseDate string `json:"release_date"`
		DueDate     string `json:"due_date"`
		CutOffDate  string `json:"cut_off_date"`
		*Alias
	}{
		Alias: (*Alias)(assignment),
	}

	if err := json.Unmarshal(data, &aux); err != nil {
		return err
	}

	// Mapping of date strings to assignment's date fields
	dateFields := []struct {
		dateStr string
		target  *time.Time
	}{
		{aux.ReleaseDate, &assignment.ReleaseDate},
		{aux.DueDate, &assignment.DueDate},
		{aux.CutOffDate, assignment.CutOffDate},
	}

	// Parse dates and assign to respective fields
	for _, field := range dateFields {
		if field.dateStr != "" {
			parsedDate, err := time.Parse("02-01-2006", field.dateStr)
			if err != nil {
				return err
			}
			*field.target = parsedDate
		}
	}

	return nil
}

func (assignment Assignment) MarshalJSON() ([]byte, error) {
	type Alias Assignment
	return json.Marshal(&struct {
		ReleaseDate string `json:"release_date"`
		DueDate     string `json:"due_date"`
		CutOffDate  string `json:"cut_off_date"`
		*Alias
	}{
		// Format the date fields as "dd-mm-yyyy"
		ReleaseDate: assignment.ReleaseDate.Format("02-01-2006"),
		DueDate:     assignment.DueDate.Format("02-01-2006"),
		CutOffDate: func() string {
			if assignment.CutOffDate != nil {
				return assignment.CutOffDate.Format("02-01-2006")
			}
			return ""
		}(),
		Alias: (*Alias)(&assignment),
	})
}
