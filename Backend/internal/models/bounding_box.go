package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BoundingBoxType string

const (
	NameRegion     BoundingBoxType = "name"
	IDRegion       BoundingBoxType = "id"
	QuestionRegion BoundingBoxType = "question"
)

type BoundingBox struct {
	BoundingBoxID       uuid.UUID       `gorm:"primaryKey" json:"bounding_box_id"`
	AssignmentID        uuid.UUID       `gorm:"not null" json:"assignment_id"`
	BoundingBoxPosition string          `gorm:"type:box;not null" json:"bounding_box_position"`
	BoundingBoxType     BoundingBoxType `gorm:"type:bounding_box_type_enum;not null" json:"bounding_box_type"`
	BoundingBoxPage     uint            `gorm:"not null" json:"bounding_box_page"`
	CreatedAt           time.Time
	UpdatedAt           time.Time
	DeletedAt           gorm.DeletedAt `gorm:"index"`
}

func (bounding_box *BoundingBox) BeforeCreate(tx *gorm.DB) (err error) {
	if bounding_box.BoundingBoxID == uuid.Nil {
		bounding_box.BoundingBoxID = uuid.New()
	}
	return
}
