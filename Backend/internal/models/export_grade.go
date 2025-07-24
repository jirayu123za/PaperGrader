package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type FileStatusEnum string

const (
	FileStatusPending   FileStatusEnum = "pending"
	FileStatusCompleted FileStatusEnum = "completed"
	FileStatusFailed    FileStatusEnum = "failed"
)

type ExportGrade struct {
	ExportGradeID  uuid.UUID      `gorm:"primaryKey"`
	CourseID       uuid.UUID      `gorm:"not null" json:"course_id"`
	AssignmentID   uuid.UUID      `gorm:"not null" json:"assignment_id"`
	PersonalDataID uuid.UUID      `gorm:"not null" json:"personal_data_id"`
	FileName       string         `gorm:"type:varchar(255);not null" json:"file_name"`
	FileStatus     FileStatusEnum `gorm:"type:file_status_enum;not null;index" json:"file_status"`
	FileURL        string         `gorm:"type:varchar(255);not null" json:"file_url"`
	ProcessedAt    *time.Time     `json:"processed_at,omitempty"`
	CreatedAt      time.Time
	UpdatedAt      time.Time
	DeletedAt      gorm.DeletedAt `gorm:"index"`
}

func (exportGrade *ExportGrade) BeforeCreate(tx *gorm.DB) (err error) {
	if exportGrade.ExportGradeID == uuid.Nil {
		exportGrade.ExportGradeID = uuid.New()
	}
	return
}
