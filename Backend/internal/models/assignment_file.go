package models

import (
	"time"

	"gorm.io/gorm"
)

type AssignmentFile struct {
	AssignmentFileID   string `gorm:"primaryKey;autoIncrement"`
	AssignmentID       string `gorm:"not null"`
	AssignmentFileName string `gorm:"type:varchar(255);not null"`
	CreatedAt          time.Time
	UpdatedAt          time.Time
	DeletedAt          gorm.DeletedAt `gorm:"index"`
	Uploads            []Upload       `gorm:"foreignKey:AssignmentFileID"`
}
